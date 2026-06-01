package com.dariusfirstproject.gura_neza.product;

import com.dariusfirstproject.gura_neza.user.User;
import com.dariusfirstproject.gura_neza.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductLikeRepository productLikeRepository;
    private final UserRepository userRepository;
    private final ProductRatingRepository productRatingRepository;
    private final com.dariusfirstproject.gura_neza.order.OrderRepository orderRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    public ProductResponse createProduct(ProductRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new RuntimeException("Product name is required");
        }
        if (request.getPrice() == null || request.getPrice().doubleValue() <= 0) {
            throw new RuntimeException("Product price must be greater than zero");
        }
        if (request.getStock() == null || request.getStock() < 0) {
            throw new RuntimeException("Product stock cannot be negative");
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .category(request.getCategory())
                .isFeatured(request.getFeatured() != null && request.getFeatured())
                .imageUrl(request.getImageUrl())
                .build();

        return mapToResponse(productRepository.save(product));
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return mapToResponse(product);
    }

    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(request.getCategory());
        product.setFeatured(request.getFeatured() != null && request.getFeatured());
        product.setImageUrl(request.getImageUrl());

        return mapToResponse(productRepository.save(product));
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        productRepository.delete(product);
    }

    public List<ProductResponse> searchProducts(String name) {
        return productRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Page<ProductResponse> getPagedProducts(int page, int size, String sort, String direction) {
        Sort.Direction dir = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sort));
        return productRepository.findAll(pageable).map(this::mapToResponse);
    }

    // ── Product Ratings ──────────────────────────────────────────────────

    public ProductResponse rateProduct(Long productId, int ratingValue) {
        if (ratingValue < 1 || ratingValue > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }
        User user = getCurrentUser();
        if (user == null) {
            throw new RuntimeException("User not authenticated");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Verify user has a DELIVERED order containing this product
        boolean hasPurchased = orderRepository.findByUserId(user.getId()).stream()
                .filter(o -> o.getOrderStatus() == com.dariusfirstproject.gura_neza.order.OrderStatus.DELIVERED)
                .flatMap(o -> o.getItems().stream())
                .anyMatch(item -> item.getProduct().getId().equals(productId));

        if (!hasPurchased) {
            throw new RuntimeException("You can only rate products you have purchased and received.");
        }

        // Upsert rating
        Optional<ProductRating> existing = productRatingRepository.findByProductIdAndUserId(productId, user.getId());
        if (existing.isPresent()) {
            existing.get().setRating(ratingValue);
            productRatingRepository.save(existing.get());
        } else {
            ProductRating newRating = ProductRating.builder()
                    .product(product)
                    .user(user)
                    .rating(ratingValue)
                    .createdAt(java.time.LocalDateTime.now())
                    .build();
            productRatingRepository.save(newRating);
        }

        // Recalculate average and count
        Double avg = productRatingRepository.findAverageRatingByProductId(productId);
        Long count = productRatingRepository.countByProductId(productId);
        product.setRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        product.setTotalReviews(count != null ? count.intValue() : 0);
        return mapToResponse(productRepository.save(product));
    }

    public boolean hasUserPurchased(Long productId) {
        User user = getCurrentUser();
        if (user == null) return false;
        return orderRepository.findByUserId(user.getId()).stream()
                .filter(o -> o.getOrderStatus() == com.dariusfirstproject.gura_neza.order.OrderStatus.DELIVERED)
                .flatMap(o -> o.getItems().stream())
                .anyMatch(item -> item.getProduct().getId().equals(productId));
    }

    /**
     * Toggles a like for the current user on the given product.
     * - If the user has NOT liked it: adds a like (likesCount++)
     * - If the user HAS already liked it: removes the like (likesCount--)
     */
    public ProductResponse likeProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        User user = getCurrentUser();
        if (user == null) {
            throw new RuntimeException("User not authenticated");
        }

        Optional<ProductLike> existingLike = productLikeRepository.findByUserIdAndProductId(user.getId(), id);

        if (existingLike.isPresent()) {
            // Already liked — toggle off (unlike)
            productLikeRepository.delete(existingLike.get());
            product.setLikesCount(Math.max(0, product.getLikesCount() - 1));
        } else {
            // Not yet liked — add like
            ProductLike newLike = ProductLike.builder()
                    .user(user)
                    .product(product)
                    .build();
            productLikeRepository.save(newLike);
            product.setLikesCount(product.getLikesCount() + 1);
        }

        return mapToResponse(productRepository.save(product));
    }

    private ProductResponse mapToResponse(Product product) {
        User user = getCurrentUser();
        boolean likedByCurrentUser = false;
        if (user != null) {
            likedByCurrentUser = productLikeRepository.existsByUserIdAndProductId(user.getId(), product.getId());
        }

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .category(product.getCategory())
                .likesCount(product.getLikesCount())
                .rating(product.getRating())
                .totalReviews(product.getTotalReviews())
                .isFeatured(product.isFeatured())
                .imageUrl(product.getImageUrl())
                .likedByCurrentUser(likedByCurrentUser)
                .build();
    }
}