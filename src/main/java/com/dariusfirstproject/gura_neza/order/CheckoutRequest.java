package com.dariusfirstproject.gura_neza.order;

import lombok.Data;

@Data
public class CheckoutRequest {
    private PaymentMethod paymentMethod = PaymentMethod.WALLET;
}
