package com.dariusfirstproject.gura_neza.order;

import com.dariusfirstproject.gura_neza.cart.Cart;
import com.dariusfirstproject.gura_neza.cart.CartItem;
import com.dariusfirstproject.gura_neza.cart.CartRepository;
import com.dariusfirstproject.gura_neza.email.EmailService;
import com.dariusfirstproject.gura_neza.product.Product;
import com.dariusfirstproject.gura_neza.product.ProductRepository;
import com.dariusfirstproject.gura_neza.user.User;
import com.dariusfirstproject.gura_neza.user.UserRepository;
import com.dariusfirstproject.gura_neza.wallet.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
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
public class OrderService {

    private final EmailService emailService;
    private final OrderEventProducer orderEventProducer;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    // ── USER: place order ────────────────────────────────────────────────
    public OrderResponse checkout(CheckoutRequest request) {
        User user = getCurrentUser();
        PaymentMethod paymentMethod = (request != null && request.getPaymentMethod() != null)
                ? request.getPaymentMethod() : PaymentMethod.WALLET;

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        BigDecimal total = cart.getItems().stream()
                .map(item -> item.getProduct().getPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // For WALLET payment, verify balance upfront
        if (paymentMethod == PaymentMethod.WALLET) {
            Wallet wallet = walletRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Wallet not found"));
            if (wallet.getBalance().compareTo(total) < 0) {
                throw new RuntimeException(
                        "Insufficient wallet balance. Please top up or choose Pay Later.");
            }
        }

        // Check stock
        for (CartItem cartItem : cart.getItems()) {
            if (cartItem.getProduct().getStock() < cartItem.getQuantity()) {
                throw new RuntimeException(
                        "Insufficient stock for: " + cartItem.getProduct().getName());
            }
        }

        // Save order
        Order order = Order.builder()
                .user(user)
                .totalPrice(total)
                .orderStatus(OrderStatus.PENDING)
                .paymentMethod(paymentMethod)
                .createdAt(LocalDateTime.now())
                .build();
        orderRepository.save(order);

        // Save items and reduce stock
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .price(product.getPrice())
                    .build();
            orderItemRepository.save(orderItem);
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);
        }

        cart.getItems().clear();
        cartRepository.save(cart);

        Order savedOrder = orderRepository.findById(order.getId())
                .orElseThrow(() -> new RuntimeException("Order not found"));
        savedOrder.setItems(orderItemRepository.findByOrderId(order.getId()));

        // Fire-and-forget — Kafka may not be running in dev
        try {
            orderEventProducer.sendOrderPlacedEvent(OrderPlacedEvent.builder()
                    .orderId(savedOrder.getId())
                    .userId(user.getId())
                    .totalPrice(total)
                    .createdAt(LocalDateTime.now())
                    .build());
        } catch (Exception e) {
            // Non-critical — order is already saved
        }

