package com.group202.smart_campus_backend.booking.service;

import com.group202.smart_campus_backend.booking.dto.CreateBookingRequest;
import com.group202.smart_campus_backend.booking.model.Booking;
import com.group202.smart_campus_backend.booking.model.BookingStatus;
import com.group202.smart_campus_backend.booking.repository.BookingRepository;
import com.group202.smart_campus_backend.common.exception.BadRequestException;
import com.group202.smart_campus_backend.common.exception.ConflictException;
import com.group202.smart_campus_backend.common.exception.ForbiddenException;
import com.group202.smart_campus_backend.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;

    public Booking createBooking(CreateBookingRequest request, String userId, String userName) {
        validateTimeConflict(
                request.getResourceId(),
                request.getBookingDate(),
                request.getStartTime(),
                request.getEndTime(),
                null
        );

        Booking booking = Booking.builder()
                .resourceId(request.getResourceId())
                .resourceName(request.getResourceName())
                .resourceType(request.getResourceType())
                .userId(userId)
                .userName(userName)
                .bookingDate(request.getBookingDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .expectedAttendees(request.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .adminReason(null)
                .deleted(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return bookingRepository.save(booking);
    }

    public List<Booking> getMyBookings(String userId) {
        return bookingRepository.findByUserIdAndDeletedFalseOrderByCreatedAtDesc(userId);
    }

    public List<Booking> getAllBookings(String role, String status, String resourceId, String userId, String date) {
        checkAdmin(role);

        List<Booking> bookings = bookingRepository.findByDeletedFalseOrderByCreatedAtDesc();

        return bookings.stream()
                .filter(b -> status == null || b.getStatus().name().equalsIgnoreCase(status))
                .filter(b -> resourceId == null || b.getResourceId().equals(resourceId))
                .filter(b -> userId == null || b.getUserId().equals(userId))
                .filter(b -> date == null || b.getBookingDate().toString().equals(date))
                .sorted(Comparator.comparing(Booking::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }

    public Booking approveBooking(String bookingId, String role) {
        checkAdmin(role);

        Booking booking = getBookingOrThrow(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be approved");
        }

        validateTimeConflict(
                booking.getResourceId(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getId()
        );

        booking.setStatus(BookingStatus.APPROVED);
        booking.setAdminReason(null);
        booking.setUpdatedAt(LocalDateTime.now());

        return bookingRepository.save(booking);
    }

    public Booking rejectBooking(String bookingId, String role, String reason) {
        checkAdmin(role);

        Booking booking = getBookingOrThrow(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be rejected");
        }

        if (reason == null || reason.trim().isEmpty()) {
            throw new BadRequestException("Reason is required when rejecting a booking");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminReason(reason.trim());
        booking.setUpdatedAt(LocalDateTime.now());

        return bookingRepository.save(booking);
    }

    public Booking cancelBooking(String bookingId, String currentUserId, String currentRole, String cancelReason) {
        Booking booking = getBookingOrThrow(bookingId);

        boolean isAdmin = "ADMIN".equalsIgnoreCase(currentRole);
        boolean isOwner = booking.getUserId().equals(currentUserId);

        if (!isAdmin && !isOwner) {
            throw new ForbiddenException("You are not allowed to cancel this booking");
        }

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new BadRequestException("Only APPROVED bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        if (cancelReason != null && !cancelReason.trim().isEmpty()) {
            booking.setCancelReason(cancelReason.trim());
        }
        booking.setUpdatedAt(LocalDateTime.now());

        return bookingRepository.save(booking);
    }

    public void deleteBooking(String bookingId, String currentUserId, String currentRole) {
        Booking booking = getBookingOrThrow(bookingId);

        boolean isAdmin = "ADMIN".equalsIgnoreCase(currentRole);
        boolean isOwner = booking.getUserId().equals(currentUserId);

        if (!isAdmin && !isOwner) {
            throw new ForbiddenException("You are not allowed to delete this booking");
        }

        if (booking.getStatus() == BookingStatus.APPROVED) {
            throw new BadRequestException("Approved bookings cannot be deleted. Cancel the booking instead.");
        }

        booking.setDeleted(true);
        booking.setUpdatedAt(LocalDateTime.now());

        bookingRepository.save(booking);
    }

    public Booking getBookingById(String bookingId, String userId, String role) {
        Booking booking = getBookingOrThrow(bookingId);
        boolean isAdmin = "ADMIN".equalsIgnoreCase(role);
        boolean isOwner = booking.getUserId().equals(userId);
        if (!isAdmin && !isOwner) {
            throw new ForbiddenException("You are not allowed to view this booking");
        }
        return booking;
    }

    private Booking getBookingOrThrow(String bookingId) {
        return bookingRepository.findByIdAndDeletedFalse(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));
    }

    private void checkAdmin(String role) {
        if (!"ADMIN".equalsIgnoreCase(role)) {
            throw new ForbiddenException("Only ADMIN users can perform this action");
        }
    }

    private void validateTimeConflict(
            String resourceId,
            LocalDate bookingDate,
            LocalTime startTime,
            LocalTime endTime,
            String excludeBookingId
    ) {
        List<BookingStatus> activeStatuses = List.of(
                BookingStatus.PENDING,
                BookingStatus.APPROVED
        );

        List<Booking> existingBookings = bookingRepository
                .findByResourceIdAndBookingDateAndStatusInAndDeletedFalse(
                        resourceId,
                        bookingDate,
                        activeStatuses
                );

        boolean hasConflict = existingBookings.stream()
                .filter(existing -> excludeBookingId == null || !existing.getId().equals(excludeBookingId))
                .anyMatch(existing ->
                        startTime.isBefore(existing.getEndTime()) &&
                        endTime.isAfter(existing.getStartTime())
                );

        if (hasConflict) {
            throw new ConflictException("Booking conflict: this resource is already booked for the selected time range");
        }
    }
}