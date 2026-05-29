package com.dariusfirstproject.gura_neza.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    List<Order> findByOrderStatusAndCreatedAtBefore(OrderStatus status, LocalDateTime time);

    // For daily/weekly sales report
    List<Order> findByOrderStatusAndCreatedAtBetween(OrderStatus status, LocalDateTime from, LocalDateTime to);
}
