package com.dariusfirstproject.gura_neza.wallet;

import com.dariusfirstproject.gura_neza.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "topup_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopUpRequestEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TopUpRequestStatus status = TopUpRequestStatus.PENDING;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
