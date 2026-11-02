import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bike,
  Car,
  ChevronDown,
  Clock,
  Filter,
  Heart,
  IndianRupee,
  Loader2,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import { PartImage } from '../../components/ui/PartImage';
import { PullToRefresh } from '../../components/ui/PullToRefresh';
import {
  EmptyState,
  ErrorState,
  ProductCardSkeleton,
  ProductGridSkeleton,
} from '../../components/ui/StateDisplay';
import { useCommerce } from '../../context/CommerceContext';
import { triggerHaptic } from '../../services/haptics';
import {
  getSubCategories,
  searchProducts,
} from '../../services/motosparApi';
import {
  ProductItem,
  SubCategoryItem,
} from '../../types/motospar';

export type VehicleType = 'CAR' | 'BIKE';

interface StorefrontViewProps {
  vehicleType: VehicleType;
  onSelectVehicleType: (type: VehicleType) => void;
  onOpenProductDetail: (productId: string) => void;
}

const PAGE_SIZE = 15;
const RECENT_SEARCHES_STORAGE_KEY = '@motospar_recent_searches';
const MAX_RECENT_SEARCHES = 8;

export interface RecentSearchEntry {
  id: string;
  label: string;
  brand: string;
  model: string;
  year: string;
  categoryId: string;
  subCategoryId: string;
  minPrice: string;
  maxPrice: string;
  timestamp: string;
}

function loadRecentSearchesFromStorage(): RecentSearchEntry[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRecentSearchesToStorage(entries: RecentSearchEntry[]): void {
  try {
    localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Ignore storage quota errors
  }
}

function extractPrimaryImage(product: ProductItem): string | null {
  if (typeof product.image === 'string' && product.image) return product.image;
  if (typeof product.thumbnail === 'string' && product.thumbnail)
    return product.thumbnail;
  if (Array.isArray(product.images) && product.images.length > 0) {
    const first = product.images[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object') {
      return first.image || first.url || first.image_url || null;
    }
  }
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    const firstVar = product.variants[0];
    if (typeof firstVar.image === 'string' && firstVar.image)
      return firstVar.image;
    if (Array.isArray(firstVar.images) && firstVar.images.length > 0) {
      const img = firstVar.images[0];
      if (typeof img === 'string') return img;
      if (img && typeof img === 'object') {
        return img.image || img.url || img.image_url || null;
      }
    }
  }
  return null;
}

function extractProductPrice(product: ProductItem): number | null {
  // A bad discounted price must never fall back to the undiscounted listing
  // price; doing so would misrepresent what checkout will charge.
  const primaryDiscounted = product.variants?.[0]?.discounted_price;
  if (primaryDiscounted !== undefined && primaryDiscounted !== null && primaryDiscounted !== '') {
    const discounted = Number(primaryDiscounted);
    return Number.isFinite(discounted) && discounted >= 0 ? discounted : null;
  }
  const candidates = [
    product.discounted_price,
    product.selling_price,
    product.price,
    product.final_listing_price_on_motospar,
    product.variants?.[0]?.discounted_price,
    product.variants?.[0]?.selling_price,
    product.variants?.[0]?.price,
    product.variants?.[0]?.final_listing_price_on_motospar,
  ];
  for (const val of candidates) {
    if (val !== undefined && val !== null && val !== '') {
      const num = Number(val);
      if (Number.isFinite(num) && num >= 0) return num;
    }
  }
  return null;
}

function extractProductVariantId(product: ProductItem): string | undefined {
  if (typeof product.variant_id === 'string' && product.variant_id) {
    return product.variant_id;
  }
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants[0].id || product.variants[0].variant_id;
  }
  return product.id;
}

