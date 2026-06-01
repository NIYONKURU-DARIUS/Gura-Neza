# Requirements Document

## Introduction

This feature set extends **Gura Neza** — a Spring Boot 4 + React/TypeScript e-commerce platform — with four enhancements that close functional gaps in the current system:

1. **Wallet Top-up Request System**: Users can submit a top-up request from the Wallet page. Admins see pending requests in the dashboard and can approve or reject them. Approval credits the user's wallet and sends a notification email.
2. **Order Delivery Email with PDF Receipt**: When an admin marks an order as "Delivered", the system sends a confirmation email to the customer containing a PDF receipt attachment.
3. **Product Catalog Sorting & Pagination**: The sort dropdown on the product catalog page becomes functional (Recommended / Price: Low to High / Price: High to Low), and the catalog loads products in pages rather than all at once.
4. **Real Product Ratings & Likes**: Product ratings and review counts are driven by real data. The like/unlike toggle is fully wired end-to-end. Users who have purchased a product can submit a 1–5 star rating.

---

## Glossary

- **TopUpRequest**: A user-initiated request entity stored in the database with a requested amount and a status of `PENDING`, `APPROVED`, or `REJECTED`.
- **TopUpRequest_Status**: The enumeration of top-up request states: `PENDING`, `APPROVED`, `REJECTED`.
- **WalletController**: The Spring REST controller at `/api/wallet/` that handles wallet operations.
- **WalletService**: The Spring service that manages wallet balance, transactions, and top-up request lifecycle.
- **TopUpRequestRepository**: The JPA repository for persisting and querying `TopUpRequest` entities.
- **AdminDashboard**: The `/admin` React page used by ADMIN-role users to manage products, orders, users, and top-up requests.
- **Wallet_Page**: The `/wallet` React page showing the user's balance, transaction history, and top-up request form.
- **ProductCatalog**: The `/products` React page listing all products with category filtering, sorting, and pagination.
- **ProductDetail**: The `/product/:id` React page showing a single product's full details and the rating submission form.
- **ProductCard**: The reusable card component rendered inside `ProductCatalog`.
- **ProductService**: The Spring service and `productService.ts` frontend module that wrap all product operations.
- **ProductRating**: A new entity that stores a single user's star rating (1–5) for a specific product, linked to a completed order.
- **ProductRatingRepository**: The JPA repository for `ProductRating` entities.
- **OrderService**: The Spring service that manages order lifecycle including the delivery transition.
- **EmailService**: The Spring service that sends transactional emails via JavaMailSender with Thymeleaf templates.
- **PdfReceiptService**: The Spring service that generates a PDF receipt byte array from an `OrderResponse`.
- **Page_Response**: A paginated API response wrapper containing a list of items, current page number, page size, total elements, and total pages.
- **SortOption**: The frontend enumeration of sort choices: `RECOMMENDED`, `PRICE_ASC`, `PRICE_DESC`.
- **likedByCurrentUser**: A boolean field on `ProductResponse` indicating whether the authenticated user has liked the product.
- **PurchasedProduct**: A product that appears in at least one `DELIVERED` order belonging to the current user.

---

## Requirements

### Requirement 1: Wallet Top-up Request — User Submission

**User Story:** As a user, I want to submit a wallet top-up request from my Wallet page, so that an admin can review and credit my account.

#### Acceptance Criteria

1. WHEN the user clicks the "Top Up" button on the `Wallet_Page`, THE `Wallet_Page` SHALL display a modal form with an amount input field and a submit button.
2. THE `Wallet_Page` SHALL validate that the entered amount is a positive number greater than zero before enabling the submit button.
3. WHEN the user submits a valid amount, THE `WalletService` SHALL persist a new `TopUpRequest` entity with `status = PENDING`, the requesting user's ID, and the requested amount, and SHALL NOT display any error messages during a successful submission.
4. WHEN the `TopUpRequest` is successfully persisted, THE `Wallet_Page` SHALL close the modal and display a success message informing the user that the request is pending admin review.
5. IF the submission API call fails, THEN THE `Wallet_Page` SHALL display an inline error message inside the modal, SHALL NOT close the modal, and SHALL NOT display any success message.
6. THE `Wallet_Page` SHALL display a read-only list of the current user's past top-up requests, showing the amount, status (`PENDING`, `APPROVED`, or `REJECTED`), and submission date.
7. WHILE a top-up submission request is in-flight, THE `Wallet_Page` SHALL disable the submit button and display a loading indicator.

---

