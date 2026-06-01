package com.dariusfirstproject.gura_neza.wallet;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet/")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class WalletController {

    private final WalletService walletService;

    @GetMapping
    public ResponseEntity<WalletResponse> getWallet() {
        return ResponseEntity.ok(walletService.getWallet());
    }

    @PostMapping("/topup/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<WalletResponse> topUp(@PathVariable Long userId, @RequestBody TopUpRequest req) {
        return ResponseEntity.ok(walletService.topUp(userId, req));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionResponse>> getTransactions() {
        return ResponseEntity.ok(walletService.getTransactions());
    }

    // ── Top-up Request endpoints ─────────────────────────────────────────

    @PostMapping("/request-topup")
    public ResponseEntity<TopUpRequestDto> requestTopUp(@RequestBody Map<String, BigDecimal> body) {
        return ResponseEntity.ok(walletService.requestTopUp(body.get("amount")));
    }

    @GetMapping("/my-requests")
    public ResponseEntity<List<TopUpRequestDto>> getMyRequests() {
        return ResponseEntity.ok(walletService.getMyTopUpRequests());
    }

    @GetMapping("/admin/requests")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<TopUpRequestDto>> getAllRequests() {
        return ResponseEntity.ok(walletService.getAllTopUpRequests());
    }

    @PutMapping("/admin/requests/{id}/approve")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<TopUpRequestDto> approveRequest(@PathVariable Long id) {
        return ResponseEntity.ok(walletService.approveTopUp(id));
    }

    @PutMapping("/admin/requests/{id}/reject")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<TopUpRequestDto> rejectRequest(@PathVariable Long id) {
        return ResponseEntity.ok(walletService.rejectTopUp(id));
    }
}
