package com.dariusfirstproject.gura_neza.order;

import com.dariusfirstproject.gura_neza.cart.*;
import com.dariusfirstproject.gura_neza.email.EmailService;
import com.dariusfirstproject.gura_neza.product.Product;
import com.dariusfirstproject.gura_neza.product.ProductRepository;
import com.dariusfirstproject.gura_neza.user.User;
import com.dariusfirstproject.gura_neza.user.UserRepository;
import com.dariusfirstproject.gura_neza.wallet.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrderService Unit Tests")
class OrderServiceTest {

    @Mock private EmailService emailService;
    @Mock private OrderEventProducer orderEventProducer;
    @Mock private OrderRepository orderRepository;
    @Mock private OrderItemRepository orderItemRepository;
    @Mock private CartRepository cartRepository;
    @Mock private UserRepository userRepository;
    @Mock private ProductRepository productRepository;
    @Mock private WalletRepository walletRepository;
    @Mock private TransactionRepository transactionRepository;

    @InjectMocks
    private OrderService orderService;

    private User mockUser;
    private Product sampleProduct;
    private Cart cartWithItems;
    private Wallet userWallet;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .name("Alice")
                .email("alice@example.com")
                .build();

        sampleProduct = Product.builder()
                .id(10L)
                .name("Headphones")
                .price(new BigDecimal("50.00"))
                .stock(20)
                .build();

        CartItem cartItem = new CartItem();
        cartItem.setProduct(sampleProduct);
        cartItem.setQuantity(2);

        cartWithItems = new Cart();
        cartWithItems.setId(1L);
        cartWithItems.setUser(mockUser);
        cartWithItems.setItems(new ArrayList<>(List.of(cartItem)));

        userWallet = Wallet.builder()
                .id(1L)
                .user(mockUser)
                .balance(new BigDecimal("500.00"))
                .build();