### Requirement 2: Wallet Top-up Request — Admin Review

**User Story:** As an admin, I want to see all pending wallet top-up requests and approve or reject them, so that I can control fund disbursement.

#### Acceptance Criteria

1. THE `AdminDashboard` SHALL include a "Top-Up Requests" section accessible from the admin navigation sidebar.
2. WHEN the admin navigates to the "Top-Up Requests" section, THE `AdminDashboard` SHALL fetch and display all `TopUpRequest` records, grouped or filterable by status (`ALL`, `PENDING`, `APPROVED`, `REJECTED`).
3. THE `AdminDashboard` SHALL display for each request: the requesting user's name, the requested amount, the submission date, and the current status.
4. WHEN the admin clicks "Approve" on a `PENDING` request, THE `WalletService` SHALL update the `TopUpRequest` status to `APPROVED`, credit the user's wallet by the requested amount, record a `CREDIT` transaction, and send a wallet top-up notification email to the user.
5. WHEN the admin clicks "Reject" on a `PENDING` request, THE `WalletService` SHALL update the `TopUpRequest` status to `REJECTED` without modifying the user's wallet balance.
6. IF the approve or reject action fails, THEN THE `AdminDashboard` SHALL display an error notification and leave the request status unchanged.
7. WHEN a `TopUpRequest` has status `APPROVED` or `REJECTED`, THE `AdminDashboard` SHALL render the Approve and Reject buttons in a disabled state for that request.
8. THE admin navigation sidebar badge for "Top-Up Requests" SHALL display the count of `PENDING` requests and SHALL update after each approve or reject action.

---

### Requirement 3: Order Delivery Email with PDF Receipt

**User Story:** As a customer, I want to receive a confirmation email with a PDF receipt when my order is marked as delivered, so that I have a record of the completed transaction.

#### Acceptance Criteria

1. WHEN the admin marks an order as `DELIVERED` via `OrderService.deliverOrder`, THE `OrderService` SHALL call `EmailService.sendOrderDeliveryEmail` with the order details and the customer's name and email address.
2. THE `EmailService.sendOrderDeliveryEmail` method SHALL render a Thymeleaf HTML email template that includes the order ID, delivery confirmation message, list of ordered items, and total price.
3. THE `EmailService.sendOrderDeliveryEmail` method SHALL attach a PDF receipt generated by `PdfReceiptService.generateReceipt` to the email.
4. IF the email sending fails, THEN THE `EmailService` SHALL log the failure at WARN level and SHALL NOT throw an exception that would roll back the order status update.
5. THE delivery confirmation email SHALL be sent to the email address stored on the `Order`'s associated `User` entity.
6. THE PDF receipt attached to the delivery email SHALL include the order ID, customer name, list of items with quantities and unit prices, and the total price.

---

### Requirement 4: Product Catalog — Functional Sort Control

**User Story:** As a shopper, I want to sort the product catalog by price or relevance, so that I can find the most relevant products quickly.

#### Acceptance Criteria

1. THE `ProductCatalog` SHALL render a sort select control with the options: `Recommended`, `Price: Low to High`, and `Price: High to Low`.
2. WHEN the user selects `Price: Low to High`, THE `ProductCatalog` SHALL re-order the displayed product list in ascending order of `product.price`.
3. WHEN the user selects `Price: High to Low`, THE `ProductCatalog` SHALL re-order the displayed product list in descending order of `product.price`.
4. WHEN the user selects `Recommended`, THE `ProductCatalog` SHALL display the product list in the original order returned by the API.
5. WHEN a category filter or search query is active, THE `ProductCatalog` SHALL apply the selected sort order to the already-filtered result set.
6. WHEN the product list is empty after filtering and sorting, THE `ProductCatalog` SHALL display the existing empty-state message.

---

### Requirement 5: Product Catalog — Pagination

**User Story:** As a shopper, I want the product catalog to load products in pages, so that the page loads quickly even when there are many products.

#### Acceptance Criteria

