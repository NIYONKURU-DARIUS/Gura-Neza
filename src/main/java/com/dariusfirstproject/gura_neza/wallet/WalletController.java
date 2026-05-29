package com.dariusfirstproject.gura_neza.wallet;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallet/")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class WalletController {
    private final WalletService walletService;
    @GetMapping
    public ResponseEntity<WalletResponse> getWallet() {
        return  ResponseEntity.ok(walletService.getWallet());
    }
    @PostMapping("/topup/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<WalletResponse> topUp(@PathVariable Long userId, @RequestBody TopUpRequest req){
        return ResponseEntity.ok(walletService.topUp(userId, req));
    }
    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionResponse>> getTransactions(){
        return ResponseEntity.ok(walletService.getTransactions());
    }
}
