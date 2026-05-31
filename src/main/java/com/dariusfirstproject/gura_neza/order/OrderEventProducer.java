package com.dariusfirstproject.gura_neza.order;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendOrderPlacedEvent(OrderPlacedEvent event) {
        try {
            kafkaTemplate.send("order-placed", event);
        } catch (Exception e) {
            log.warn("Kafka unavailable — order-placed event not sent for order {}: {}",
                    event.getOrderId(), e.getMessage());
        }
    }

    public void sendOrderConfirmedEvent(OrderConfirmedEvent event) {
        try {
            kafkaTemplate.send("order-confirmed", event);
        } catch (Exception e) {
            log.warn("Kafka unavailable — order-confirmed event not sent for order {}: {}",
                    event.getOrderId(), e.getMessage());
        }
    }
}