package com.dariusfirstproject.gura_neza.scheduler;

import com.dariusfirstproject.gura_neza.order.Order;
import com.dariusfirstproject.gura_neza.order.OrderRepository;
import com.dariusfirstproject.gura_neza.order.OrderStatus;
import com.dariusfirstproject.gura_neza.product.Product;
import com.dariusfirstproject.gura_neza.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppScheduler {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    // Restock threshold — alert if stock is at or below this
    private static final int LOW_STOCK_THRESHOLD = 5;

    // Cancel PENDING orders older than 15 minutes — runs every minute
    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void cancelUnpaidOrders() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(15);
        List<Order> staleOrders = orderRepository
                .findByOrderStatusAndCreatedAtBefore(OrderStatus.PENDING, cutoff);

        if (staleOrders.isEmpty()) return;

        staleOrders.forEach(order -> {
            order.setOrderStatus(OrderStatus.CANCELLED);
            log.info("Auto-cancelled unpaid order #{} (placed at {})", order.getId(), order.getCreatedAt());
        });

        orderRepository.saveAll(staleOrders);
        log.info("Cancelled {} unpaid order(s)", staleOrders.size());
    }

    // Daily sales report — runs every day at 11:59 PM
    @Scheduled(cron = "0 59 23 * * *")
    public void dailySalesReport() {
        LocalDateTime start = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime end = LocalDateTime.now();

        List<Order> orders = orderRepository
                .findByOrderStatusAndCreatedAtBetween(OrderStatus.CONFIRMED, start, end);

        BigDecimal totalRevenue = orders.stream()
                .map(Order::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        log.info("===== DAILY SALES REPORT =====");
        log.info("Date: {}", start.toLocalDate());
        log.info("Total orders: {}", orders.size());
        log.info("Total revenue: {} RWF", totalRevenue);
        log.info("==============================");
    }

    // Weekly sales report — runs every Sunday at 11:58 PM
    @Scheduled(cron = "0 58 23 * * SUN")
    public void weeklySalesReport() {
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusDays(7);

        List<Order> orders = orderRepository
                .findByOrderStatusAndCreatedAtBetween(OrderStatus.CONFIRMED, start, end);

        BigDecimal totalRevenue = orders.stream()
                .map(Order::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        log.info("===== WEEKLY SALES REPORT =====");
        log.info("Period: {} to {}", start.toLocalDate(), end.toLocalDate());
        log.info("Total orders: {}", orders.size());
        log.info("Total revenue: {} RWF", totalRevenue);
        log.info("===============================");
    }

    // Restock alert — runs every day at 8:00 AM
    @Scheduled(cron = "0 0 8 * * *")
    public void restockAlert() {
        List<Product> lowStockProducts = productRepository
                .findByStockLessThanEqual(LOW_STOCK_THRESHOLD);

        if (lowStockProducts.isEmpty()) {
            log.info("Restock check: all products sufficiently stocked.");
            return;
        }

        log.warn("===== LOW STOCK ALERT =====");
        lowStockProducts.forEach(p ->
                log.warn("Product '{}' (ID: {}) has only {} unit(s) left!",
                        p.getName(), p.getId(), p.getStock())
        );
        log.warn("===========================");
    }
}