package com.dariusfirstproject.gura_neza.wallet;

import com.dariusfirstproject.gura_neza.email.EmailService;
import com.dariusfirstproject.gura_neza.user.User;
import com.dariusfirstproject.gura_neza.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("WalletService Unit Tests")
class WalletServiceTest {

    @Mock private WalletRepository walletRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private UserRepository userRepository;
    @Mock private EmailService emailService;
    @Mock private SimpMessagingTemplate messagingTemplate;
    @Mock private TopUpRequestRepository topUpRequestRepository;

    @InjectMocks
    private WalletService walletService;

    private User mockUser;
    private Wallet userWallet;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .name("Bob")
                .email("bob@example.com")
                .build();

        userWallet = Wallet.builder()
                .id(1L)
                .user(mockUser)
                .balance(new BigDecimal("200.00"))
                .build();

        // Mock security context
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("bob@example.com");
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(ctx);

        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(mockUser));
    }

    // ── getWallet ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getWallet: returns wallet response for current user")
    void getWallet_returnsWalletResponse() {
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(userWallet));
        when(transactionRepository.findByWalletId(1L)).thenReturn(List.of());

        WalletResponse response = walletService.getWallet();

        assertThat(response).isNotNull();
        assertThat(response.getBalance()).isEqualByComparingTo("200.00");
    }

    @Test
    @DisplayName("getWallet: throws when wallet not found")
    void getWallet_notFound_throwsException() {
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> walletService.getWallet())
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Wallet not found");
    }

    // ── topUp (admin direct) ─────────────────────────────────────────────────

    @Test
    @DisplayName("topUp: adds amount to wallet balance and records transaction")
    void topUp_validAmount_addsToBalance() {
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(userWallet));
        when(walletRepository.save(any(Wallet.class))).thenAnswer(inv -> inv.getArgument(0));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> inv.getArgument(0));
        when(transactionRepository.findByWalletId(1L)).thenReturn(List.of());
        doNothing().when(emailService).sendWalletTopUpEmail(anyString(), anyString(), any(), any());

        TopUpRequest request = new TopUpRequest(new BigDecimal("100.00"));
        WalletResponse response = walletService.topUp(1L, request);

        assertThat(response.getBalance()).isEqualByComparingTo("300.00");
        verify(transactionRepository).save(any(Transaction.class));
        verify(emailService).sendWalletTopUpEmail(anyString(), anyString(), any(), any());
    }

    @Test
    @DisplayName("topUp: throws when amount is zero or negative")
    void topUp_invalidAmount_throwsException() {
        TopUpRequest zeroRequest = new TopUpRequest(BigDecimal.ZERO);
        assertThatThrownBy(() -> walletService.topUp(1L, zeroRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("greater than zero");

        TopUpRequest negativeRequest = new TopUpRequest(new BigDecimal("-50.00"));
        assertThatThrownBy(() -> walletService.topUp(1L, negativeRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("greater than zero");
    }

    // ── requestTopUp ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("requestTopUp: creates a PENDING top-up request")
    void requestTopUp_validAmount_createsPendingRequest() {
        TopUpRequestEntity savedEntity = TopUpRequestEntity.builder()
                .id(1L)
                .user(mockUser)
                .amount(new BigDecimal("150.00"))
                .status(TopUpRequestStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        when(topUpRequestRepository.save(any(TopUpRequestEntity.class))).thenReturn(savedEntity);

        TopUpRequestDto dto = walletService.requestTopUp(new BigDecimal("150.00"));

        assertThat(dto.getStatus()).isEqualTo(TopUpRequestStatus.PENDING);
        assertThat(dto.getAmount()).isEqualByComparingTo("150.00");
    }

    @Test
    @DisplayName("requestTopUp: throws when amount is zero or negative")
    void requestTopUp_invalidAmount_throwsException() {
        assertThatThrownBy(() -> walletService.requestTopUp(BigDecimal.ZERO))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("greater than zero");
    }

    // ── approveTopUp ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("approveTopUp: credits wallet and sets status to APPROVED")
    void approveTopUp_pendingRequest_approvesAndCredits() {
        TopUpRequestEntity pendingReq = TopUpRequestEntity.builder()
                .id(1L)
                .user(mockUser)
                .amount(new BigDecimal("100.00"))
                .status(TopUpRequestStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        when(topUpRequestRepository.findById(1L)).thenReturn(Optional.of(pendingReq));
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(userWallet));
        when(walletRepository.save(any(Wallet.class))).thenAnswer(inv -> inv.getArgument(0));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> inv.getArgument(0));
        when(topUpRequestRepository.save(any(TopUpRequestEntity.class))).thenAnswer(inv -> inv.getArgument(0));
        doNothing().when(emailService).sendWalletTopUpEmail(anyString(), anyString(), any(), any());

        TopUpRequestDto dto = walletService.approveTopUp(1L);

        assertThat(dto.getStatus()).isEqualTo(TopUpRequestStatus.APPROVED);
        assertThat(userWallet.getBalance()).isEqualByComparingTo("300.00");
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    @DisplayName("approveTopUp: throws when request is not PENDING")
    void approveTopUp_notPending_throwsException() {
        TopUpRequestEntity approvedReq = TopUpRequestEntity.builder()
                .id(1L)
                .user(mockUser)
                .amount(new BigDecimal("100.00"))
                .status(TopUpRequestStatus.APPROVED)
                .build();

        when(topUpRequestRepository.findById(1L)).thenReturn(Optional.of(approvedReq));

        assertThatThrownBy(() -> walletService.approveTopUp(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Only PENDING requests can be approved");
    }

    // ── rejectTopUp ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("rejectTopUp: sets status to REJECTED")
    void rejectTopUp_pendingRequest_setsRejected() {
        TopUpRequestEntity pendingReq = TopUpRequestEntity.builder()
                .id(1L)
                .user(mockUser)
                .amount(new BigDecimal("50.00"))
                .status(TopUpRequestStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        when(topUpRequestRepository.findById(1L)).thenReturn(Optional.of(pendingReq));
        when(topUpRequestRepository.save(any(TopUpRequestEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        TopUpRequestDto dto = walletService.rejectTopUp(1L);

        assertThat(dto.getStatus()).isEqualTo(TopUpRequestStatus.REJECTED);
    }

    @Test
    @DisplayName("rejectTopUp: throws when request is not PENDING")
    void rejectTopUp_notPending_throwsException() {
        TopUpRequestEntity rejectedReq = TopUpRequestEntity.builder()
                .id(1L)
                .status(TopUpRequestStatus.REJECTED)
                .build();

        when(topUpRequestRepository.findById(1L)).thenReturn(Optional.of(rejectedReq));

        assertThatThrownBy(() -> walletService.rejectTopUp(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Only PENDING requests can be rejected");
    }

    // ── getTransactions ──────────────────────────────────────────────────────

    @Test
    @DisplayName("getTransactions: returns list of transactions for current user")
    void getTransactions_returnsTransactionList() {
        Transaction tx = Transaction.builder()
                .id(1L)
                .wallet(userWallet)
                .amount(new BigDecimal("50.00"))
                .type(TransactionType.CREDIT)
                .description("Top-up")
                .timestamp(LocalDateTime.now())
                .build();

        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(userWallet));
        when(transactionRepository.findByWalletId(1L)).thenReturn(List.of(tx));

        List<TransactionResponse> result = walletService.getTransactions();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getType()).isEqualTo(TransactionType.CREDIT);
        assertThat(result.get(0).getAmount()).isEqualByComparingTo("50.00");
    }
}
