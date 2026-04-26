package com.smcsystem.smart_campus_system.service;

import com.smcsystem.smart_campus_system.dto.request.BookingCreateRequest;
import com.smcsystem.smart_campus_system.dto.response.BookingResponse;
import com.smcsystem.smart_campus_system.enums.BookingStatus;
import com.smcsystem.smart_campus_system.exception.ResourceNotFoundException;
import com.smcsystem.smart_campus_system.model.Booking;
import com.smcsystem.smart_campus_system.repository.BookingRepository;
import com.smcsystem.smart_campus_system.service.ResourceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceService resourceService;

    @Override
    public BookingResponse createBooking(BookingCreateRequest request, String createdBy) {
        log.info("Creating booking for resource: {} by user: {}", request.getResourceId(), request.getUserId());
        
        // Generate unique booking ID
        String bookingId = "BK" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        
        // Get resource details by resourceId
        var resource = resourceService.getResourceByResourceId(request.getResourceId());
        
        Booking booking = Booking.builder()
                .bookingId(bookingId)
                .resourceId(request.getResourceId())
                .resourceName(resource.getName())
                .userId(request.getUserId())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .purpose(request.getPurpose())
                .attendees(request.getAttendees())
                .notes(request.getNotes())
                .status(BookingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .createdBy(createdBy)
                .build();
        
        Booking savedBooking = bookingRepository.save(booking);
        log.info("Booking created successfully with ID: {}", savedBooking.getId());
        
        return convertToResponse(savedBooking);
    }

    @Override
    public BookingResponse updateBooking(String id, BookingCreateRequest request, String updatedBy) {
        log.info("Updating booking: {} by user: {}", id, updatedBy);
        
        Booking booking = getBookingByIdOrThrow(id);
        
        booking.setResourceId(request.getResourceId());
        booking.setStartDate(request.getStartDate());
        booking.setEndDate(request.getEndDate());
        booking.setPurpose(request.getPurpose());
        booking.setAttendees(request.getAttendees());
        booking.setNotes(request.getNotes());
        booking.setUpdatedAt(LocalDateTime.now());
        booking.setUpdatedBy(updatedBy);
        
        Booking updatedBooking = bookingRepository.save(booking);
        log.info("Booking updated successfully: {}", updatedBooking.getId());
        
        return convertToResponse(updatedBooking);
    }

    @Override
    public void deleteBooking(String id) {
        log.info("Deleting booking: {}", id);
        bookingRepository.deleteById(id);
    }

    @Override
    public BookingResponse getBookingById(String id) {
        Booking booking = bookingRepository.findById(id).orElse(null);
        if (booking == null) {
            throw new ResourceNotFoundException("Booking not found with ID: " + id);
        }
        return convertToResponse(booking);
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        return bookings.stream()
                .map(this::convertToResponse)
                .toList();
    }

    @Override
    public List<BookingResponse> getBookingsByUserId(String userId) {
        List<Booking> bookings = bookingRepository.findByUserId(userId);
        return bookings.stream()
                .map(this::convertToResponse)
                .toList();
    }

    @Override
    public List<BookingResponse> getBookingsByResourceId(String resourceId) {
        List<Booking> bookings = bookingRepository.findByResourceId(resourceId);
        return bookings.stream()
                .map(this::convertToResponse)
                .toList();
    }

    @Override
    public List<BookingResponse> getBookingsByStatus(BookingStatus status) {
        List<Booking> bookings = bookingRepository.findByStatus(status);
        return bookings.stream()
                .map(this::convertToResponse)
                .toList();
    }

    @Override
    public BookingResponse approveBooking(String id, String approvedBy) {
        log.info("Approving booking: {} by {}", id, approvedBy);
        
        Booking booking = getBookingByIdOrThrow(id);
        booking.setStatus(BookingStatus.APPROVED);
        booking.setApprovedBy(approvedBy);
        booking.setApprovedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        
        Booking updatedBooking = bookingRepository.save(booking);
        log.info("Booking approved successfully: {}", updatedBooking.getId());
        
        return convertToResponse(updatedBooking);
    }

    @Override
    public BookingResponse rejectBooking(String id, String rejectedBy) {
        log.info("Rejecting booking: {} by {}", id, rejectedBy);
        
        Booking booking = getBookingByIdOrThrow(id);
        booking.setStatus(BookingStatus.REJECTED);
        booking.setUpdatedAt(LocalDateTime.now());
        
        Booking updatedBooking = bookingRepository.save(booking);
        log.info("Booking rejected successfully: {}", updatedBooking.getId());
        
        return convertToResponse(updatedBooking);
    }

    @Override
    public BookingResponse cancelBooking(String id, String cancelledBy) {
        log.info("Cancelling booking: {} by {}", id, cancelledBy);
        
        Booking booking = getBookingByIdOrThrow(id);
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());
        
        Booking updatedBooking = bookingRepository.save(booking);
        log.info("Booking cancelled successfully: {}", updatedBooking.getId());
        
        return convertToResponse(updatedBooking);
    }

    @Override
    public List<BookingResponse> getPendingBookings() {
        return getBookingsByStatus(BookingStatus.PENDING);
    }

    @Override
    public List<BookingResponse> getUpcomingBookings(String userId) {
        LocalDateTime now = LocalDateTime.now();
        List<Booking> userBookings = bookingRepository.findByUserId(userId);
        
        return userBookings.stream()
                .filter(booking -> booking.getStartDate().isAfter(now) && 
                               booking.getStatus() == BookingStatus.APPROVED)
                .map(this::convertToResponse)
                .toList();
    }

    private Booking getBookingByIdOrThrow(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));
    }

    private BookingResponse convertToResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .bookingId(booking.getBookingId())
                .resourceId(booking.getResourceId())
                .resourceName(booking.getResourceName())
                .userId(booking.getUserId())
                .userName(booking.getUserName())
                .userEmail(booking.getUserEmail())
                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .purpose(booking.getPurpose())
                .attendees(booking.getAttendees())
                .status(booking.getStatus())
                .notes(booking.getNotes())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .createdBy(booking.getCreatedBy())
                .updatedBy(booking.getUpdatedBy())
                .approvedBy(booking.getApprovedBy())
                .approvedAt(booking.getApprovedAt())
                .build();
    }
}
