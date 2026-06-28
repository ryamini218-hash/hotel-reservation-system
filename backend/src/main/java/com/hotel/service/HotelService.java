package com.hotel.service;

import com.hotel.model.*;
import com.hotel.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class HotelService {

    private final RoomRepository roomRepo;
    private final GuestRepository guestRepo;
    private final ReservationRepository reservationRepo;
    private final PaymentRepository paymentRepo;

    // ── Rooms ─────────────────────────────────────────────────────────────────

    public List<Room> getAllRooms() { return roomRepo.findAll(); }

    public List<Room> getAvailableRooms(LocalDate checkIn, LocalDate checkOut) {
        return roomRepo.findAvailableRooms(checkIn, checkOut);
    }

    public Room saveRoom(Room room) { return roomRepo.save(room); }

    // ── Guests ────────────────────────────────────────────────────────────────

    public List<Guest> getAllGuests() { return guestRepo.findAll(); }

    public Guest saveGuest(Guest guest) {
        return guestRepo.findByEmail(guest.getEmail()).orElseGet(() -> guestRepo.save(guest));
    }

    public Guest getOrCreateGuest(Guest guest) { return saveGuest(guest); }

    // ── Reservations ──────────────────────────────────────────────────────────

    public List<Reservation> getAllReservations() { return reservationRepo.findAll(); }

    public Reservation getReservation(Long id) {
        return reservationRepo.findById(id).orElseThrow(() -> new RuntimeException("Reservation not found: " + id));
    }

    public Reservation createReservation(Long guestId, Long roomId,
                                         LocalDate checkIn, LocalDate checkOut,
                                         String specialRequests) {
        Guest guest = guestRepo.findById(guestId)
                .orElseThrow(() -> new RuntimeException("Guest not found"));
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        List<Room> available = roomRepo.findAvailableRooms(checkIn, checkOut);
        if (available.stream().noneMatch(r -> r.getId().equals(roomId)))
            throw new RuntimeException("Room not available for selected dates");

        long nights = ChronoUnit.DAYS.between(checkIn, checkOut);
        BigDecimal total = room.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        Reservation res = new Reservation(null, guest, room, checkIn, checkOut,
                Reservation.Status.CONFIRMED, total, specialRequests, null);
        return reservationRepo.save(res);
    }

    public Reservation updateStatus(Long id, Reservation.Status status) {
        Reservation res = getReservation(id);
        res.setStatus(status);
        return reservationRepo.save(res);
    }

    public void cancelReservation(Long id) {
        Reservation res = getReservation(id);
        res.setStatus(Reservation.Status.CANCELLED);
        reservationRepo.save(res);
        // Auto-refund if paid
        paymentRepo.findByReservationId(id).ifPresent(p -> {
            if (p.getStatus() == Payment.PaymentStatus.COMPLETED) {
                p.setStatus(Payment.PaymentStatus.REFUNDED);
                paymentRepo.save(p);
            }
        });
    }

    // ── Payments ──────────────────────────────────────────────────────────────

    public Payment processPayment(Long reservationId, Payment.PaymentMethod method) {
        Reservation res = getReservation(reservationId);
        if (res.getStatus() == Reservation.Status.CANCELLED)
            throw new RuntimeException("Cannot pay for a cancelled reservation");

        Payment payment = new Payment(null, res, res.getTotalAmount(), method,
                Payment.PaymentStatus.COMPLETED, LocalDateTime.now(),
                "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        return paymentRepo.save(payment);
    }

    public Payment getPayment(Long reservationId) {
        return paymentRepo.findByReservationId(reservationId)
                .orElseThrow(() -> new RuntimeException("No payment found"));
    }

    public List<Reservation> getGuestReservations(Long guestId) {
        return reservationRepo.findByGuestId(guestId);
    }
}
