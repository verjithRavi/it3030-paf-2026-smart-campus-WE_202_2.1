package com.smcsystem.smart_campus_system.controller;

import com.smcsystem.smart_campus_system.dto.request.BookingCreateRequest;
import com.smcsystem.smart_campus_system.dto.response.BookingResponse;
import com.smcsystem.smart_campus_system.enums.BookingStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Slf4j
public class BookingController {

    private final com.smcsystem.smart_campus_system.service.BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN', 'TECHNICIAN')")
    public ResponseEntity<BookingResponse> createBooking(@RequestBody BookingCreateRequest request) {
        String currentUserId = getCurrentUserId(); // Get current user from security context
        log.info("Creating booking for resource: {} by current user: {}", request.getResourceId(), currentUserId);
        
        // Override request userId with current authenticated user
        request.setUserId(currentUserId);
        
        BookingResponse response = bookingService.createBooking(request, currentUserId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN', 'TECHNICIAN')")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        log.info("Fetching all bookings");
        List<BookingResponse> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN', 'TECHNICIAN')")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable String id) {
        log.info("Fetching booking: {}", id);
        BookingResponse booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN', 'TECHNICIAN')")
    public ResponseEntity<List<BookingResponse>> getBookingsByUserId(@PathVariable String userId) {
        log.info("Fetching bookings for user: {}", userId);
        List<BookingResponse> bookings = bookingService.getBookingsByUserId(userId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN', 'TECHNICIAN')")
    public ResponseEntity<List<BookingResponse>> getMyBookings() {
        log.info("Fetching bookings for current user");
        String userId = getCurrentUserId();
        List<BookingResponse> bookings = bookingService.getBookingsByUserId(userId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/resource/{resourceId}")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN', 'TECHNICIAN')")
    public ResponseEntity<List<BookingResponse>> getBookingsByResourceId(@PathVariable String resourceId) {
        log.info("Fetching bookings for resource: {}", resourceId);
        List<BookingResponse> bookings = bookingService.getBookingsByResourceId(resourceId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<List<BookingResponse>> getBookingsByStatus(@PathVariable BookingStatus status) {
        log.info("Fetching bookings with status: {}", status);
        List<BookingResponse> bookings = bookingService.getBookingsByStatus(status);
        return ResponseEntity.ok(bookings);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN', 'TECHNICIAN')")
    public ResponseEntity<BookingResponse> updateBooking(
            @PathVariable String id,
            @RequestBody BookingCreateRequest request) {
        log.info("Updating booking: {} by user: {}", id);
        String userId = getCurrentUserId();
        BookingResponse response = bookingService.updateBooking(id, request, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN', 'TECHNICIAN')")
    public ResponseEntity<Void> deleteBooking(@PathVariable String id) {
        log.info("Deleting booking: {}", id);
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<BookingResponse> approveBooking(@PathVariable String id) {
        log.info("Approving booking: {}", id);
        String userId = getCurrentUserId();
        BookingResponse response = bookingService.approveBooking(id, userId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<BookingResponse> rejectBooking(@PathVariable String id) {
        log.info("Rejecting booking: {}", id);
        String userId = getCurrentUserId();
        BookingResponse response = bookingService.rejectBooking(id, userId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN', 'TECHNICIAN')")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable String id) {
        log.info("Cancelling booking: {}", id);
        String userId = getCurrentUserId();
        BookingResponse response = bookingService.cancelBooking(id, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<List<BookingResponse>> getPendingBookings() {
        log.info("Fetching pending bookings");
        List<BookingResponse> bookings = bookingService.getPendingBookings();
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/upcoming/{userId}")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN', 'TECHNICIAN')")
    public ResponseEntity<List<BookingResponse>> getUpcomingBookings(@PathVariable String userId) {
        log.info("Fetching upcoming bookings for user: {}", userId);
        List<BookingResponse> bookings = bookingService.getUpcomingBookings(userId);
        return ResponseEntity.ok(bookings);
    }

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof com.smcsystem.smart_campus_system.model.User) {
                com.smcsystem.smart_campus_system.model.User user = (com.smcsystem.smart_campus_system.model.User) principal;
                return user.getId(); // Return the actual user ID
            }
        }
        return "anonymous";
    }
}
