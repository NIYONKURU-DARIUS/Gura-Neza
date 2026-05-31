# Requirements Document

## Introduction

This feature completes the full frontend-backend integration for **Gura Neza**, a Spring Boot + React/TypeScript e-commerce application with a wallet-based payment system. While core flows (auth, product catalog, cart, checkout, orders, wallet, admin dashboard, and chat) are already connected to the API, a set of UI gaps remain: non-functional controls, hardcoded display values, missing routes, and absent defensive behaviors. This document specifies all requirements needed to close those gaps so that every user-facing interaction is driven by real API data and every backend capability is surfaced in the frontend.

---

## Glossary

- **ProductCatalog**: The `/products` page that lists all products with category filtering and sorting.
- **ProductDetail**: The `/product/:id` page showing a single product's full details, tabs, and actions.
- **ProductCard**: The reusable card component rendered inside ProductCatalog and related-products sections.
- **Sidebar**: The left-panel component inside ProductCatalog that renders category filter buttons.
- **Wallet**: The `/wallet` page showing the user's balance and transaction history.
- **OrderDetail**: The `/order/:id` page showing a single order's status timeline and checkout summary.
- **ChatWidget**: The floating chat component available to non-admin authenticated users.
- **AdminDashboard**: The `/admin` page used by ADMIN-role users to manage products, orders, users, and chat.
- **Store**: The Zustand global state store (`store.ts`) that holds user, cart, token, and dark-mode state.
- **ProductService**: The `productService.ts` module that wraps all `/api/products` API calls.
- **WalletService**: The `walletService.ts` module that wraps all `/api/wallet` API calls.
- **ChatService**: The `chatService.ts` module that manages WebSocket STOMP connections and REST fallbacks for `/api/chat`.
- **Category_Enum**: The backend enumeration of valid product categories: `ELECTRONICS`, `FOOD`, `CLOTHING`, `BEAUTY`, `SPORTS`, `OTHER`.
- **PaymentMethod_Enum**: The backend enumeration of payment methods: `WALLET`, `PAY_LATER`.
- **Local_Fallback_Image**: A bundled static asset (e.g., `/public/icons.svg` or a dedicated placeholder image) used when a product's `imageUrl` is absent or fails to load.
- **VerifyPage**: A new frontend route at `/verify` that handles email verification links.
- **JWT**: The JSON Web Token stored in `localStorage` under the key `gura_token`, used to authenticate API requests.

---

## Requirements

### Requirement 1: Product Catalog — Functional Sort Control

**User Story:** As a shopper, I want to sort the product list by price or relevance, so that I can find the most relevant products quickly.

#### Acceptance Criteria

1. THE `ProductCatalog` SHALL render a sort select control with the options: `Recommended`, `Price: Low to High`, and `Price: High to Low`.
2. WHEN the user selects `Price: Low to High`, THE `ProductCatalog` SHALL re-order the displayed product list in ascending order of `product.price`.
3. WHEN the user selects `Price: High to Low`, THE `ProductCatalog` SHALL re-order the displayed product list in descending order of `product.price`.
4. WHEN the user selects `Recommended`, THE `ProductCatalog` SHALL display the product list in the original order returned by the API.
5. WHEN a category filter or search query is active, THE `ProductCatalog` SHALL apply the sort order to the already-filtered result set, not the full product list.
6. WHEN the product list is empty after filtering, THE `ProductCatalog` SHALL display the empty-state message regardless of the selected sort option.

---

### Requirement 2: ProductDetail — Like Button Wired to API

**User Story:** As a shopper, I want to like or unlike a product from its detail page, so that I can save products I'm interested in.

#### Acceptance Criteria

