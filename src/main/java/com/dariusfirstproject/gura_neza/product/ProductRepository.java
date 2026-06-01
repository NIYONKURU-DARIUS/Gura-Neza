package com.dariusfirstproject.gura_neza.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByNameContainingIgnoreCase(String name);

    // Paged by category
    Page<Product> findByCategory(String category, Pageable pageable);

    // Paged search with optional category
    Page<Product> findByNameContainingIgnoreCaseAndCategory(String name, String category, Pageable pageable);
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    // For restock alerts
    List<Product> findByStockLessThanEqual(Integer threshold);
}