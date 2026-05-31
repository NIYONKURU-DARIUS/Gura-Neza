package com.dariusfirstproject.gura_neza.product;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name="products")
public class Product {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @Column(nullable=false)
    private String name;
    private String description;
    @Column(nullable=false)
    private BigDecimal price;
    @Column(nullable=false)
    private Integer stock;
    @Enumerated(EnumType.STRING)
    private Category category;
    @Builder.Default
    private Integer likesCount = 0;
    @Builder.Default
    private Double rating = 0.0;
    @Builder.Default
    private Integer totalReviews = 0;
    @Builder.Default
    private boolean isFeatured = false;
    private String imageUrl;
}
