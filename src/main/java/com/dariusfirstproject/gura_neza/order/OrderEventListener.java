package com.dariusfirstproject.gura_neza.order;

import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class OrderEventListener {

    @KafkaListener(topics = "order-placed", groupId = "gura-neza-group")
    public void handleOrderPlaced(OrderPlacedEvent event) {
        log.info("Order placed event received!");
        log.info("Order ID: {}", event.getOrderId());
        log.info("User ID: {}", event.getUserId());
        log.info("Total Price: {}", event.getTotalPrice());
        log.info("Created At: {}", event.getCreatedAt());
    }
}