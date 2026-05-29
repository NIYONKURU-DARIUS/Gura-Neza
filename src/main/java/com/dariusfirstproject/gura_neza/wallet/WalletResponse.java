package com.dariusfirstproject.gura_neza.wallet;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WalletResponse {
   private Long id;
   private BigDecimal balance;
   private List<TransactionResponse> transactions;
}
