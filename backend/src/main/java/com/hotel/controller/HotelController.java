package com.hotel.controller;

import com.hotel.model.*;
import com.hotel.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
@RequiredArgsConstructor
public class HotelController {

    private final HotelService service;

    // ── Rooms ─────────────────────────────────────────────────────────────────

    @GetMapping("/rooms")
    public List<Room> getRooms() { return service.getAllRooms(); }

    @GetMapping("/rooms/available")
    public List<Room> getAvailable(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {
        return service.getAvailableRooms(checkIn, checkOut);
    }

    @PostMapping("/rooms")
    public Room addRoom(@RequestBody Room room) { return service.saveRoom(room); }

    // ── Guests ────────────────────────────────────────────────────────────────

    @GetMapping("/guests")
    public List<Guest> getGuests() { return service.getAllGuests(); }

    @PostMapping("/guests")
    public Guest createGuest(@RequestBody Guest guest) { return service.saveGuest(guest); }

    @GetMapping("/guests/{id}/reservations")
    public List<Reservation> guestReservations(@PathVariable Long id) {
        return service.getGuestReservations(id);
    }

    // ── Reservations ──────────────────────────────────────────────────────────

    @GetMapping("/reservations")
    public List<Reservation> getReservations() { return service.getAllReservations(); }

    @GetMapping("/reservations/{id}")
    public Reservation getReservation(@PathVariable Long id) { return service.getReservation(id); }

    @PostMapping("/reservations")
    public ResponseEntity<?> book(@RequestBody Map<String, Object> body) {
        try {
            Long guestId = Long.valueOf(body.get("guestId").toString());
            Long roomId  = Long.valueOf(body.get("roomId").toString());
            LocalDate checkIn  = LocalDate.parse(body.get("checkIn").toString());
            LocalDate checkOut = LocalDate.parse(body.get("checkOut").toString());
            String notes = body.getOrDefault("specialRequests", "").toString();
            return ResponseEntity.ok(service.createReservation(guestId, roomId, checkIn, checkOut, notes));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/reservations/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            Reservation.Status status = Reservation.Status.valueOf(body.get("status"));
            return ResponseEntity.ok(service.updateStatus(id, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/reservations/{id}")
    public ResponseEntity<?> cancel(@PathVariable Long id) {
        try { service.cancelReservation(id); return ResponseEntity.ok(Map.of("message", "Cancelled")); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    // ── Payments ──────────────────────────────────────────────────────────────

    @PostMapping("/reservations/{id}/pay")
    public ResponseEntity<?> pay(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            Payment.PaymentMethod method = Payment.PaymentMethod.valueOf(body.get("method"));
            return ResponseEntity.ok(service.processPayment(id, method));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/reservations/{id}/payment")
    public ResponseEntity<?> getPayment(@PathVariable Long id) {
        try { return ResponseEntity.ok(service.getPayment(id)); }
        catch (Exception e) { return ResponseEntity.notFound().build(); }
    }
}
