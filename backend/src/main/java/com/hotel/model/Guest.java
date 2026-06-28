package com.hotel.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity @Table(name = "guests")
@Data @NoArgsConstructor @AllArgsConstructor
public class Guest {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String phone;
    private String passportNumber;

    @OneToMany(mappedBy = "guest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Reservation> reservations;
}
