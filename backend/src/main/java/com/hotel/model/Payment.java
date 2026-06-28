package com.hotel.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "payments")
@Data @NoArgsConstructor @AllArgsConstructor
public class Payment {

    public enum PaymentMethod { CREDIT_CARD, DEBIT_CARD, CASH, BANK_TRANSFER }
    public enum PaymentStatus { PENDING, COMPLETED, FAILED, REFUNDED }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reservation_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Reservation reservation;

    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status = PaymentStatus.PENDING;

    private LocalDateTime paidAt;
    private String transactionId;
}
