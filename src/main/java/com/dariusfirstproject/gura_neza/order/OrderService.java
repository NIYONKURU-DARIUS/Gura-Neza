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

    public OrderResponse checkout() {
        User user = getCurrentUser();

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        BigDecimal total = cart.getItems().stream()
                .map(item -> item.getProduct().getPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // ✅ REMOVED: wallet balance check and deduction
        // Money is only deducted when admin confirms the order

        // Loop 1 — check stock only, save nothing
        for (CartItem cartItem : cart.getItems()) {
            if (cartItem.getProduct().getStock() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for: " + cartItem.getProduct().getName());
            }
        }

        // Save order as PENDING
        Order order = Order.builder()
                .user(user)
                .totalPrice(total)
                .orderStatus(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        orderRepository.save(order);

        // Loop 2 — save order items and reduce stock
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

        // ✅ REMOVED: wallet.setBalance(...) — no deduction here anymore

        cart.getItems().clear();
        cartRepository.save(cart);

        Order savedOrder = orderRepository.findById(order.getId())
                .orElseThrow(() -> new RuntimeException("Order not found"));
        savedOrder.setItems(orderItemRepository.findByOrderId(order.getId()));

        orderEventProducer.sendOrderPlacedEvent(OrderPlacedEvent.builder()
                .orderId(savedOrder.getId())
                .userId(user.getId())
                .totalPrice(total)
                .createdAt(LocalDateTime.now())
                .build());

        // ✅ REMOVED: order confirmation email — moved to confirmOrder()

        return mapToResponse(savedOrder);
    }

    // ✅ NEW — ADMIN confirms the order: deducts wallet, sends confirmation email
    @PreAuthorize("hasAuthority('ADMIN')")
    public OrderResponse confirmOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Only PENDING orders can be confirmed");
        }

        User user = order.getUser();

        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        if (wallet.getBalance().compareTo(order.getTotalPrice()) < 0) {
            throw new RuntimeException("User has insufficient wallet balance");
        }

        // Deduct wallet
        wallet.setBalance(wallet.getBalance().subtract(order.getTotalPrice()));
        walletRepository.save(wallet);

        // Save DEBIT transaction
        Transaction transaction = Transaction.builder()
                .wallet(wallet)
                .amount(order.getTotalPrice())
                .type(TransactionType.DEBIT)
                .timestamp(LocalDateTime.now())
                .build();
        transactionRepository.save(transaction);

        // Update order status
        order.setOrderStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        order.setItems(orderItemRepository.findByOrderId(order.getId()));

        // Send confirmation email to user
        emailService.sendOrderConfirmationEmail(user.getEmail(), user.getName(), mapToResponse(order));

        return mapToResponse(order);
    }

    // ✅ NEW — ADMIN marks order as delivered
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
        return mapToResponse(order);
    }

    public List<OrderResponse> getUserOrders() {
        User user = getCurrentUser();
        return orderRepository.findByUserId(user.getId())
                .stream()
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

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private OrderResponse mapToResponse(Order order) {
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
                .build();
    }
}