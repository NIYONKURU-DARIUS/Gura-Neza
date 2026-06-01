package com.dariusfirstproject.gura_neza.wallet;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopUpRequestDto {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private BigDecimal amount;
    private TopUpRequestStatus status;
    private LocalDateTime createdAt;
}