        // Mock security context
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("alice@example.com");
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(ctx);

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(mockUser));
    }

    // ── checkout ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("checkout: places order successfully with sufficient wallet balance")
    void checkout_sufficientBalance_createsOrder() {
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cartWithItems));
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(userWallet));

        Order savedOrder = Order.builder()
                .id(100L)
                .user(mockUser)
                .totalPrice(new BigDecimal("100.00"))
                .orderStatus(OrderStatus.PENDING)
                .paymentMethod(PaymentMethod.WALLET)
                .createdAt(LocalDateTime.now())
                .items(new ArrayList<>())
                .build();

        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);
        when(orderRepository.findById(anyLong())).thenReturn(Optional.of(savedOrder));
        when(orderItemRepository.findByOrderId(anyLong())).thenReturn(new ArrayList<>());
        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);

        CheckoutRequest request = new CheckoutRequest();
        request.setPaymentMethod(PaymentMethod.WALLET);

        OrderResponse response = orderService.checkout(request);

        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo(OrderStatus.PENDING);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    @DisplayName("checkout: throws when cart is empty")
    void checkout_emptyCart_throwsException() {
        Cart emptyCart = new Cart();
        emptyCart.setItems(new ArrayList<>());
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(emptyCart));

        assertThatThrownBy(() -> orderService.checkout(null))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Cart is empty");
    }

    @Test
    @DisplayName("checkout: throws when wallet balance is insufficient")
    void checkout_insufficientBalance_throwsException() {
        userWallet.setBalance(new BigDecimal("10.00")); // total would be 100.00
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cartWithItems));
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(userWallet));

        CheckoutRequest request = new CheckoutRequest();
        request.setPaymentMethod(PaymentMethod.WALLET);

        assertThatThrownBy(() -> orderService.checkout(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Insufficient wallet balance");
    }

    @Test
    @DisplayName("checkout: throws when product stock is insufficient")
    void checkout_insufficientStock_throwsException() {
        sampleProduct.setStock(1); // cart wants 2
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cartWithItems));
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(userWallet));

        CheckoutRequest request = new CheckoutRequest();
        request.setPaymentMethod(PaymentMethod.WALLET);

        assertThatThrownBy(() -> orderService.checkout(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Insufficient stock");
    }

    // ── confirmOrder ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("confirmOrder: deducts wallet and sets status to CONFIRMED")
    void confirmOrder_pendingWalletOrder_confirmsAndDeducts() {
        Order pendingOrder = Order.builder()
                .id(1L)
                .user(mockUser)
                .totalPrice(new BigDecimal("100.00"))
                .orderStatus(OrderStatus.PENDING)
                .paymentMethod(PaymentMethod.WALLET)
                .items(new ArrayList<>())
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(pendingOrder));
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(userWallet));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderItemRepository.findByOrderId(anyLong())).thenReturn(new ArrayList<>());

        OrderResponse response = orderService.confirmOrder(1L);

        assertThat(response.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
        assertThat(userWallet.getBalance()).isEqualByComparingTo("400.00");
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    @DisplayName("confirmOrder: throws when order is not PENDING")
    void confirmOrder_notPending_throwsException() {
        Order confirmedOrder = Order.builder()
                .id(1L)
                .orderStatus(OrderStatus.CONFIRMED)
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(confirmedOrder));

        assertThatThrownBy(() -> orderService.confirmOrder(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Only PENDING orders can be confirmed");
    }

    // ── cancelOrder ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("cancelOrder: refunds wallet and restores stock for confirmed WALLET order")
    void cancelOrder_confirmedWalletOrder_refundsAndRestoresStock() {
        CartItem cartItem = new CartItem();
        cartItem.setProduct(sampleProduct);
        cartItem.setQuantity(2);

        OrderItem orderItem = new OrderItem();
        orderItem.setProduct(sampleProduct);
        orderItem.setQuantity(2);
        orderItem.setPrice(new BigDecimal("50.00"));

        Order confirmedOrder = Order.builder()
                .id(1L)
                .user(mockUser)
                .totalPrice(new BigDecimal("100.00"))
                .orderStatus(OrderStatus.CONFIRMED)
                .paymentMethod(PaymentMethod.WALLET)
                .items(new ArrayList<>(List.of(orderItem)))
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(confirmedOrder));
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(userWallet));
        when(orderItemRepository.findByOrderId(1L)).thenReturn(List.of(orderItem));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);

        OrderResponse response = orderService.cancelOrder(1L);

        assertThat(response.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        // Wallet refunded: 500 + 100 = 600
        assertThat(userWallet.getBalance()).isEqualByComparingTo("600.00");
        // Stock restored: 20 + 2 = 22
        assertThat(sampleProduct.getStock()).isEqualTo(22);
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    @DisplayName("cancelOrder: throws when order is already DELIVERED")
    void cancelOrder_delivered_throwsException() {
        Order deliveredOrder = Order.builder()
                .id(1L)
                .orderStatus(OrderStatus.DELIVERED)
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(deliveredOrder));

        assertThatThrownBy(() -> orderService.cancelOrder(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Cannot cancel a delivered order");
    }

    @Test
    @DisplayName("cancelOrder: throws when order is already CANCELLED")
    void cancelOrder_alreadyCancelled_throwsException() {
        Order cancelledOrder = Order.builder()
                .id(1L)
                .orderStatus(OrderStatus.CANCELLED)
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(cancelledOrder));

        assertThatThrownBy(() -> orderService.cancelOrder(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("already cancelled");
    }

    // ── deliverOrder ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("deliverOrder: sets status to DELIVERED and sends email")
    void deliverOrder_confirmedOrder_setsDelivered() {
        Order confirmedOrder = Order.builder()
                .id(1L)
                .user(mockUser)
                .totalPrice(new BigDecimal("100.00"))
                .orderStatus(OrderStatus.CONFIRMED)
                .paymentMethod(PaymentMethod.WALLET)
                .items(new ArrayList<>())
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(confirmedOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderItemRepository.findByOrderId(anyLong())).thenReturn(new ArrayList<>());
        doNothing().when(emailService).sendOrderDeliveryEmail(anyString(), anyString(), any());

        OrderResponse response = orderService.deliverOrder(1L);

        assertThat(response.getStatus()).isEqualTo(OrderStatus.DELIVERED);
        verify(emailService).sendOrderDeliveryEmail(eq("alice@example.com"), eq("Alice"), any());
    }

    @Test
    @DisplayName("deliverOrder: throws when order is not CONFIRMED")
    void deliverOrder_notConfirmed_throwsException() {
        Order pendingOrder = Order.builder()
                .id(1L)
                .orderStatus(OrderStatus.PENDING)
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(pendingOrder));

        assertThatThrownBy(() -> orderService.deliverOrder(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Only CONFIRMED orders can be marked as delivered");
    }
}
