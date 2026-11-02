/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bike,
  Car,
  Loader2,
  ShoppingBag,
  User,
  Wrench,
} from 'lucide-react';
import { MotoSparChatbot } from './components/Chatbot/MotoSparChatbot';
import { PWAInstallBanner } from './components/ui/PWAInstallBanner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CommerceProvider, useCommerce } from './context/CommerceContext';
import {
  AccountHubView,
  AccountSectionTab,
} from './screens/Account/AccountHubView';
import { AuthFlow } from './screens/Auth/AuthFlow';
import { CartAndCheckoutView } from './screens/Cart/CartAndCheckoutView';
import { ProductDetailView } from './screens/Storefront/ProductDetailView';
import {
  StorefrontView,
  VehicleType,
} from './screens/Storefront/StorefrontView';

type ActiveRoute =
  | { name: 'STOREFRONT'; vehicleType: VehicleType }
  | { name: 'PRODUCT_DETAIL'; productId: string }
  | { name: 'CART_CHECKOUT' }
  | { name: 'ACCOUNT'; section: AccountSectionTab };

const CustomerShell: React.FC = () => {
  const { isHydrating, isAuthenticated } = useAuth();
  const { cartItems, buyNowStaging } = useCommerce();

  const [route, setRoute] = useState<ActiveRoute>({
    name: 'STOREFRONT',
    vehicleType: 'CAR',
  });

  // 1. Session restoration gate — avoid exposing protected screens while checking stored session
  if (isHydrating) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center mb-4">
          <Wrench className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold text-slate-900 font-display">
          MotoSpar
        </h1>
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
          <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
          <span>Restoring customer session...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated flow -> Login / Register / Password Recovery
  if (!isAuthenticated) {
    return <AuthFlow />;
  }

  const cartBadgeCount = buyNowStaging ? 1 : cartItems.length;

  // 3. Authenticated Customer Storefront & Navigation Shell
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-8">
      {/* Top Bar Contract: 3 Zones separated by gap-8 */}
      <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() =>
            setRoute({ name: 'STOREFRONT', vehicleType: 'CAR' })
          }
          className="text-lg font-bold tracking-tight text-slate-900 font-display whitespace-nowrap shrink-0"
        >
          MotoSpar
        </button>

        {/* Zone 2: 4–5 single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() =>
              setRoute({ name: 'STOREFRONT', vehicleType: 'CAR' })
            }
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              route.name === 'STOREFRONT' && route.vehicleType === 'CAR'
                ? 'text-slate-900 font-semibold underline underline-offset-4 decoration-rose-600'
                : ''
            }`}
          >
            Car Parts
          </button>
          <button
            type="button"
            onClick={() =>
              setRoute({ name: 'STOREFRONT', vehicleType: 'BIKE' })
            }
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              route.name === 'STOREFRONT' && route.vehicleType === 'BIKE'
                ? 'text-slate-900 font-semibold underline underline-offset-4 decoration-rose-600'
                : ''
            }`}
          >
            Bike Parts
          </button>
          <button
            type="button"
            onClick={() =>
              setRoute({ name: 'ACCOUNT', section: 'ORDERS' })
            }
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              route.name === 'ACCOUNT' && route.section === 'ORDERS'
                ? 'text-slate-900 font-semibold underline underline-offset-4 decoration-rose-600'
                : ''
            }`}
          >
            Orders
          </button>
          <button
            type="button"
            onClick={() =>
              setRoute({ name: 'ACCOUNT', section: 'WISHLIST' })
            }
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              route.name === 'ACCOUNT' && route.section === 'WISHLIST'
                ? 'text-slate-900 font-semibold underline underline-offset-4 decoration-rose-600'
                : ''
            }`}
          >
            Wishlist
          </button>
          <button
            type="button"
            onClick={() =>
              setRoute({ name: 'ACCOUNT', section: 'PROFILE' })
            }
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              route.name === 'ACCOUNT' && route.section === 'PROFILE'
                ? 'text-slate-900 font-semibold underline underline-offset-4 decoration-rose-600'
                : ''
            }`}
          >
            Account
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setRoute({ name: 'CART_CHECKOUT' })}
            className="min-h-[40px] px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-rose-500" />
            <span>Cart ({cartBadgeCount})</span>
          </button>
        </div>
      </header>

      {/* Main Content Container (Full Desktop Presence max-w-7xl + Mobile Ergonomics) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <PWAInstallBanner className="mb-6" />

        {route.name === 'STOREFRONT' && (
          <StorefrontView
            vehicleType={route.vehicleType}
            onSelectVehicleType={(type) =>
              setRoute({ name: 'STOREFRONT', vehicleType: type })
            }
            onOpenProductDetail={(productId) =>
              setRoute({ name: 'PRODUCT_DETAIL', productId })
            }
          />
        )}

        {route.name === 'PRODUCT_DETAIL' && (
          <ProductDetailView
            productId={route.productId}
            onBack={() =>
              setRoute({ name: 'STOREFRONT', vehicleType: 'CAR' })
            }
            onNavigateToCart={() => setRoute({ name: 'CART_CHECKOUT' })}
            onStartBuyNowCheckout={() => setRoute({ name: 'CART_CHECKOUT' })}
          />
        )}

        {route.name === 'CART_CHECKOUT' && (
          <CartAndCheckoutView
            onContinueShopping={() =>
              setRoute({ name: 'STOREFRONT', vehicleType: 'CAR' })
            }
            onOpenProductDetail={(productId) =>
              setRoute({ name: 'PRODUCT_DETAIL', productId })
            }
            onViewOrders={() =>
              setRoute({ name: 'ACCOUNT', section: 'ORDERS' })
            }
          />
        )}

        {route.name === 'ACCOUNT' && (
          <AccountHubView
            initialSection={route.section}
            onOpenProductDetail={(productId) =>
              setRoute({ name: 'PRODUCT_DETAIL', productId })
            }
          />
        )}
      </main>

      {/* Fixed Bottom Tab Bar for Mobile Thumb Navigation (Car, Bike, Cart, Profile) */}
      <nav
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-4 items-center"
      >
        <button
          type="button"
          onClick={() =>
            setRoute({ name: 'STOREFRONT', vehicleType: 'CAR' })
          }
          className={`min-h-[44px] flex flex-col items-center justify-center ${
            route.name === 'STOREFRONT' && route.vehicleType === 'CAR'
              ? 'text-rose-600'
              : 'text-slate-500'
          }`}
        >
          <Car className="w-5 h-5" />
          <span className="text-[11px] font-medium tracking-tight mt-0.5 whitespace-nowrap">
            Car
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            setRoute({ name: 'STOREFRONT', vehicleType: 'BIKE' })
          }
          className={`min-h-[44px] flex flex-col items-center justify-center ${
            route.name === 'STOREFRONT' && route.vehicleType === 'BIKE'
              ? 'text-rose-600'
              : 'text-slate-500'
          }`}
        >
          <Bike className="w-5 h-5" />
          <span className="text-[11px] font-medium tracking-tight mt-0.5 whitespace-nowrap">
            Bike
          </span>
        </button>

        <button
          type="button"
          onClick={() => setRoute({ name: 'CART_CHECKOUT' })}
          className={`min-h-[44px] flex flex-col items-center justify-center ${
            route.name === 'CART_CHECKOUT' ? 'text-rose-600' : 'text-slate-500'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[11px] font-medium tracking-tight mt-0.5 whitespace-nowrap">
            Cart ({cartBadgeCount})
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            setRoute({ name: 'ACCOUNT', section: 'PROFILE' })
          }
          className={`min-h-[44px] flex flex-col items-center justify-center ${
            route.name === 'ACCOUNT' ? 'text-rose-600' : 'text-slate-500'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[11px] font-medium tracking-tight mt-0.5 whitespace-nowrap">
            Profile
          </span>
        </button>
      </nav>

      {/* Authenticated n8n Chat Assistant */}
      <MotoSparChatbot />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CommerceProvider>
        <CustomerShell />
      </CommerceProvider>
    </AuthProvider>
  );
}
