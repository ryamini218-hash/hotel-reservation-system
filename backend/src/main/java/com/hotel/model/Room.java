package com.hotel.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity @Table(name = "rooms")
@Data @NoArgsConstructor @AllArgsConstructor
public class Room {

    public enum RoomType { SINGLE, DOUBLE, SUITE, DELUXE, PENTHOUSE }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String roomNumber;

    @Enumerated(EnumType.STRING)
    private RoomType type;

    @Column(nullable = false)
    private BigDecimal pricePerNight;

    private boolean available = true;
    private String description;
}