        return mapToResponse(savedOrder);
    }

    // ── ADMIN: confirm order ─────────────────────────────────────────────
    @PreAuthorize("hasAuthority('ADMIN')")
    public OrderResponse confirmOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Only PENDING orders can be confirmed");
        }

        User user = order.getUser();

        // Deduct wallet only for WALLET payment
        if (order.getPaymentMethod() == PaymentMethod.WALLET) {
            Wallet wallet = walletRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Wallet not found"));
            if (wallet.getBalance().compareTo(order.getTotalPrice()) < 0) {
                throw new RuntimeException("User has insufficient wallet balance");
            }
            wallet.setBalance(wallet.getBalance().subtract(order.getTotalPrice()));
            walletRepository.save(wallet);

            transactionRepository.save(Transaction.builder()
                    .wallet(wallet)
                    .amount(order.getTotalPrice())
                    .type(TransactionType.DEBIT)
                    .description("Order #" + order.getId() + " payment")
                    .timestamp(LocalDateTime.now())
                    .build());
        }
        // PAY_LATER: no wallet deduction — collected on delivery

        order.setOrderStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);
        order.setItems(orderItemRepository.findByOrderId(order.getId()));

        // Fire-and-forget
        try {
            orderEventProducer.sendOrderConfirmedEvent(OrderConfirmedEvent.builder()
                    .orderId(order.getId())
                    .userId(user.getId())
                    .userEmail(user.getEmail())
                    .userName(user.getName())
                    .totalAmount(order.getTotalPrice())
                    .build());
        } catch (Exception e) {
            // Non-critical
        }

        return mapToResponse(order);
    }

    // ── ADMIN: mark as delivered ─────────────────────────────────────────
    @PreAuthorize("hasAuthority('ADMIN')")
    public OrderResponse deliverOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getOrderStatus() != OrderStatus.CONFIRMED) {
            throw new RuntimeException("Only CONFIRMED orders can be marked as delivered");
        }

        order.setOrderStatus(OrderStatus.DELIVERED);
        orderRepository.save(order);
        order.setItems(orderItemRepository.findByOrderId(order.getId()));

        OrderResponse response = mapToResponse(order);

        // Send delivery confirmation email with PDF receipt (best-effort)
        emailService.sendOrderDeliveryEmail(
                order.getUser().getEmail(),
                order.getUser().getName(),
                response
        );

        return response;
    }

    // ── ADMIN: cancel order ──────────────────────────────────────────────
    @PreAuthorize("hasAuthority('ADMIN')")
    public OrderResponse cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getOrderStatus() == OrderStatus.DELIVERED) {
            throw new RuntimeException("Cannot cancel a delivered order");
        }
        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Order is already cancelled");
        }

        User user = order.getUser();

        // Refund wallet if WALLET payment was already confirmed (money deducted)
        if (order.getPaymentMethod() == PaymentMethod.WALLET
                && order.getOrderStatus() == OrderStatus.CONFIRMED) {
            Wallet wallet = walletRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Wallet not found"));
            wallet.setBalance(wallet.getBalance().add(order.getTotalPrice()));
            walletRepository.save(wallet);

            transactionRepository.save(Transaction.builder()
                    .wallet(wallet)
                    .amount(order.getTotalPrice())
                    .type(TransactionType.CREDIT)
                    .description("Refund for cancelled Order #" + order.getId())
                    .timestamp(LocalDateTime.now())
                    .build());
        }

        // Restore stock
        order.setItems(orderItemRepository.findByOrderId(order.getId()));
        order.getItems().forEach(item -> {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        });

        order.setOrderStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        return mapToResponse(order);
    }

    // ── ADMIN: get all orders ────────────────────────────────────────────
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(order -> {
                    order.setItems(orderItemRepository.findByOrderId(order.getId()));
                    return mapToResponse(order);
                })
                .collect(Collectors.toList());
    }

    // ── USER: get own orders ─────────────────────────────────────────────
    public List<OrderResponse> getUserOrders() {
        User user = getCurrentUser();
        return orderRepository.findByUserId(user.getId()).stream()
                .map(order -> {
                    order.setItems(orderItemRepository.findByOrderId(order.getId()));
                    return mapToResponse(order);
                })
                .collect(Collectors.toList());
    }

    public OrderResponse getUserOrderById(Long id) {
        User user = getCurrentUser();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }
        order.setItems(orderItemRepository.findByOrderId(order.getId()));
        return mapToResponse(order);
    }

    public OrderResponse getOrderByIdForListener(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setItems(orderItemRepository.findByOrderId(order.getId()));
        return mapToResponse(order);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .subtotal(item.getPrice()
                                .multiply(BigDecimal.valueOf(item.getQuantity())))
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .status(order.getOrderStatus())
                .totalPrice(order.getTotalPrice())
                .createdAt(order.getCreatedAt())
                .items(items)
                .paymentMethod(order.getPaymentMethod())
                .userName(order.getUser() != null ? order.getUser().getName() : null)
                .userEmail(order.getUser() != null ? order.getUser().getEmail() : null)
                .build();
    }
}
