package com.hotel.repository;

import com.hotel.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByGuestId(Long guestId);
    List<Reservation> findByStatus(Reservation.Status status);

    @Query("SELECT r FROM Reservation r WHERE r.checkIn = :date")
    List<Reservation> findByCheckInDate(@Param("date") LocalDate date);
}