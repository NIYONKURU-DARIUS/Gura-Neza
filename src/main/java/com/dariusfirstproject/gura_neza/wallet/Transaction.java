package com.dariusfirstproject.gura_neza.wallet;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name="transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;
    @Column(nullable=false)
    private BigDecimal amount;
    @Enumerated(EnumType.STRING)
    private TransactionType type;
    @Column(nullable=false)
    private LocalDateTime timestamp;
    @ManyToOne
    @JoinColumn(name="wallet_id")
    private Wallet wallet;
}