export const StorefrontView: React.FC<StorefrontViewProps> = ({
  vehicleType,
  onSelectVehicleType,
  onOpenProductDetail,
}) => {
  const { toggleWishlist, isVariantWishlisted } = useCommerce();

  // Search fields matching POST /api/products/search/.
  // The visible keyword field searches product name, brand, model, description,
  // and category; structured filters remain separate.
  const [categoryId, setCategoryId] = useState<string>('');
  const [subCategoryId, setSubCategoryId] = useState<string>('');
  const [brand, setBrand] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [showPriceFilters, setShowPriceFilters] = useState<boolean>(false);
  const [showFiltersDrawer, setShowFiltersDrawer] = useState<boolean>(false);

  // Recent searches dropdown state
  const [recentSearches, setRecentSearches] = useState<RecentSearchEntry[]>(
    () => loadRecentSearchesFromStorage()
  );
  const [showRecentDropdown, setShowRecentDropdown] = useState<boolean>(false);
  const searchFormContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchFormContainerRef.current &&
        !searchFormContainerRef.current.contains(event.target as Node)
      ) {
        setShowRecentDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Subcategories state (GET /api/sub-categories/{categoryId}/)
  const [subCategories, setSubCategories] = useState<SubCategoryItem[]>([]);
  const [subCategoriesLoading, setSubCategoriesLoading] =
    useState<boolean>(false);
  const [subCategoriesError, setSubCategoriesError] = useState<string | null>(
    null
  );
  const [categoryLookupInput, setCategoryLookupInput] = useState<string>('');

  // Products state (POST /api/products/search/)
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [offset, setOffset] = useState<number>(0);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [wishlistBusyId, setWishlistBusyId] = useState<string | null>(null);

  // Load subcategories when a categoryId is provided
  const loadSubCategoriesForCategory = useCallback(async (catId: string) => {
    const trimmed = catId.trim();
    if (!trimmed) {
      setSubCategories([]);
      setSubCategoriesError(null);
      return;
    }
    setSubCategoriesLoading(true);
    setSubCategoriesError(null);
    try {
      const res = await getSubCategories(trimmed);
      if (res.ok && res.data) {
        const list =
          res.data.subcategories ||
          res.data.sub_categories ||
          (Array.isArray(res.data)
            ? (res.data as unknown as SubCategoryItem[])
            : []);
        setSubCategories(Array.isArray(list) ? list : []);
      } else {
        setSubCategories([]);
        setSubCategoriesError(res.message);
      }
    } finally {
      setSubCategoriesLoading(false);
    }
  }, []);

  // Load paginated products from POST /api/products/search/
  const executeProductSearch = useCallback(
    async (
      targetOffset: number,
      append: boolean,
      overrides?: Partial<{
        categoryId: string;
        subCategoryId: string;
        brand: string;
        model: string;
        year: string;
        minPrice: string;
        maxPrice: string;
      }>
    ) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setProductsLoading(true);
      }
      setProductsError(null);

      const activeCategoryId = overrides?.categoryId ?? categoryId;
      const activeSubCategoryId = overrides?.subCategoryId ?? subCategoryId;
      const activeBrand = overrides?.brand ?? brand;
      const activeModel = overrides?.model ?? model;
      const activeYear = overrides?.year ?? year;
      const activeMinPrice = overrides?.minPrice ?? minPrice;
      const activeMaxPrice = overrides?.maxPrice ?? maxPrice;

      try {
        const parsedMin =
          activeMinPrice.trim() !== '' && !Number.isNaN(Number(activeMinPrice))
            ? Number(activeMinPrice)
            : '';
        const parsedMax =
          activeMaxPrice.trim() !== '' && !Number.isNaN(Number(activeMaxPrice))
            ? Number(activeMaxPrice)
            : '';

        const res = await searchProducts({
          limit: PAGE_SIZE,
          offset: targetOffset,
          brand: '',
          category_id: activeCategoryId.trim(),
          sub_category_id: activeSubCategoryId.trim(),
          search: activeBrand.trim(),
          model: activeModel.trim(),
          year: activeYear.trim(),
          min_price: parsedMin,
          max_price: parsedMax,
        });

        if (res.ok && res.data) {
          const list =
            res.data.products ||
            res.data.results ||
            (Array.isArray(res.data)
              ? (res.data as unknown as ProductItem[])
              : []);
          const safeList = Array.isArray(list) ? list : [];

          setProducts((prev) => (append ? [...prev, ...safeList] : safeList));
          setHasNext(Boolean(res.data.has_next));
          setOffset(targetOffset);

          // If categoryId wasn't manually set yet and products contain a category_id,
          // populate categoryLookupInput so the user can load its subcategories with 1 tap
          if (!activeCategoryId && safeList.length > 0) {
            const discoveredCat =
              safeList[0].category_id ||
              (typeof safeList[0].category === 'string'
                ? safeList[0].category
                : '');
            if (discoveredCat && !categoryLookupInput) {
              setCategoryLookupInput(String(discoveredCat));
            }
          }
        } else {
          if (!append) setProducts([]);
          setHasNext(false);
          setProductsError(res.message);
        }
      } finally {
        setProductsLoading(false);
        setLoadingMore(false);
      }
    },
    [
      categoryId,
      subCategoryId,
      brand,
      model,
      year,
      minPrice,
      maxPrice,
      categoryLookupInput,
    ]
  );

  // Keep the latest search callback without re-running the initial catalog
  // fetch every time a user edits a filter field.
  const executeProductSearchRef = useRef(executeProductSearch);
  useEffect(() => {
    executeProductSearchRef.current = executeProductSearch;
  }, [executeProductSearch]);

  // Search on first load and when switching Car/Bike. Filter edits are applied
  // only when the user submits the search form.
  useEffect(() => {
    executeProductSearchRef.current(0, false);
  }, [vehicleType]);

  const handlePullRefresh = useCallback(async () => {
    const tasks: Promise<unknown>[] = [executeProductSearch(0, false)];
    if (categoryId.trim()) {
      tasks.push(loadSubCategoriesForCategory(categoryId.trim()));
    }
    await Promise.all(tasks);
  }, [categoryId, executeProductSearch, loadSubCategoriesForCategory]);

  const recordRecentSearch = useCallback(
    (params: {
      brand: string;
      model: string;
      year: string;
      categoryId: string;
      subCategoryId: string;
      minPrice: string;
      maxPrice: string;
    }) => {
      const parts: string[] = [];
      if (params.brand.trim()) parts.push(params.brand.trim());
      if (params.model.trim()) parts.push(params.model.trim());
      if (params.year.trim()) parts.push(params.year.trim());
      if (params.minPrice.trim() || params.maxPrice.trim()) {
        const minStr = params.minPrice.trim()
          ? `₹${Number(params.minPrice).toLocaleString('en-IN')}`
          : '₹0';
        const maxStr = params.maxPrice.trim()
          ? `₹${Number(params.maxPrice).toLocaleString('en-IN')}`
          : 'Any';
        parts.push(`${minStr}–${maxStr}`);
      }
      if (params.categoryId.trim()) {
        parts.push(`Cat: ${params.categoryId.trim().slice(0, 8)}`);
      }
      if (params.subCategoryId.trim()) {
        parts.push(`Sub: ${params.subCategoryId.trim().slice(0, 8)}`);
      }

      if (parts.length === 0) return;

      const label = parts.join(' · ');
      const newEntry: RecentSearchEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        label,
        brand: params.brand.trim(),
        model: params.model.trim(),
        year: params.year.trim(),
        categoryId: params.categoryId.trim(),
        subCategoryId: params.subCategoryId.trim(),
        minPrice: params.minPrice.trim(),
        maxPrice: params.maxPrice.trim(),
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setRecentSearches((prev) => {
        const deduplicated = prev.filter(
          (item) => item.label.toLowerCase() !== label.toLowerCase()
        );
        const updated = [newEntry, ...deduplicated].slice(
          0,
          MAX_RECENT_SEARCHES
        );
        saveRecentSearchesToStorage(updated);
        return updated;
      });
    },
    []
  );

  const handleSelectRecentSearch = (entry: RecentSearchEntry) => {
    triggerHaptic('selection');
    setBrand(entry.brand);
    setModel(entry.model);
    setYear(entry.year);
    setCategoryId(entry.categoryId);
    setSubCategoryId(entry.subCategoryId);
    setMinPrice(entry.minPrice);
    setMaxPrice(entry.maxPrice);
    setShowRecentDropdown(false);

    if (entry.categoryId) {
      loadSubCategoriesForCategory(entry.categoryId);
    }

    executeProductSearch(0, false, {
      brand: entry.brand,
      model: entry.model,
      year: entry.year,
      categoryId: entry.categoryId,
      subCategoryId: entry.subCategoryId,
      minPrice: entry.minPrice,
      maxPrice: entry.maxPrice,
    });
  };

  const handleRemoveRecentSearch = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    triggerHaptic('selection');
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveRecentSearchesToStorage(updated);
      return updated;
    });
  };

  const handleClearAllRecentSearches = () => {
    triggerHaptic('warning');
    setRecentSearches([]);
    saveRecentSearchesToStorage([]);
  };

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setShowFiltersDrawer(false);
    setShowRecentDropdown(false);
    recordRecentSearch({
      brand,
      model,
      year,
      categoryId,
      subCategoryId,
      minPrice,
      maxPrice,
    });
    if (categoryId.trim()) {
      loadSubCategoriesForCategory(categoryId.trim());
    }
    executeProductSearch(0, false);
  };

  const handleResetFilters = () => {
    setCategoryId('');
    setSubCategoryId('');
    setBrand('');
    setModel('');
    setYear('');
    setMinPrice('');
    setMaxPrice('');
    setSubCategories([]);
    setSubCategoriesError(null);
  };

  const handleToggleWishlistCard = async (
    e: React.MouseEvent,
    variantId?: string
  ) => {
    e.stopPropagation();
    if (!variantId || wishlistBusyId) return;
    setWishlistBusyId(variantId);
    try {
      await toggleWishlist(variantId);
    } finally {
      setWishlistBusyId(null);
    }
  };

  const activeFiltersCount = [
    categoryId,
    subCategoryId,
    brand,
    model,
    year,
    minPrice,
    maxPrice,
  ].filter((v) => v.trim().length > 0).length;

  // Enforce min/max price bounds on displayed products in addition to the API filter payload
  const displayedProducts = useMemo(() => {
    const minVal =
      minPrice.trim() !== '' && !Number.isNaN(Number(minPrice))
        ? Number(minPrice)
        : null;
    const maxVal =
      maxPrice.trim() !== '' && !Number.isNaN(Number(maxPrice))
        ? Number(maxPrice)
        : null;

    if (minVal === null && maxVal === null) {
      return products;
    }

    return products.filter((product) => {
      const price = extractProductPrice(product);
      if (price === null) return false;
      if (minVal !== null && price < minVal) return false;
      if (maxVal !== null && price > maxVal) return false;
      return true;
    });
  }, [products, minPrice, maxPrice]);

  const sliderMinValue =
    minPrice.trim() !== '' && !Number.isNaN(Number(minPrice))
      ? Math.max(0, Math.min(50000, Number(minPrice)))
      : 0;
  const sliderMaxValue =
    maxPrice.trim() !== '' && !Number.isNaN(Number(maxPrice))
      ? Math.max(sliderMinValue, Math.min(50000, Number(maxPrice)))
      : 50000;

  return (
    <PullToRefresh
      onRefresh={handlePullRefresh}
      isRefreshing={productsLoading}
      refreshingLabel="Refreshing MotoSpar catalog..."
      pullLabel="Pull down to refresh catalog"
      releaseLabel="Release to fetch latest parts"
    >
      <div className="space-y-6">
      {/* Storefront Hero & Vehicle Mode Selector */}
      <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">
              {vehicleType === 'CAR'
                ? 'Four-Wheeler OEM & Aftermarket Catalog'
                : 'Two-Wheeler Performance & Replacement Catalog'}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
              {vehicleType === 'CAR' ? 'Car Spare Parts' : 'Bike Spare Parts'}
            </h1>
          </div>

          {/* Interactive Vehicle Segmented Control */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl self-start">
            <button
              type="button"
              onClick={() => onSelectVehicleType('CAR')}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
                vehicleType === 'CAR'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Car Storefront</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectVehicleType('BIKE')}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
                vehicleType === 'BIKE'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>Bike Storefront</span>
            </button>
          </div>
        </div>

        {/* Quick Search & Filter Bar with Recent Searches Dropdown */}
        <div ref={searchFormContainerRef} className="relative mt-5">
          <form
            onSubmit={handleApplyFilters}
            className="grid grid-cols-1 sm:grid-cols-12 gap-2.5"
          >
            <div className="sm:col-span-4 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={brand}
        onFocus={() => setShowRecentDropdown(recentSearches.length > 0)}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Part name, brand or keyword"
                className="w-full min-h-[44px] pl-10 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
              />
              <button
                type="button"
                disabled={recentSearches.length === 0}
                onClick={() => setShowRecentDropdown((v) => !v)}
                aria-label="Toggle recent searches dropdown"
                title="Recent Searches"
                className="min-h-[40px] min-w-[40px] absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Clock className="w-4 h-4" />
              </button>
            </div>
            <div className="sm:col-span-3">
              <input
                type="text"
                value={model}
                onFocus={() => setShowRecentDropdown(recentSearches.length > 0)}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Vehicle Model"
                className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
              />
            </div>
            <div className="sm:col-span-2">
              <input
                type="text"
                value={year}
                onFocus={() => setShowRecentDropdown(recentSearches.length > 0)}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Year (e.g. 2022)"
                className="w-full min-h-[44px] px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
              />
            </div>
            <div className="sm:col-span-3 flex items-center gap-2">
              <button
                type="submit"
                disabled={productsLoading}
                className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                <span>Search Parts</span>
              </button>
              <button
                type="button"
                onClick={() => setShowFiltersDrawer((v) => !v)}
                aria-label="Toggle category filters"
                className="min-h-[44px] min-w-[44px] px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {activeFiltersCount > 0 && (
                  <span className="text-xs font-mono font-bold text-rose-600">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Recent Searches Dropdown Menu */}
          {showRecentDropdown && recentSearches.length > 0 && (
            <div
              role="region"
              aria-label="Recent Searches"
              className="absolute left-0 right-0 sm:max-w-xl mt-2 z-20 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  <span>Recent Searches</span>
                </div>
                <div className="flex items-center gap-3">
                  {recentSearches.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllRecentSearches}
                      className="text-[11px] font-medium text-slate-500 hover:text-red-600 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowRecentDropdown(false)}
                    aria-label="Close recent searches"
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {recentSearches.length === 0 ? (
                <div className="px-4 py-5 text-center text-xs text-slate-500">
                  Search by part name, brand, model, year, or price range to
                  save it here.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {recentSearches.map((entry) => (
                    <div
                      key={entry.id}
                      onClick={() => handleSelectRecentSearch(entry)}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-xs font-medium text-slate-800 truncate">
                          {entry.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono text-slate-400">
                          {entry.timestamp}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveRecentSearch(e, entry.id)}
                          aria-label={`Remove ${entry.label} from recent searches`}
                          className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Collapsible price filters */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowPriceFilters((visible) => !visible)}
            aria-expanded={showPriceFilters}
            aria-controls="price-range-filters"
            className="w-full min-h-[40px] flex items-center justify-between gap-3 text-left"
          >
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-rose-600" />
              <span>Price Range Filter</span>
            </span>
            <span className="flex items-center gap-2 text-xs font-mono tabular-nums text-slate-600">
              {minPrice.trim() ? `₹${Number(minPrice).toLocaleString('en-IN')}` : '₹0'}
              {' – '}
              {maxPrice.trim()
                ? `₹${Number(maxPrice).toLocaleString('en-IN')}`
                : 'Any Max'}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showPriceFilters ? 'rotate-180' : ''}`}
              />
            </span>
          </button>

          {showPriceFilters && (
          <div id="price-range-filters" className="pt-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1 space-y-2.5">
              {/* Dual Range Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] font-medium text-slate-500 w-8 shrink-0">
                    Min
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={50000}
                    step={250}
                    value={sliderMinValue}
                    onChange={(e) => {
                      const nextMin = Number(e.target.value);
                      setMinPrice(nextMin > 0 ? String(nextMin) : '');
                      if (
                        maxPrice.trim() !== '' &&
                        Number(maxPrice) < nextMin
                      ) {
                        setMaxPrice(String(nextMin));
                      }
                    }}
                    aria-label="Minimum price slider"
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] font-medium text-slate-500 w-8 shrink-0">
                    Max
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={50000}
                    step={250}
                    value={sliderMaxValue}
                    onChange={(e) => {
                      const nextMax = Number(e.target.value);
                      if (nextMax >= 50000) {
                        setMaxPrice('');
                      } else {
                        setMaxPrice(String(Math.max(nextMax, sliderMinValue)));
                      }
                    }}
                    aria-label="Maximum price slider"
                    className="w-full accent-slate-900 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Exact Min / Max Inputs & Quick Range Presets */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
              <div className="relative w-28">
                <span className="text-xs font-mono text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
                  ₹
                </span>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  aria-label="Minimum price in rupees"
                  className="w-full min-h-[40px] pl-7 pr-2.5 py-1.5 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                />
              </div>
              <span className="text-xs text-slate-400">to</span>
              <div className="relative w-28">
                <span className="text-xs font-mono text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
                  ₹
                </span>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  aria-label="Maximum price in rupees"
                  className="w-full min-h-[40px] pl-7 pr-2.5 py-1.5 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                />
              </div>

              {(minPrice.trim() !== '' || maxPrice.trim() !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setMinPrice('');
                    setMaxPrice('');
                  }}
                  className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 whitespace-nowrap"
                >
                  Clear Price
                </button>
              )}
            </div>
          </div>

          {/* Interactive Price Range Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-1">
            {[
              { label: 'Any Price', min: '', max: '' },
              { label: 'Under ₹1,000', min: '', max: '1000' },
              { label: '₹1,000 – ₹5,000', min: '1000', max: '5000' },
              { label: '₹5,000 – ₹15,000', min: '5000', max: '15000' },
              { label: '₹15,000+', min: '15000', max: '' },
            ].map((preset) => {
              const isSelected =
                minPrice.trim() === preset.min &&
                maxPrice.trim() === preset.max;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setMinPrice(preset.min);
                    setMaxPrice(preset.max);
                  }}
                  className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium font-mono tabular-nums transition-colors whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
          </div>
          )}
        </div>

        {/* Expandable Category / Subcategory Filter Panel */}
        {showFiltersDrawer && (
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Category ID (`category_id`)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    placeholder="Category UUID or ID"
                    className="flex-1 min-h-[44px] px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => loadSubCategoriesForCategory(categoryId)}
                    disabled={!categoryId.trim() || subCategoriesLoading}
                    className="min-h-[44px] px-3 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-50 whitespace-nowrap"
                  >
                    Load Subcategories
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Sub-Category ID (`sub_category_id`)
                </label>
                <input
                  type="text"
                  value={subCategoryId}
                  onChange={(e) => setSubCategoryId(e.target.value)}
                  placeholder="Sub-Category UUID or ID"
                  className="w-full min-h-[44px] px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex items-end justify-end gap-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear All Filters</span>
                </button>
              </div>
            </div>

            {subCategoriesError && (
              <p className="text-xs text-red-600">{subCategoriesError}</p>
            )}
          </div>
        )}

        {/* Subcategories interactive horizontal bar when loaded from GET /api/sub-categories/{categoryId}/ */}
        {subCategories.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-2">
              Subcategories
            </p>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => {
                  setSubCategoryId('');
                }}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  subCategoryId === ''
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Subcategories
              </button>
              {subCategories.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSubCategoryId(String(sub.id))}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    subCategoryId === String(sub.id)
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Catalog Feed Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Showing{' '}
            <strong className="font-mono">{displayedProducts.length}</strong>{' '}
            {displayedProducts.length === 1 ? 'part' : 'parts'} from live
            catalog
          </span>
        </div>
        <button
          type="button"
          onClick={() => executeProductSearch(0, false)}
          disabled={productsLoading}
          className="min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-white border border-transparent hover:border-slate-200 transition-colors inline-flex items-center gap-1.5"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${productsLoading ? 'animate-spin' : ''}`}
          />
          <span>Refresh Catalog</span>
        </button>
      </div>

      {/* Product Grid / States */}
      {productsLoading ? (
        <ProductGridSkeleton count={6} />
      ) : productsError ? (
        <ErrorState
          title="Catalog Request Failed"
          message={productsError}
          onRetry={() => executeProductSearch(0, false)}
        />
      ) : displayedProducts.length === 0 ? (
        <EmptyState
          title="No Matching Parts Found"
          description="The MotoSpar catalog returned zero parts matching your current search and price range filters."
          actionLabel={activeFiltersCount > 0 ? 'Reset Filters' : 'Refresh'}
          onAction={() => {
            if (activeFiltersCount > 0) {
              handleResetFilters();
            } else {
              executeProductSearch(0, false);
            }
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProducts.map((product) => {
              const productId = String(
                product.id || product.product_id || product.variant_id || ''
              );
              const primaryVariantId = extractProductVariantId(product);
              const title =
                product.name || product.title || 'Unnamed Automotive Part';
              const price = extractProductPrice(product);
              const imageSrc = extractPrimaryImage(product);
              const wishlisted =
                Boolean(product.is_wishlisted) ||
                isVariantWishlisted(primaryVariantId);

              // Unboxed metadata with middot separators (Zero-Pill Discipline)
              const metadataParts = [
                product.brand ? String(product.brand) : null,
                product.model ? String(product.model) : null,
                product.year ? String(product.year) : null,
              ].filter(Boolean);

              return (
                <article
                  key={productId}
                  onClick={() => onOpenProductDetail(productId)}
                  className="group bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-150"
                >
                  {/* Product Image 4:3 */}
                  <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                    <PartImage
                      src={imageSrc}
                      alt={title}
                      className="w-full h-full"
                    />
                    {primaryVariantId && (
                      <button
                        type="button"
                        onClick={(e) =>
                          handleToggleWishlistCard(e, primaryVariantId)
                        }
                        aria-label={
                          wishlisted
                            ? 'Remove from wishlist'
                            : 'Add to wishlist'
                        }
                        className="absolute top-3 right-3 min-h-[44px] min-w-[44px] rounded-full bg-white/90 backdrop-blur-xs border border-slate-200 flex items-center justify-center text-slate-700 hover:text-rose-600 transition-colors"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            wishlisted
                              ? 'fill-rose-600 text-rose-600'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Product Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {metadataParts.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 truncate">
                          {metadataParts.map((part, idx) => (
                            <React.Fragment key={idx}>
                              {idx > 0 && <span aria-hidden="true">·</span>}
                              <span>{part}</span>
                            </React.Fragment>
                          ))}
                        </div>
                      )}

                      <h3 className="text-base font-semibold text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-2">
                        {title}
                      </h3>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between gap-2">
                      <div>
                        {price !== null ? (
                          <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-500">
                            Price unavailable
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-medium text-slate-600">
                        {product.stock !== undefined && product.stock !== null
                          ? Number(product.stock) > 0
                            ? `${product.stock} in stock`
                            : 'Out of stock'
                          : 'Inspect details'}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
            {loadingMore &&
              Array.from({ length: 3 }).map((_, idx) => (
                <ProductCardSkeleton key={`more-skeleton-${idx}`} />
              ))}
          </div>

          {/* Pagination: Load More when data.has_next is true */}
          {hasNext && (
            <div className="flex justify-center pt-4">
              <button
                type="button"
                disabled={loadingMore}
                onClick={() => executeProductSearch(offset + PAGE_SIZE, true)}
                className="min-h-[48px] px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-2 disabled:opacity-60"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading next page...</span>
                  </>
                ) : (
                  <span>Load More Parts</span>
                )}
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </PullToRefresh>
  );
};