1. THE `ProductService` (backend) SHALL expose a paginated endpoint `GET /api/products/paged?page={page}&size={size}&sort={sort}` that returns a `Page_Response` containing the product list for the requested page.
2. THE `ProductCatalog` SHALL fetch products using the paginated endpoint, defaulting to page `0` and page size `12`.
3. THE `ProductCatalog` SHALL render pagination controls (previous page button, next page button, and current page indicator) below the product grid.
4. WHEN the user clicks the next page button, THE `ProductCatalog` SHALL fetch and display the next page of products.
5. WHEN the user clicks the previous page button, THE `ProductCatalog` SHALL fetch and display the previous page of products.
6. WHEN the user is on the first page, THE `ProductCatalog` SHALL render the previous page button in a disabled state.
7. WHEN the user is on the last page, THE `ProductCatalog` SHALL render the next page button in a disabled state.
8. WHEN the user changes the category filter, search query, or sort option, or interacts with any filter control, THE `ProductCatalog` SHALL reset to page `0` and fetch the first page of the filtered/sorted results.
9. THE `Page_Response` SHALL include: `content` (list of products), `page` (current page index), `size` (page size), `totalElements` (total product count), and `totalPages` (total number of pages).

---

### Requirement 6: Product Likes — Full End-to-End Wiring

**User Story:** As a shopper, I want to like or unlike a product from the catalog or detail page, so that I can save products I'm interested in.

#### Acceptance Criteria

1. WHEN the `ProductCard` renders, THE `ProductCard` SHALL initialize the Heart button's filled/unfilled state from the `likedByCurrentUser` field of the product API response.
2. WHEN the `ProductDetail` page loads, THE `ProductDetail` SHALL initialize the Heart button's filled/unfilled state from the `likedByCurrentUser` field of the API response.
3. WHEN the user clicks the Heart button on a `ProductCard` or `ProductDetail`, THE component SHALL call `productService.likeProduct(product.id)`, immediately toggle the Heart button's filled/unfilled state, and increment or decrement the `likesCount` by one as an optimistic UI update before the response arrives.
4. WHEN `productService.likeProduct` returns successfully, THE component SHALL update the Heart button state and `likesCount` with the values from the server response.
5. IF `productService.likeProduct` returns an error, THEN THE component SHALL revert the Heart button state and `likesCount` to their pre-click values.
6. WHILE a like request is in-flight, THE component SHALL disable the Heart button to prevent duplicate requests.
7. THE `ProductDetail` page SHALL display the `likesCount` value from the API response next to the Heart button.

---

### Requirement 7: Product Ratings — Submission After Purchase

**User Story:** As a customer who has received a delivered order, I want to rate a product I purchased with 1–5 stars, so that other shoppers can benefit from my experience.

#### Acceptance Criteria

1. THE `ProductService` (backend) SHALL expose an endpoint `POST /api/products/{id}/rate` that accepts a `ratingValue` (integer 1–5) from the authenticated user.
2. WHEN a user submits a rating, THE `ProductService` SHALL verify that the user has at least one `DELIVERED` order containing the product before persisting the rating.
3. IF the user has no `DELIVERED` order containing the product, THEN THE `ProductService` SHALL return a `400 Bad Request` error with the message "You can only rate products you have purchased and received."
4. WHEN a valid rating is submitted, THE `ProductService` SHALL persist a `ProductRating` entity and recalculate the product's `rating` (average of all ratings) and `totalReviews` (count of all ratings) fields on the `Product` entity.
5. WHEN a user submits a rating for a product they have already rated, THE `ProductService` SHALL update the existing `ProductRating` rather than creating a duplicate.
6. THE `ProductDetail` page SHALL display a star rating input (1–5 stars) for authenticated users who have a `DELIVERED` order containing the product.
7. WHEN the user submits a rating from `ProductDetail`, THE `ProductDetail` SHALL call `productService.rateProduct(product.id, ratingValue)`, wait for a successful persistence confirmation from the backend, and then update the displayed `rating` and `totalReviews` with the values from the server response.
8. IF `productService.rateProduct` returns a `400` error, THEN THE `ProductDetail` SHALL display the error message returned by the server.
9. THE `ProductDetail` SHALL display the current `rating` (formatted to one decimal place) and `totalReviews` count from the product API response.
10. WHEN `product.totalReviews` is `0`, THE `ProductDetail` SHALL display a message indicating no reviews are available yet.

---

### Requirement 8: Product Ratings — Display in Catalog

**User Story:** As a shopper, I want to see real average ratings and review counts on product cards, so that I can compare products at a glance.

#### Acceptance Criteria

1. THE `ProductCard` SHALL display the `rating` value (formatted to one decimal place) from the product API response.
2. THE `ProductCard` SHALL display the `totalReviews` count from the product API response.
3. WHEN `product.rating` is `0.0` and `product.totalReviews` is `0`, THE `ProductCard` SHALL display a "No ratings yet" indicator instead of a numeric rating.
4. THE `ProductCard` SHALL NOT use hardcoded or randomly generated rating or review count values.
