package com.dariusfirstproject.gura_neza.wallet;

import com.dariusfirstproject.gura_neza.email.EmailService;
import com.dariusfirstproject.gura_neza.user.User;
import com.dariusfirstproject.gura_neza.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class WalletService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    public WalletResponse getWallet() {
        User user = getCurrentUser();
        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
        return mapToResponse(wallet);
    }

    public WalletResponse topUp(Long userId, TopUpRequest request) {
        if (request.getAmount() == null || request.getAmount().doubleValue() <= 0) {
            throw new RuntimeException("Top up amount must be greater than zero");
        }

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found for this user"));

        wallet.setBalance(wallet.getBalance().add(request.getAmount()));
        walletRepository.save(wallet);

        Transaction transaction = Transaction.builder()
                .wallet(wallet)
                .amount(request.getAmount())
                .type(TransactionType.CREDIT)
                .description("Wallet top-up")
                .timestamp(LocalDateTime.now())
                .build();
        transactionRepository.save(transaction);

        // Best-effort WebSocket push — wallet is already saved regardless
        try {
            messagingTemplate.convertAndSend("/topic/user/" + userId + "/wallet", wallet.getBalance());
        } catch (Exception e) {
            log.warn("WebSocket push failed for wallet top-up (saved to DB): {}", e.getMessage());
        }

        // FIX: removed unused `Optional<User> user = userRepository.findById(userId)` that was here

        emailService.sendWalletTopUpEmail(
                wallet.getUser().getEmail(),
                wallet.getUser().getName(),
                request.getAmount(),
                wallet.getBalance()
        );

        return mapToResponse(wallet);
    }

    public List<TransactionResponse> getTransactions() {
        User user = getCurrentUser();
        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        return transactionRepository.findByWalletId(wallet.getId())
                .stream()
                .map(t -> TransactionResponse.builder()
                        .id(t.getId())
                        .amount(t.getAmount())
                        .type(t.getType())
                        .description(t.getDescription())
                        .timestamp(t.getTimestamp())
                        .build())
                .collect(Collectors.toList());
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private WalletResponse mapToResponse(Wallet wallet) {
        List<TransactionResponse> transactions = transactionRepository
                .findByWalletId(wallet.getId())
                .stream()
                .map(t -> TransactionResponse.builder()
                        .id(t.getId())
                        .amount(t.getAmount())
                        .type(t.getType())
                        .description(t.getDescription())
                        .timestamp(t.getTimestamp())
                        .build())
                .collect(Collectors.toList());

        return WalletResponse.builder()
                .id(wallet.getId())
                .balance(wallet.getBalance())
                .transactions(transactions)
                .build();
    }
}