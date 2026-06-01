package com.dariusfirstproject.gura_neza.admin;

import com.dariusfirstproject.gura_neza.order.Order;
import com.dariusfirstproject.gura_neza.order.OrderRepository;
import com.dariusfirstproject.gura_neza.order.OrderStatus;
import com.dariusfirstproject.gura_neza.product.ProductRepository;
import com.dariusfirstproject.gura_neza.user.UserRepository;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        List<Order> allOrders = orderRepository.findAll();

        // ── KPI calculations ─────────────────────────────────────────────────
        BigDecimal todayRevenue = allOrders.stream()
                .filter(o -> o.getCreatedAt().isAfter(startOfDay))
                .filter(o -> o.getOrderStatus() != OrderStatus.PENDING
                          && o.getOrderStatus() != OrderStatus.CANCELLED)
                .map(Order::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> o.getOrderStatus() != OrderStatus.PENDING
                          && o.getOrderStatus() != OrderStatus.CANCELLED)
                .map(Order::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pending   = allOrders.stream().filter(o -> o.getOrderStatus() == OrderStatus.PENDING).count();
        long confirmed = allOrders.stream().filter(o -> o.getOrderStatus() == OrderStatus.CONFIRMED).count();
        long delivered = allOrders.stream().filter(o -> o.getOrderStatus() == OrderStatus.DELIVERED).count();
        long cancelled = allOrders.stream().filter(o -> o.getOrderStatus() == OrderStatus.CANCELLED).count();

        long lowStock = productRepository.findAll().stream()
                .filter(p -> p.getStock() != null && p.getStock() < 10)
                .count();

        // ── Revenue chart — last 7 days ──────────────────────────────────────
        List<AdminStatsResponse.DailyRevenue> revenueChart = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = LocalDate.now().minusDays(i);
            LocalDateTime start = day.atStartOfDay();
            LocalDateTime end = day.plusDays(1).atStartOfDay();

            BigDecimal dayRevenue = allOrders.stream()
                    .filter(o -> o.getCreatedAt().isAfter(start) && o.getCreatedAt().isBefore(end))
                    .filter(o -> o.getOrderStatus() != OrderStatus.PENDING
                              && o.getOrderStatus() != OrderStatus.CANCELLED)
                    .map(Order::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long dayOrders = allOrders.stream()
                    .filter(o -> o.getCreatedAt().isAfter(start) && o.getCreatedAt().isBefore(end))
                    .count();

            String label = day.getDayOfWeek()
                    .getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

            revenueChart.add(AdminStatsResponse.DailyRevenue.builder()
                    .date(label)
                    .revenue(dayRevenue)
                    .orders(dayOrders)
                    .build());
        }

        // ── Orders by status ─────────────────────────────────────────────────
        Map<String, Long> ordersByStatus = new LinkedHashMap<>();
        ordersByStatus.put("PENDING",   pending);
        ordersByStatus.put("CONFIRMED", confirmed);
        ordersByStatus.put("DELIVERED", delivered);
        ordersByStatus.put("CANCELLED", cancelled);

        // ── Top 5 products by likes ──────────────────────────────────────────
        List<AdminStatsResponse.ProductStat> topProducts = productRepository.findAll().stream()
                .sorted(Comparator.comparingInt(p -> -(p.getLikesCount() != null ? p.getLikesCount() : 0)))
                .limit(5)
                .map(p -> AdminStatsResponse.ProductStat.builder()
                        .name(p.getName())
                        .likes(p.getLikesCount() != null ? p.getLikesCount() : 0)
                        .rating(p.getRating() != null ? p.getRating() : 0.0)
                        .stock(p.getStock() != null ? p.getStock() : 0)
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(AdminStatsResponse.builder()
                .todayRevenue(todayRevenue)
                .totalRevenue(totalRevenue)
                .pendingOrdersCount(pending)
                .confirmedOrdersCount(confirmed)
                .deliveredOrdersCount(delivered)
                .cancelledOrdersCount(cancelled)
                .totalOrdersCount((long) allOrders.size())
                .totalUsersCount(userRepository.count())
                .totalProductsCount(productRepository.count())
                .lowStockCount(lowStock)
                .supportQueueCount(0L)
                .revenueChart(revenueChart)
                .ordersByStatus(ordersByStatus)
                .topProducts(topProducts)
                .build());
    }
}