1. WHEN the `ProductDetail` page loads, THE `ProductDetail` SHALL initialize the Heart button's filled/unfilled state from the `likedByCurrentUser` field of the API response.
2. WHEN the `ProductDetail` page loads, THE `ProductDetail` SHALL display the `likesCount` value from the API response next to the Heart button.
3. WHEN the user clicks the Heart button, THE `ProductDetail` SHALL call `productService.likeProduct(product.id)` and apply an optimistic UI update before the response arrives.
4. WHEN `productService.likeProduct` returns successfully, THE `ProductDetail` SHALL update the Heart button state and `likesCount` with the values from the server response.
5. IF `productService.likeProduct` returns an error, THEN THE `ProductDetail` SHALL revert the Heart button and `likesCount` to their pre-click values.
6. WHILE a like request is in-flight, THE `ProductDetail` SHALL disable the Heart button to prevent duplicate requests.

---

### Requirement 3: ProductDetail — "Buy Now & Pay Later" Button

**User Story:** As a shopper, I want to immediately proceed to checkout with Pay Later selected, so that I can buy a product without using my wallet balance.

#### Acceptance Criteria

1. WHEN the user clicks the "Buy Now & Pay Later" button, THE `ProductDetail` SHALL call `cartService.addToCart(product.id, qty)` with the currently selected quantity.
2. WHEN the cart item is successfully added, THE `ProductDetail` SHALL navigate to `/checkout` with the query parameter `?method=PAY_LATER` or equivalent state so the Checkout page pre-selects the PAY_LATER payment method.
3. IF `cartService.addToCart` returns an error, THEN THE `ProductDetail` SHALL display an inline error message and SHALL NOT navigate away from the page.
4. WHILE the add-to-cart request is in-flight, THE `ProductDetail` SHALL disable the "Buy Now & Pay Later" button and display a loading indicator.

---

### Requirement 4: ProductDetail — Specifications Tab Content

**User Story:** As a shopper, I want to see structured product specifications, so that I can evaluate a product's technical details before buying.

#### Acceptance Criteria

1. WHEN the user selects the `specifications` tab, THE `ProductDetail` SHALL display the following fields from the product API response: `category`, `stock`, `rating`, `totalReviews`, and `isFeatured`.
2. THE `ProductDetail` SHALL label each specification field with a human-readable name (e.g., "Category", "Units in Stock", "Average Rating", "Total Reviews", "Featured Product").
3. WHEN `product.isFeatured` is `true`, THE `ProductDetail` SHALL display "Yes" for the Featured Product field; otherwise it SHALL display "No".
4. WHEN `product.stock` is `0`, THE `ProductDetail` SHALL display "Out of Stock" for the Units in Stock field.

---

### Requirement 5: ProductDetail — Reviews Tab Content

**User Story:** As a shopper, I want to see a product's review summary, so that I can gauge community sentiment before purchasing.

#### Acceptance Criteria

1. WHEN the user selects the `reviews` tab, THE `ProductDetail` SHALL display the `rating` value (formatted to one decimal place) and the `totalReviews` count from the product API response.
2. WHEN `product.totalReviews` is `0`, THE `ProductDetail` SHALL display a message indicating no reviews are available yet.
3. THE `ProductDetail` SHALL render a star rating visualization consistent with the `rating` value (e.g., filled stars for the integer portion of the rating).

---

### Requirement 6: ProductCard — Like Button Wired to API

**User Story:** As a shopper, I want to like or unlike a product directly from the catalog card, so that I don't have to open the product detail page.

#### Acceptance Criteria

1. WHEN the `ProductCard` renders, THE `ProductCard` SHALL initialize the Heart button's filled/unfilled state from `product.likedByCurrentUser`.
2. WHEN the user clicks the Heart button on a `ProductCard`, THE `ProductCard` SHALL call `productService.likeProduct(product.id)` with an optimistic UI update.
3. WHEN `productService.likeProduct` returns successfully, THE `ProductCard` SHALL update its local product state with the server response values for `likedByCurrentUser` and `likesCount`.
4. IF `productService.likeProduct` returns an error, THEN THE `ProductCard` SHALL revert `likedByCurrentUser` and `likesCount` to their values before the click.
5. WHILE a like request is in-flight, THE `ProductCard` SHALL disable the Heart button and display a loading spinner in place of the Heart icon.

