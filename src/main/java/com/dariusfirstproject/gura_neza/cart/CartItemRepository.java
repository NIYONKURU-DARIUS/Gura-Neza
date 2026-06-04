package com.dariusfirstproject.gura_neza.cart;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem,Long> {
    @Query(value = "select c from cart_items c where c.cartId = ?1 and c.productId = ?2", nativeQuery = true)
    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);
    void deleteAllByCartId(Long cartId);
}
