package com.dariusfirstproject.gura_neza.admin;

import com.dariusfirstproject.gura_neza.order.OrderRepository;
import com.dariusfirstproject.gura_neza.order.OrderStatus;
import com.dariusfirstproject.gura_neza.user.UserRepository;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        
        // Simple revenue calculation for today (Confirmed/Delivered orders)
        BigDecimal todayRevenue = orderRepository.findAll().stream()
                .filter(o -> o.getCreatedAt().isAfter(startOfDay))
                .filter(o -> o.getOrderStatus() != OrderStatus.PENDING)
                .map(o -> o.getTotalPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pendingOrders = orderRepository.findAll().stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.PENDING)
                .count();

        return ResponseEntity.ok(AdminStatsResponse.builder()
                .todayRevenue(todayRevenue)
                .pendingOrdersCount(pendingOrders)
                .totalUsersCount(userRepository.count())
                .supportQueueCount(0L) // TODO: Integrate when Chat/Support is ready
                .build());
    }
}
