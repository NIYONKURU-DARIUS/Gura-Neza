package com.dariusfirstproject.gura_neza.product;

import com.dariusfirstproject.gura_neza.order.OrderRepository;
import com.dariusfirstproject.gura_neza.user.User;
import com.dariusfirstproject.gura_neza.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductService Unit Tests")
class ProductServiceTest {

    @Mock private ProductRepository productRepository;
    @Mock private ProductLikeRepository productLikeRepository;
    @Mock private UserRepository userRepository;
    @Mock private ProductRatingRepository productRatingRepository;
    @Mock private OrderRepository orderRepository;

    @InjectMocks
    private ProductService productService;

    private User mockUser;
    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .build();

        sampleProduct = Product.builder()
                .id(1L)
                .name("Laptop")
                .description("A great laptop")
                .price(new BigDecimal("999.99"))
                .stock(10)
                .category(Category.ELECTRONICS)
                .likesCount(0)
                .rating(0.0)
                .totalReviews(0)
                .build();

        // Mock security context so getCurrentUser() works
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("test@example.com");
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(ctx);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
    }

    // ── createProduct ────────────────────────────────────────────────────────

    @Test
    @DisplayName("createProduct: saves and returns response when request is valid")
    void createProduct_validRequest_returnsResponse() {
        ProductRequest request = ProductRequest.builder()
                .name("Laptop")
                .description("A great laptop")
                .price(new BigDecimal("999.99"))
                .stock(10)
                .category(Category.ELECTRONICS)
                .build();

        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);
        when(productLikeRepository.existsByUserIdAndProductId(anyLong(), anyLong())).thenReturn(false);

        ProductResponse response = productService.createProduct(request);

        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("Laptop");
        assertThat(response.getPrice()).isEqualByComparingTo("999.99");
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("createProduct: throws when name is blank")
    void createProduct_blankName_throwsException() {
        ProductRequest request = ProductRequest.builder()
                .name("   ")
                .price(new BigDecimal("10.00"))
                .stock(5)
                .build();

        assertThatThrownBy(() -> productService.createProduct(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Product name is required");

        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("createProduct: throws when price is zero")
    void createProduct_zeroPriceThrowsException() {
        ProductRequest request = ProductRequest.builder()
                .name("Item")
                .price(BigDecimal.ZERO)
                .stock(5)
                .build();

        assertThatThrownBy(() -> productService.createProduct(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("price must be greater than zero");
    }

    @Test
    @DisplayName("createProduct: throws when stock is negative")
    void createProduct_negativeStock_throwsException() {
        ProductRequest request = ProductRequest.builder()
                .name("Item")
                .price(new BigDecimal("10.00"))
                .stock(-1)
                .build();

        assertThatThrownBy(() -> productService.createProduct(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("stock cannot be negative");
    }

    // ── getProductById ───────────────────────────────────────────────────────

    @Test
    @DisplayName("getProductById: returns response when product exists")
    void getProductById_exists_returnsResponse() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(productLikeRepository.existsByUserIdAndProductId(anyLong(), anyLong())).thenReturn(false);

        ProductResponse response = productService.getProductById(1L);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("Laptop");
    }

    @Test
    @DisplayName("getProductById: throws when product not found")
    void getProductById_notFound_throwsException() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getProductById(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Product not found");
    }

    // ── getAllProducts ───────────────────────────────────────────────────────

    @Test
    @DisplayName("getAllProducts: returns list of all products")
    void getAllProducts_returnsList() {
        when(productRepository.findAll()).thenReturn(List.of(sampleProduct));
        when(productLikeRepository.existsByUserIdAndProductId(anyLong(), anyLong())).thenReturn(false);

        List<ProductResponse> result = productService.getAllProducts();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Laptop");
    }

    // ── updateProduct ────────────────────────────────────────────────────────

    @Test
    @DisplayName("updateProduct: updates fields and returns updated response")
    void updateProduct_validRequest_updatesProduct() {
        ProductRequest request = ProductRequest.builder()
                .name("Updated Laptop")
                .description("Updated desc")
                .price(new BigDecimal("1199.99"))
                .stock(5)
                .category(Category.ELECTRONICS)
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));
        when(productLikeRepository.existsByUserIdAndProductId(anyLong(), anyLong())).thenReturn(false);

        ProductResponse response = productService.updateProduct(1L, request);

        assertThat(response.getName()).isEqualTo("Updated Laptop");
        assertThat(response.getPrice()).isEqualByComparingTo("1199.99");
    }

    @Test
    @DisplayName("updateProduct: throws when product not found")
    void updateProduct_notFound_throwsException() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.updateProduct(99L, new ProductRequest()))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Product not found");
    }

    // ── deleteProduct ────────────────────────────────────────────────────────

    @Test
    @DisplayName("deleteProduct: deletes product when it exists")
    void deleteProduct_exists_deletesSuccessfully() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));

        productService.deleteProduct(1L);

        verify(productRepository).delete(sampleProduct);
    }

    @Test
    @DisplayName("deleteProduct: throws when product not found")
    void deleteProduct_notFound_throwsException() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.deleteProduct(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Product not found");
    }

    // ── likeProduct ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("likeProduct: increments likesCount when not yet liked")
    void likeProduct_notYetLiked_incrementsCount() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(productLikeRepository.findByUserIdAndProductId(1L, 1L)).thenReturn(Optional.empty());
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));
        when(productLikeRepository.existsByUserIdAndProductId(anyLong(), anyLong())).thenReturn(true);

        ProductResponse response = productService.likeProduct(1L);

        assertThat(response.getLikesCount()).isEqualTo(1);
        verify(productLikeRepository).save(any(ProductLike.class));
    }

    @Test
    @DisplayName("likeProduct: decrements likesCount when already liked (toggle off)")
    void likeProduct_alreadyLiked_decrementsCount() {
        sampleProduct.setLikesCount(3);
        ProductLike existingLike = ProductLike.builder()
                .user(mockUser).product(sampleProduct).build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(productLikeRepository.findByUserIdAndProductId(1L, 1L)).thenReturn(Optional.of(existingLike));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));
        when(productLikeRepository.existsByUserIdAndProductId(anyLong(), anyLong())).thenReturn(false);

        ProductResponse response = productService.likeProduct(1L);

        assertThat(response.getLikesCount()).isEqualTo(2);
        verify(productLikeRepository).delete(existingLike);
    }

    // ── rateProduct ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("rateProduct: throws when rating is out of range")
    void rateProduct_invalidRating_throwsException() {
        assertThatThrownBy(() -> productService.rateProduct(1L, 6))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Rating must be between 1 and 5");

        assertThatThrownBy(() -> productService.rateProduct(1L, 0))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Rating must be between 1 and 5");
    }

    @Test
    @DisplayName("rateProduct: throws when user has not purchased the product")
    void rateProduct_notPurchased_throwsException() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(orderRepository.findByUserId(1L)).thenReturn(List.of());

        assertThatThrownBy(() -> productService.rateProduct(1L, 4))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("only rate products you have purchased");
    }

    // ── getPagedProducts ─────────────────────────────────────────────────────

    @Test
    @DisplayName("getPagedProducts: returns page of all products when no filters")
    void getPagedProducts_noFilters_returnsPage() {
        Page<Product> page = new PageImpl<>(List.of(sampleProduct));
        when(productRepository.findAll(any(Pageable.class))).thenReturn(page);
        when(productLikeRepository.existsByUserIdAndProductId(anyLong(), anyLong())).thenReturn(false);

        Page<ProductResponse> result = productService.getPagedProducts(0, 12, "id", "asc", null, null);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Laptop");
    }

    @Test
    @DisplayName("getPagedProducts: filters by category when category is provided")
    void getPagedProducts_withCategory_filtersByCategory() {
        Page<Product> page = new PageImpl<>(List.of(sampleProduct));
        when(productRepository.findByCategory(eq(Category.ELECTRONICS), any(Pageable.class))).thenReturn(page);
        when(productLikeRepository.existsByUserIdAndProductId(anyLong(), anyLong())).thenReturn(false);

        Page<ProductResponse> result = productService.getPagedProducts(0, 12, "id", "asc", "ELECTRONICS", null);

        assertThat(result.getContent()).hasSize(1);
        verify(productRepository).findByCategory(eq(Category.ELECTRONICS), any(Pageable.class));
    }

    @Test
    @DisplayName("getPagedProducts: searches by name when search term is provided")
    void getPagedProducts_withSearch_searchesByName() {
        Page<Product> page = new PageImpl<>(List.of(sampleProduct));
        when(productRepository.findByNameContainingIgnoreCase(eq("Laptop"), any(Pageable.class))).thenReturn(page);
        when(productLikeRepository.existsByUserIdAndProductId(anyLong(), anyLong())).thenReturn(false);

        Page<ProductResponse> result = productService.getPagedProducts(0, 12, "id", "asc", null, "Laptop");

        assertThat(result.getContent()).hasSize(1);
        verify(productRepository).findByNameContainingIgnoreCase(eq("Laptop"), any(Pageable.class));
    }
}
