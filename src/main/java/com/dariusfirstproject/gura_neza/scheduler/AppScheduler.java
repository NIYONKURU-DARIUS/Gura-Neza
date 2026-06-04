package com.dariusfirstproject.gura_neza.scheduler;

import com.dariusfirstproject.gura_neza.email.EmailService;
import com.dariusfirstproject.gura_neza.order.Order;
import com.dariusfirstproject.gura_neza.order.OrderItemRepository;
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
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppScheduler {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final EmailService emailService;

    private static final int LOW_STOCK_THRESHOLD = 5;

    // ── Runs every minute: cancel PENDING orders older than 15 min ──────────
    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void cancelUnpaidOrders() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(15);
        List<Order> staleOrders = orderRepository
                .findByOrderStatusAndCreatedAtBefore(OrderStatus.PENDING, cutoff);

        if (staleOrders.isEmpty()) return;

        staleOrders.forEach(order -> {
            // Restore stock for each item in the cancelled order
            order.setItems(orderItemRepository.findByOrderId(order.getId()));
            order.getItems().forEach(item -> {
                Product product = item.getProduct();
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
                log.info("Restored {} unit(s) of '{}' after order #{} cancellation",
                        item.getQuantity(), product.getName(), order.getId());
            });

            // Send cancellation email to the user
            try {
                emailService.sendOrderCancellationEmail(
                        order.getUser().getEmail(),
                        order.getUser().getName(),
                        order.getId(),
                        order.getTotalPrice()
                );
            } catch (Exception e) {
                log.error("Failed to send cancellation email for order #{}: {}", order.getId(), e.getMessage());
            }

            order.setOrderStatus(OrderStatus.CANCELLED);
            log.info("Auto-cancelled order #{} (placed at {})", order.getId(), order.getCreatedAt());
        });

        orderRepository.saveAll(staleOrders);
        log.info("Cancelled {} unpaid order(s)", staleOrders.size());
    }

    // FIX: was missing — runs every hour: log products below LOW_STOCK_THRESHOLD ─
    @Scheduled(fixedRate = 3_600_000)
    @Transactional
    public void checkLowStockProducts() {
        List<Product> lowStockProducts = productRepository.findByStockLessThanEqual(LOW_STOCK_THRESHOLD);

        if (lowStockProducts.isEmpty()) {
            log.info("Low-stock check: all products are sufficiently stocked.");
            return;
        }

        log.warn("Low-stock alert — {} product(s) at or below {} units:", lowStockProducts.size(), LOW_STOCK_THRESHOLD);
        lowStockProducts.forEach(product ->
                log.warn("  → [{}] '{}' — {} unit(s) remaining", product.getId(), product.getName(), product.getStock())
        );
    }

    // FIX: was missing — runs every day at midnight: log daily sales summary ──
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void dailySalesReport() {
        LocalDateTime from = LocalDateTime.now().minusDays(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime to   = from.plusDays(1);

        List<Order> confirmedOrders = orderRepository
                .findByOrderStatusAndCreatedAtBetween(OrderStatus.CONFIRMED, from, to);

        BigDecimal totalRevenue = confirmedOrders.stream()
                .map(Order::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String reportDate = from.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        log.info("Daily sales report for {} — {} order(s) confirmed — Total revenue: {} RWF",
                reportDate, confirmedOrders.size(), totalRevenue);
    }
}