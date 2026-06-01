package com.dariusfirstproject.gura_neza.wallet;

import com.dariusfirstproject.gura_neza.email.EmailService;
import com.dariusfirstproject.gura_neza.user.User;
import com.dariusfirstproject.gura_neza.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
    private final TopUpRequestRepository topUpRequestRepository;

    // ── Get wallet ───────────────────────────────────────────────────────────
    public WalletResponse getWallet() {
        User user = getCurrentUser();
        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
        return mapToResponse(wallet);
    }

    // ── Admin direct top-up ──────────────────────────────────────────────────
    public WalletResponse topUp(Long userId, TopUpRequest request) {
        if (request.getAmount() == null || request.getAmount().doubleValue() <= 0) {
            throw new RuntimeException("Top up amount must be greater than zero");
        }
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found for this user"));

        wallet.setBalance(wallet.getBalance().add(request.getAmount()));
        walletRepository.save(wallet);

        transactionRepository.save(Transaction.builder()
                .wallet(wallet)
                .amount(request.getAmount())
                .type(TransactionType.CREDIT)
                .description("Wallet top-up")
                .timestamp(LocalDateTime.now())
                .build());

        try {
            messagingTemplate.convertAndSend("/topic/user/" + userId + "/wallet", wallet.getBalance());
        } catch (Exception e) {
            log.warn("WebSocket push failed for wallet top-up: {}", e.getMessage());
        }

        emailService.sendWalletTopUpEmail(
                wallet.getUser().getEmail(),
                wallet.getUser().getName(),
                request.getAmount(),
                wallet.getBalance()
        );

        return mapToResponse(wallet);
    }

    // ── Get transactions ─────────────────────────────────────────────────────
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

    // ── USER: submit a top-up request ────────────────────────────────────────
    public TopUpRequestDto requestTopUp(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Top-up amount must be greater than zero");
        }
        User user = getCurrentUser();
        TopUpRequestEntity entity = TopUpRequestEntity.builder()
                .user(user)
                .amount(amount)
                .status(TopUpRequestStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        return mapToDto(topUpRequestRepository.save(entity));
    }

    // ── USER: get own requests ───────────────────────────────────────────────
    public List<TopUpRequestDto> getMyTopUpRequests() {
        User user = getCurrentUser();
        return topUpRequestRepository.findByUserId(user.getId())
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    // ── ADMIN: get all requests ──────────────────────────────────────────────
    public List<TopUpRequestDto> getAllTopUpRequests() {
        return topUpRequestRepository.findAll()
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    // ── ADMIN: approve ───────────────────────────────────────────────────────
    public TopUpRequestDto approveTopUp(Long requestId) {
        TopUpRequestEntity req = topUpRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        if (req.getStatus() != TopUpRequestStatus.PENDING) {
            throw new RuntimeException("Only PENDING requests can be approved");
        }
        Wallet wallet = walletRepository.findByUserId(req.getUser().getId())
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
        wallet.setBalance(wallet.getBalance().add(req.getAmount()));
        walletRepository.save(wallet);

        transactionRepository.save(Transaction.builder()
                .wallet(wallet)
                .amount(req.getAmount())
                .type(TransactionType.CREDIT)
                .description("Top-up request #" + req.getId() + " approved")
                .timestamp(LocalDateTime.now())
                .build());

        req.setStatus(TopUpRequestStatus.APPROVED);
        topUpRequestRepository.save(req);

        try {
            messagingTemplate.convertAndSend("/topic/user/" + req.getUser().getId() + "/wallet", wallet.getBalance());
        } catch (Exception e) {
            log.warn("WebSocket push failed for approved top-up: {}", e.getMessage());
        }

        emailService.sendWalletTopUpEmail(
                req.getUser().getEmail(),
                req.getUser().getName(),
                req.getAmount(),
                wallet.getBalance()
        );

        return mapToDto(req);
    }

    // ── ADMIN: reject ────────────────────────────────────────────────────────
    public TopUpRequestDto rejectTopUp(Long requestId) {
        TopUpRequestEntity req = topUpRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        if (req.getStatus() != TopUpRequestStatus.PENDING) {
            throw new RuntimeException("Only PENDING requests can be rejected");
        }
        req.setStatus(TopUpRequestStatus.REJECTED);
        topUpRequestRepository.save(req);
        return mapToDto(req);
    }

    public long getPendingTopUpCount() {
        return topUpRequestRepository.countByStatus(TopUpRequestStatus.PENDING);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private TopUpRequestDto mapToDto(TopUpRequestEntity entity) {
        return TopUpRequestDto.builder()
                .id(entity.getId())
                .userId(entity.getUser().getId())
                .userName(entity.getUser().getName())
                .userEmail(entity.getUser().getEmail())
                .amount(entity.getAmount())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
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