> **Note:** Review of `ProductCard.tsx` confirms this logic is already implemented. This requirement documents the expected behavior for verification and regression testing.

---

### Requirement 7: Wallet Page — Top Up Request Flow

**User Story:** As a user, I want to request a wallet top-up from the Wallet page, so that I can notify an admin to add funds to my account.

#### Acceptance Criteria

1. WHEN the user clicks the "Top Up" button, THE `Wallet` page SHALL display a modal or inline form requesting the desired top-up amount.
2. THE `Wallet` page SHALL validate that the entered amount is a positive number greater than zero before enabling the submit action.
3. WHEN the user submits a valid top-up amount, THE `Wallet` page SHALL display a confirmation message informing the user that the request has been submitted and will be processed by an administrator.
4. IF the top-up submission fails, THEN THE `Wallet` page SHALL display an error message and allow the user to retry.
5. THE `Wallet` page SHALL close the top-up modal or form when the user cancels or after a successful submission.

---

### Requirement 8: Wallet Page — "Send Money" Button Behavior

**User Story:** As a user, I want to understand that peer-to-peer transfers are not available, so that I am not confused by a non-functional button.

#### Acceptance Criteria

1. THE `Wallet` page SHALL either hide the "Send Money" button entirely or replace it with a disabled button accompanied by a tooltip or label stating that peer-to-peer transfers are not supported.
2. WHEN the "Send Money" button is present and the user interacts with it, THE `Wallet` page SHALL display an informational message explaining that this feature is not available.

---

### Requirement 9: OrderDetail — Dynamic Payment Method Display

**User Story:** As a shopper, I want to see the actual payment method used for my order, so that I have an accurate record of how I paid.

#### Acceptance Criteria

1. WHEN `order.paymentMethod` is `WALLET`, THE `OrderDetail` page SHALL display "Gura Wallet Debit" as the payment strategy label.
2. WHEN `order.paymentMethod` is `PAY_LATER`, THE `OrderDetail` page SHALL display "Pay Later" as the payment strategy label.
3. THE `OrderDetail` page SHALL derive the payment strategy label from `order.paymentMethod` and SHALL NOT use a hardcoded string.
4. IF `order.paymentMethod` contains an unrecognized value, THEN THE `OrderDetail` page SHALL display the raw `order.paymentMethod` value as a fallback.

---

### Requirement 10: Admin — Product Category Dropdown Uses Backend Enum

**User Story:** As an admin, I want the product category field to show only valid backend categories, so that I cannot create products with invalid category values.

#### Acceptance Criteria

1. THE `AdminDashboard` product creation and edit form SHALL render the category field as a `<select>` dropdown.
2. THE category dropdown SHALL contain exactly the following options, matching the `Category_Enum`: `ELECTRONICS`, `FOOD`, `CLOTHING`, `BEAUTY`, `SPORTS`, `OTHER`.
3. THE `AdminDashboard` SHALL NOT allow free-text entry for the category field.
4. WHEN the admin submits the product form, THE `AdminDashboard` SHALL include the selected `Category_Enum` value in the API request body.

---

### Requirement 11: Chat — Admin Reply REST Fallback

**User Story:** As an admin, I want my replies to be delivered even when the WebSocket connection is unavailable, so that support conversations are not silently dropped.

#### Acceptance Criteria

1. WHEN the admin sends a reply and the WebSocket client is connected, THE `ChatService` SHALL publish the reply via the STOMP destination `/app/chat.reply`.
2. WHEN the admin sends a reply and the WebSocket client is NOT connected, THE `ChatService` SHALL fall back to calling `POST /api/chat/admin/reply/{userId}` with the reply content.
3. IF both the WebSocket publish and the REST fallback fail, THEN THE `ChatService` SHALL propagate the error to the caller so the `AdminDashboard` can display an error message.
4. THE `AdminDashboard` SHALL display an error notification when an admin reply fails to send via both channels.

