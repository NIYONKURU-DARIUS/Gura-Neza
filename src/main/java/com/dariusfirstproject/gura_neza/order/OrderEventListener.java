package com.dariusfirstproject.gura_neza.order;

import com.dariusfirstproject.gura_neza.email.EmailService;
import com.dariusfirstproject.gura_neza.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class OrderEventListener {

    private final EmailService emailService;
    private final UserRepository userRepository;
    private final OrderService orderService;

    @KafkaListener(topics = "order-placed", groupId = "gura-neza-group")
    public void handleOrderPlaced(OrderPlacedEvent event) {
        log.info("Order placed event received for Order ID: {}", event.getOrderId());
        
        userRepository.findById(event.getUserId()).ifPresent(user -> {
            log.info("Notifying user {} about pending order", user.getEmail());
            // Optional: sendOrderReceivedEmail(user.getEmail(), user.getName(), event.getOrderId());
        });
    }

    @KafkaListener(topics = "order-confirmed", groupId = "gura-neza-group")
    public void handleOrderConfirmed(OrderConfirmedEvent event) {
        log.info("Order confirmed event received for Order ID: {}", event.getOrderId());
        
        try {
            OrderResponse orderResponse = orderService.getOrderByIdForListener(event.getOrderId());
            emailService.sendOrderConfirmationEmail(event.getUserEmail(), event.getUserName(), orderResponse);
            log.info("Confirmation email sent to {}", event.getUserEmail());
        } catch (Exception e) {
            log.error("Failed to send confirmation email for order {}: {}", event.getOrderId(), e.getMessage());
        }
    }
}