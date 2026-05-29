package com.dariusfirstproject.gura_neza.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByNameContainingIgnoreCase(String name);

    // For restock alerts
    List<Product> findByStockLessThanEqual(Integer threshold);
}