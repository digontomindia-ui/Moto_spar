# MotoSpar Admin Frontend Modernization Plan

## Objective

Turn the current admin panel into a reliable, professional operations product while preserving existing business behavior. Work will proceed in small, reviewable phases, beginning with the failing product-edit and image-management workflow.

## Progress status

- Phase 0 audit: completed for the admin routes, shared shell, dashboard and product workflow
- Current production build baseline: succeeds locally with pre-existing warnings in untouched legacy pages
- Strict CI baseline: blocked by the existing application-wide lint backlog
- Phase 1 product and variant/image workflow: implemented locally; focused payload tests and changed-file lint pass
- Phase 2 shared application shell: first implementation completed locally
- Phase 3 dashboard: first implementation completed locally
- Phase 4 product management: first implementation completed locally across list, add, edit, images, CSV import and sub-categories
- Phase 5 orders and fulfilment: first implementation completed locally across the order queue, order detail, vendor, mechanic and driver assignment flows
- Phase 6 people management: customer, vendor, mechanic and driver directories plus customer detail completed locally; vendor, mechanic and driver detail screens remain
- Live authenticated smoke test: still required before release
- Deployment/push status: not performed

## Work completed in the current local implementation

### Product and variant editing

- Added an explicit product PATCH adapter that maps form relation fields to `category_id` and `sub_category_id`.
- Normalized numeric, GST and boolean values before sending them to Django.
- Added focused unit coverage for field mapping, zero preservation and invalid GST handling.
- Made product Save await the API, block duplicate submissions, refresh after success and display server details after failure.
- Added unsaved-change tracking and navigation protection.
- Removed misleading product-level stock/status controls from the metadata form.
- Separated product activation/deactivation into a confirmed action.
- Rebuilt the variant list with readable SKU, pricing, stock and image information.
- Added a direct Add/Edit/Manage images flow for variants.
- Added multi-image selection, preview, saved/pending states, count and size limits, deletion confirmation and upload retry.
- Corrected boolean stock serialization and the new-variant API argument order.
- Made calculated variant values read-only and added client-side SKU, price and discount validation.

### Shared admin shell

- Replaced raw anchor navigation with React Router links so page changes no longer force full reloads.
- Added route-aware active states and an automatically expanded Product Management section.
- Replaced the `200vh` sidebar with a sticky, viewport-height, independently scrollable navigation.
- Added responsive mobile navigation, accessible labels and keyboard-focusable controls.
- Reworked the header with consistent page hierarchy and a normalized profile image URL.
- Made logout clear the local session even when the server logout request fails.

### Dashboard

- Added a compact operations overview, manual refresh and last-updated feedback.
- Rebuilt metric cards with accurate labels and removed fake customer/vendor change percentages.
- Fixed the seven-day revenue chart transformation, which previously read array indexes as data objects.
- Added readable currency/date formatting and proper chart empty/loading states.
- Rebuilt revenue mix using the API’s actual category/subcategory keys.
- Replaced the oversized pending-order table with a scannable attention queue.
- Removed nonfunctional dashboard delete/view controls and retained one clear Review action.

### Product list

- Rebuilt the catalogue entry page with a responsive, scannable table and clear page hierarchy.
- Added safe page-level search across product name, code, brand, category and subcategory.
- Added product thumbnails, variant counts, total stock, price ranges, GST state and correct creation-date labels.
- Replaced icon-only navigation with a clear Manage action.
- Added honest loading, no-results and empty-catalogue states.
- Fixed deletion refresh handling to use the API’s actual response contract.
- Added deletion progress/locking and retained pagination after successful deletion.
- Added direct Add product and CSV import entry points.

### Product creation, CSV import and sub-categories

- Rebuilt Add Product with required-field validation, duplicate-submit protection and an explicit post-create state.
- Preserved partial product success and added a visible retry path when only image upload fails.
- Removed misleading no-op draft actions and added clear cancel/back navigation.
- Split CSV import into choose, validate, and confirm-upload steps so validation never silently creates products.
- Added CSV type/size checks, row/header summary, row error reporting and explicit handling for missing categories and sub-categories.
- Added a separate final confirmation action for valid imports to reduce accidental duplicate uploads.
- Rebuilt sub-category management with validation, search, pagination, image preview, reliable create/edit results and confirmed deletion.
- Normalized sub-category API result handling so the page only reports completion after the backend confirms it.

### Orders and fulfilment

