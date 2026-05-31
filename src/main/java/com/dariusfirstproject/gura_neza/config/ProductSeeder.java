package com.dariusfirstproject.gura_neza.config;

import com.dariusfirstproject.gura_neza.product.Category;
import com.dariusfirstproject.gura_neza.product.Product;
import com.dariusfirstproject.gura_neza.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class ProductSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;

    @Override
    public void run(String... args) {
        if (productRepository.count() == 0) {
            Product p1 = Product.builder()
                    .name("Emerald Smart Watch")
                    .description("Premium smart watch with emerald bezel and high-performance sensors.")
                    .price(new BigDecimal("299.99"))
                    .category(Category.ELECTRONICS)
                    .imageUrl("https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?auto=format&fit=crop&q=80&w=800")
                    .stock(15)
                    .likesCount(45)
                    .rating(4.8)
                    .isFeatured(true)
                    .build();

            Product p2 = Product.builder()
                    .name("Arabica Coffee Set")
                    .description("Grown in the mountains of Rwanda, this set includes 3 premium blends.")
                    .price(new BigDecimal("35.50"))
                    .category(Category.FOOD)
                    .imageUrl("https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=800")
                    .stock(50)
                    .likesCount(120)
                    .rating(4.9)
                    .isFeatured(true)
                    .build();

            Product p3 = Product.builder()
                    .name("Premium Laptop Pro")
                    .description("Ultra-thin laptop with M2-equivalent performance and liquid retina display.")
                    .price(new BigDecimal("1299.00"))
                    .category(Category.ELECTRONICS)
                    .imageUrl("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800")
                    .stock(5)
                    .likesCount(20)
                    .rating(4.7)
                    .isFeatured(false)
                    .build();

            Product p4 = Product.builder()
                    .name("Kigali Cotton Shirt")
                    .description("Hand-crafted 100% organic cotton shirt with traditional patterns.")
                    .price(new BigDecimal("45.00"))
                    .category(Category.CLOTHING)
                    .imageUrl("https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800")
                    .stock(24)
                    .likesCount(88)
                    .rating(4.5)
                    .isFeatured(false)
                    .build();

            productRepository.saveAll(Arrays.asList(p1, p2, p3, p4));
            System.out.println("Default products seeded successfully.");
        }
    }
}
