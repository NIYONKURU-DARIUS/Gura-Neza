package com.dariusfirstproject.gura_neza.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private Category category;
    private Integer likesCount;
    private Double rating;
    private Integer totalReviews;
    private boolean isFeatured;
    private String imageUrl;
    private boolean likedByCurrentUser;
}
