package com.hotel;

import com.hotel.model.*;
import com.hotel.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import java.math.BigDecimal;

@SpringBootApplication
public class HotelApplication {
    public static void main(String[] args) {
        SpringApplication.run(HotelApplication.class, args);
    }

    @Bean
    CommandLineRunner seedData(RoomRepository roomRepo, GuestRepository guestRepo) {
        return args -> {
            roomRepo.save(new Room(null, "101", Room.RoomType.SINGLE,   new BigDecimal("99.00"),  true, "Garden view, queen bed"));
            roomRepo.save(new Room(null, "102", Room.RoomType.DOUBLE,   new BigDecimal("149.00"), true, "Pool view, two beds"));
            roomRepo.save(new Room(null, "201", Room.RoomType.SUITE,    new BigDecimal("299.00"), true, "Ocean view, king bed, jacuzzi"));
            roomRepo.save(new Room(null, "202", Room.RoomType.DELUXE,   new BigDecimal("199.00"), true, "City view, king bed, balcony"));
            roomRepo.save(new Room(null, "301", Room.RoomType.PENTHOUSE, new BigDecimal("599.00"), true, "Panoramic view, 2 bedrooms"));
            guestRepo.save(new Guest(null, "Alice Johnson", "alice@email.com", "+1-555-0101", "P123456", null));
            guestRepo.save(new Guest(null, "Bob Smith",    "bob@email.com",   "+1-555-0202", "P789012", null));
        };
    }
}
