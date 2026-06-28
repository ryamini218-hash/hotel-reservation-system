package com.hotel.repository;

import com.hotel.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByAvailable(boolean available);
    List<Room> findByType(Room.RoomType type);

    @Query("""
        SELECT r FROM Room r WHERE r.available = true
        AND r.id NOT IN (
            SELECT res.room.id FROM Reservation res
            WHERE res.status NOT IN ('CANCELLED','CHECKED_OUT')
            AND res.checkIn < :checkOut AND res.checkOut > :checkIn
        )
    """)
    List<Room> findAvailableRooms(LocalDate checkIn, LocalDate checkOut);
}
