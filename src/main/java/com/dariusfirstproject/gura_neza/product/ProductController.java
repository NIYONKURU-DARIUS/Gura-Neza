package com.dariusfirstproject.gura_neza.product;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductResponse>> searchProducts(@RequestParam String name) {
        return ResponseEntity.ok(productService.searchProducts(name));
    }

    @GetMapping("/paged")
    public ResponseEntity<org.springframework.data.domain.Page<ProductResponse>> getPagedProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(productService.getPagedProducts(page, size, sort, direction, category, search));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ProductResponse> createProduct(@RequestBody ProductRequest request) {
        return ResponseEntity.status(201).body(productService.createProduct(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Long id,
                                                         @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ProductResponse> likeProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.likeProduct(id));
    }

    @PostMapping("/{id}/rate")
    public ResponseEntity<ProductResponse> rateProduct(@PathVariable Long id,
                                                        @RequestBody java.util.Map<String, Integer> body) {
        return ResponseEntity.ok(productService.rateProduct(id, body.get("rating")));
    }

    @GetMapping("/{id}/can-rate")
    public ResponseEntity<Boolean> canRate(@PathVariable Long id) {
        return ResponseEntity.ok(productService.hasUserPurchased(id));
    }

    @GetMapping("/{id}/my-rating")
    public ResponseEntity<Integer> getMyRating(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getUserRating(id));
    }
}