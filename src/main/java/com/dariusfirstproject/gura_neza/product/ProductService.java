package com.dariusfirstproject.gura_neza.product;

import com.dariusfirstproject.gura_neza.user.User;
import com.dariusfirstproject.gura_neza.user.UserRepository;
import lombok.RequiredArgsConstructor;
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
                .isFeatured(request.isFeatured())
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
        product.setFeatured(request.isFeatured());
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