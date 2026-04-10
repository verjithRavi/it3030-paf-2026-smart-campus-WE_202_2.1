package com.group202.smart_campus_backend.booking.controller;

import com.group202.smart_campus_backend.booking.dto.BookingDecisionRequest;
import com.group202.smart_campus_backend.booking.dto.CreateBookingRequest;
import com.group202.smart_campus_backend.booking.model.Booking;
import com.group202.smart_campus_backend.booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<Booking> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            @RequestHeader("X-USER-ID") String userId,
            @RequestHeader(value = "X-USER-NAME", defaultValue = "Unknown User") String userName
    ) {
        Booking booking = bookingService.createBooking(request, userId, userName);
        return new ResponseEntity<>(booking, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Booking>> getMyBookings(
            @RequestHeader("X-USER-ID") String userId
    ) {
        return ResponseEntity.ok(bookingService.getMyBookings(userId));
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings(
            @RequestHeader("X-USER-ROLE") String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String date
    ) {
        return ResponseEntity.ok(
                bookingService.getAllBookings(role, status, resourceId, userId, date)
        );
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<Booking> approveBooking(
            @PathVariable String id,
            @RequestHeader("X-USER-ROLE") String role
    ) {
        return ResponseEntity.ok(bookingService.approveBooking(id, role));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<Booking> rejectBooking(
            @PathVariable String id,
            @Valid @RequestBody BookingDecisionRequest request,
            @RequestHeader("X-USER-ROLE") String role
    ) {
        return ResponseEntity.ok(bookingService.rejectBooking(id, role, request.getReason()));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(
            @PathVariable String id,
            @RequestHeader("X-USER-ID") String userId,
            @RequestHeader("X-USER-ROLE") String role
    ) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, userId, role));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteBooking(
            @PathVariable String id,
            @RequestHeader("X-USER-ID") String userId,
            @RequestHeader("X-USER-ROLE") String role
    ) {
        bookingService.deleteBooking(id, userId, role);

        Map<String, String> response = new LinkedHashMap<>();
        response.put("message", "Booking deleted successfully");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(
            @PathVariable String id,
            @RequestHeader("X-USER-ID") String userId,
            @RequestHeader("X-USER-ROLE") String role
    ) {
        return ResponseEntity.ok(bookingService.getBookingById(id, userId, role));
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> testRoute() {
        Map<String, String> response = new LinkedHashMap<>();
        response.put("message", "Booking routes are working");
        return ResponseEntity.ok(response);
    }
}