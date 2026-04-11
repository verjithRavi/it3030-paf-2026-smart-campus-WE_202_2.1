package com.smcsystem.smart_campus_system.service;

import com.smcsystem.smart_campus_system.dto.request.BookingCreateRequest;
import com.smcsystem.smart_campus_system.dto.response.BookingResponse;
import com.smcsystem.smart_campus_system.enums.BookingStatus;

import java.util.List;

public interface BookingService {
    
    BookingResponse createBooking(BookingCreateRequest request, String createdBy);
    
    BookingResponse updateBooking(String id, BookingCreateRequest request, String updatedBy);
    
    void deleteBooking(String id);
    
    BookingResponse getBookingById(String id);
    
    List<BookingResponse> getAllBookings();
    
    List<BookingResponse> getBookingsByUserId(String userId);
    
    List<BookingResponse> getBookingsByResourceId(String resourceId);
    
    List<BookingResponse> getBookingsByStatus(BookingStatus status);
    
    BookingResponse approveBooking(String id, String approvedBy);
    
    BookingResponse rejectBooking(String id, String rejectedBy);
    
    BookingResponse cancelBooking(String id, String cancelledBy);
    
    List<BookingResponse> getPendingBookings();
    
    List<BookingResponse> getUpcomingBookings(String userId);
}
