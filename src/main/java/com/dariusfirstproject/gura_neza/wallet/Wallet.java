package com.dariusfirstproject.gura_neza.wallet;

import com.dariusfirstproject.gura_neza.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name="wallets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wallet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable=false)
    private BigDecimal balance;
    @OneToOne
    @JoinColumn(name="user_id")
    private User user;
}
