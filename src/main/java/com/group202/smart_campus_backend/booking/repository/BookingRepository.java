package com.group202.smart_campus_backend.booking.repository;

import com.group202.smart_campus_backend.booking.model.Booking;
import com.group202.smart_campus_backend.booking.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByUserIdAndDeletedFalseOrderByCreatedAtDesc(String userId);

    List<Booking> findByDeletedFalseOrderByCreatedAtDesc();

    Optional<Booking> findByIdAndDeletedFalse(String id);

    List<Booking> findByResourceIdAndBookingDateAndStatusInAndDeletedFalse(
            String resourceId,
            LocalDate bookingDate,
            List<BookingStatus> statuses
    );
}