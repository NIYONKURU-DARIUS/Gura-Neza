package com.dariusfirstproject.gura_neza.order;

public enum PaymentMethod {
    WALLET,      // deducted from wallet when admin confirms
    PAY_LATER    // user pays on delivery — no wallet deduction
}
