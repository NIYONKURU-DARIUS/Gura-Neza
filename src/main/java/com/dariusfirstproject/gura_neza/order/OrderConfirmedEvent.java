package com.dariusfirstproject.gura_neza.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderConfirmedEvent {
    private Long orderId;
    private Long userId;
    private String userEmail;
    private String userName;
    private BigDecimal totalAmount;
}