---

### Requirement 12: Email Verification Route

**User Story:** As a newly registered user, I want to click the verification link in my email and be taken to a page that confirms my account is verified, so that I can start using Gura Neza.

#### Acceptance Criteria

1. THE `App` SHALL register a route at `/verify` that renders a `VerifyPage` component.
2. WHEN the `VerifyPage` loads, THE `VerifyPage` SHALL read the `token` query parameter from the URL.
3. WHEN a `token` query parameter is present, THE `VerifyPage` SHALL call `GET /api/auth/verify?token={token}`.
4. WHEN the verification API call succeeds, THE `VerifyPage` SHALL display a success message and a link to navigate to `/login`.
5. IF the `token` query parameter is absent or the verification API call returns an error, THEN THE `VerifyPage` SHALL display a descriptive error message and a link to navigate to `/register`.
6. WHILE the verification API call is in-flight, THE `VerifyPage` SHALL display a loading indicator.
7. THE `/verify` route SHALL be accessible without authentication (it must not be wrapped in `ProtectedRoute`).

---

### Requirement 13: Product Image Fallback

**User Story:** As a shopper, I want to see a consistent placeholder image when a product image is unavailable, so that the UI does not show broken image icons or depend on external services.

#### Acceptance Criteria

1. WHEN a product's `imageUrl` is an empty string or `null`, THE `ProductCard` and `ProductDetail` SHALL render the `Local_Fallback_Image` instead.
2. WHEN a product image fails to load (the `onError` event fires), THE `ProductCard` and `ProductDetail` SHALL replace the broken image with the `Local_Fallback_Image`.
3. THE `Local_Fallback_Image` SHALL be a bundled static asset and SHALL NOT be an external URL (e.g., `https://via.placeholder.com`).
4. THE `Local_Fallback_Image` SHALL be consistent across all components that render product images.

---

### Requirement 14: Stock Validation Before Add to Cart

**User Story:** As a shopper, I want to be prevented from adding out-of-stock products to my cart, so that I don't proceed to checkout with items that cannot be fulfilled.

#### Acceptance Criteria

1. WHEN `product.stock` is `0`, THE `ProductCard` SHALL render the "Add to Cart" button in a disabled state.
2. WHEN `product.stock` is `0`, THE `ProductDetail` SHALL render the "Add to Cart" button and the "Buy Now & Pay Later" button in a disabled state.
3. WHEN `product.stock` is `0` and the user attempts to interact with the disabled "Add to Cart" button, THE `ProductCard` and `ProductDetail` SHALL NOT call `cartService.addToCart`.
4. WHEN `product.stock` is `0`, THE `ProductCard` SHALL display the "Out of Stock" stock status indicator.
5. WHEN `product.stock` is greater than `0`, THE `ProductCard` and `ProductDetail` SHALL allow the user to add the product to the cart normally.

---

### Requirement 15: Wallet Balance Real-Time Update After Admin Top-Up

**User Story:** As a user, I want my wallet balance to update automatically after an admin tops up my account, so that I don't have to refresh the page to see my new balance.

#### Acceptance Criteria

1. WHEN the `ChatWidget` receives a WebSocket message on the topic `/topic/user/{userId}/wallet`, THE `ChatWidget` SHALL update the `walletBalance` field in the `Store` with the new balance value from the message payload.
2. WHEN the `Store`'s `walletBalance` is updated, THE `Wallet` page balance display SHALL reflect the new value without requiring a page reload.
3. WHEN the `Store`'s `walletBalance` is updated, THE `Navbar` wallet balance indicator (if present) SHALL also reflect the new value.
4. THE wallet balance WebSocket subscription SHALL remain active for the duration of the user's authenticated session, regardless of whether the `ChatWidget` panel is open or closed.