- Rebuilt the order queue as one scannable row per order instead of repeating order-level data for every line item.
- Added server-backed filters for order code, customer, payment method and payment status, plus a current-page fulfilment filter.
- Added consistent amount, date, payment and fulfilment status formatting with loading and empty states.
- Rebuilt order detail with customer, shipping, payment, pricing and selected-line-item sections.
- Added a fulfilment timeline and explicit multi-item selection.
- Stopped status/payment dropdowns from writing immediately to the API; changes now remain local until reviewed and confirmed.
- Fixed vendor payment serialization so the API receives a boolean instead of a truthy `"False"` string.
- Added risky-state confirmation for cancellation and delivery updates.
- Rebuilt vendor and mechanic assignment with missing-context protection, loading/empty states, search, confirmation and awaited API results.
- Made mechanic work instructions mandatory before assignment.

### Verification completed

- Focused payload tests: 3 passed.
- ESLint on all newly rebuilt product, shell, dashboard and order pages: passed without warnings.
- Optimized React production build: succeeded.
- Diff whitespace validation: passed.

### Verification still required

- Authenticated browser smoke test with live API data.
- Product edit success and validation-error test against the deployed backend.
- Variant image upload, retry and deletion test against private S3.
- Desktop, tablet and mobile visual review with real data.
- Explicit approval before commit, push or deployment.

## Working guardrails

- Protect all existing uncommitted work in the workspace.
- Do not reset, replace, or delete unrelated changes.
- Do not deploy or push until the relevant phase passes its acceptance checks and is explicitly approved.
- Separate product metadata updates from variant and image operations because the backend exposes separate endpoints for them.
- Keep image storage private and use API-provided or signed display URLs instead of constructing S3 URLs in the browser.
- Verify each changed workflow on desktop and mobile before moving to the next page group.

## Current application inventory

The admin application currently contains these main areas:

1. Authentication and password recovery
2. Dashboard
3. Product list, product creation, CSV upload, product editing, variants, categories and subcategories
4. Order list, order details, vendor selection and mechanic selection
5. User management
6. Vendor management
7. Mechanic management
8. Driver management
9. Transactions
10. Product requests
11. Profile and logout

The application uses React 18, React Router, React Bootstrap, Redux, Recharts and a shared `VendorContext` for most API operations.

## Confirmed problems from the initial audit

### Product editing and API behavior

- The product edit screen sends `categoryId` and `subCategoryId`, while the Django serializer accepts `category_id` and `sub_category_id`.
- Product Save is not awaited, so the UI can show completion before the request finishes.
- The API helper returns parsed JSON without a consistent HTTP status/error contract.
- Validation details returned in `data.details` are not shown clearly to the administrator.
- The product status dropdown calls a separate API immediately, which can create a partial update before the administrator presses Save.
- Product metadata, variants and images are mixed visually even though they have separate backend lifecycles.
- The edit page contains legacy/commented image UI and image-host assumptions that conflict with S3-backed URLs.

### Usability and visual quality

- The sidebar uses a fixed `200vh` height and raw anchor links, which can cause awkward scrolling and full-page reloads.
- Navigation, spacing, typography, button styles and form patterns are inconsistent between pages.
- Important actions are represented by icon-only buttons without sufficiently clear labels.
- Forms are long, visually flat and do not distinguish required, optional, financial and operational fields.
- Loading, empty, error, success and retry states are inconsistent.
- Tables are not optimized for scanning, filtering, responsive use or keyboard access.
- The dashboard uses large empty areas and does not communicate freshness, date range or actionable operational information.

## Delivery phases

### Phase 0 — Baseline and safety

Deliverables:

- Record the current Git state and protect existing work.
- Map all routes, shared components, API calls and page dependencies.
- Establish a repeatable frontend build and test baseline.
- Create a manual smoke-test checklist for authentication, products, orders and user-management pages.

Exit criteria:

- Existing changes are accounted for.
- The current build result and known warnings are documented.
- No production deployment has occurred.

### Phase 1 — Product edit and image workflow

This is the first implementation phase.

Tasks:

1. Define an explicit product-update payload matching the Django serializer.
2. Preserve zero values and convert numeric fields deliberately.
3. Await Save and return a structured success/error result.
4. Display field-level API validation errors rather than a generic failure only.
5. Add Save progress, disable duplicate submissions and show a clear saved state.
6. Track unsaved changes and warn before leaving the page.
7. Separate the page into Product details, Pricing and fees, Status, Variants and Images.
8. Make each variant row clearly expose View, Edit and Manage images actions.
9. Manage existing and pending images in one visible gallery with count, limits, file rules, upload progress, deletion confirmation and retry.
10. Refresh product data after successful metadata, variant, upload or deletion operations.
11. Verify that image URLs come from the API resolver and work with private S3 storage.
12. Add regression coverage for valid edits, invalid fields, unchanged images, multiple images, deletion and partial upload failure.

Exit criteria:

- Editing the supplied product no longer returns an unexplained HTTP 400.
- Administrators can understand exactly which field failed validation.
- Save never reports success before the backend confirms it.
- Images can be added, previewed, retried and removed without manually navigating through unrelated screens.
- Metadata changes cannot accidentally replace or corrupt variant images.

### Phase 2 — Design system and shared application shell

Tasks:

- Define design tokens for color, typography, spacing, radius, shadow and responsive breakpoints.
- Build reusable page header, section card, form field, status badge, data table, empty state, error state, confirmation dialog and toast patterns.
- Replace raw navigation anchors with React Router navigation.
- Implement a fixed/collapsible desktop sidebar and a usable mobile drawer.
- Add active route states, section grouping, accessible labels and consistent icons.
- Standardize loading skeletons and page-level error handling.

Exit criteria:

- Shared layouts behave consistently across desktop, tablet and mobile.
- All common states have one reusable visual pattern.
- Navigation does not cause avoidable full-page reloads.

### Phase 3 — Dashboard

Tasks:

- Add a date-range selector and data freshness indicator.
- Replace decorative metrics with operational KPIs and meaningful comparisons.
- Use clear empty states instead of large blank chart containers.
- Improve chart legends, labels, currency formatting and accessibility.
- Add actionable lists for pending orders, product requests, low stock and failed workflows.

Exit criteria:

- Every dashboard widget has a defined business question and an empty/loading/error state.
- Metrics and charts remain readable on common laptop and tablet widths.

### Phase 4 — Product management pages

Tasks:

- Modernize product list search, filters, sorting, pagination and bulk actions.
- Improve Add Product with grouped sections, inline validation and progressive disclosure.
- Clarify CSV upload requirements, validation preview, row errors and retry behavior.
- Standardize categories and subcategories management.
- Reuse the completed variant and image-management patterns from Phase 1.

### Phase 5 — Orders and fulfilment

Current implementation status: first implementation completed locally. The order queue now has server-backed filters, the detail screen separates operational concerns, and vendor, mechanic and driver assignment actions are explicit, awaited and confirmed before submission.

Tasks:

- Introduce a consistent order status timeline.
- Separate customer, payment, delivery, vendor and mechanic information.
- Make assignment actions explicit, confirmable and auditable.
- Add filters for date, status, payment and fulfilment owner.
- Prevent destructive actions without confirmation.

### Phase 6 — People management

Applies to users, vendors, mechanics and drivers.

Current implementation status: all four directories now use a common responsive layout with server-backed search, loading/empty/error states, pagination and labelled actions. Vendor and mechanic verification is explicitly confirmed; the invalid mechanic-to-vendor deletion path was removed. Customer detail now reloads safely from its URL instead of depending only on navigation state. Vendor, mechanic and driver detail screens are the next slice.

Tasks:

- Reuse a common directory and profile-detail layout.
- Standardize search, status filters, verification indicators and activity history.
- Make enable/disable or approval actions explicit and confirmable.
- Clearly distinguish identity data, business data, documents and operational history.

### Phase 7 — Transactions and product requests

Tasks:

- Improve monetary formatting, payment status and reconciliation visibility.
- Provide searchable transaction references and links to related orders.
- Modernize product-request review and its multi-image workflow.
- Show ownership, status history, rejection reasons and next actions.

### Phase 8 — Authentication, profile and global polish

Tasks:

- Standardize login, registration and password-recovery behavior.
- Provide useful server-validation messages without exposing internal errors.
- Resolve hardcoded API/image-host assumptions.
- Complete keyboard, focus, contrast, label and screen-reader checks.
- Add route-level not-found and unexpected-error experiences.

### Phase 9 — Regression, preview and controlled release

Tasks:

- Run frontend build, unit tests and targeted backend tests.
- Execute the smoke-test checklist against a preview environment.
- Test current Chrome, Safari and mobile layouts.
- Confirm S3 image upload, retrieval and deletion behavior.
- Review browser console and network errors.
- Deploy only after approval, then run production smoke tests and monitor errors.

## Definition of done for every page

A page is complete only when:

- Its primary task is obvious without training.
- Loading, empty, validation, server-error, success and permission-denied states are handled.
- Destructive actions require confirmation.
- Forms prevent duplicate submissions and preserve entered data after recoverable errors.
- API errors provide useful administrator-facing details without leaking secrets or internals.
- Desktop, tablet and mobile layouts are verified.
- Keyboard focus and labels are usable.
- The page passes its build/tests and a manual smoke test.
- No unrelated behavior or user-owned work is overwritten.

## First implementation slice

The first coding slice will be deliberately narrow:

1. Normalize and validate the product PATCH payload.
2. Make Save await the API result and surface backend validation details.
3. Add duplicate-submit protection and refresh-after-save.
4. Add targeted frontend/backend tests for the contract.
5. Restructure only the product edit page using the initial shared visual primitives.
6. Verify the current multiple-image component inside the new variant workflow.

Only after this slice is reviewed will the same visual system be expanded across the rest of the admin panel.
