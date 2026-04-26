package com.smcsystem.smart_campus_system.repository;

import com.smcsystem.smart_campus_system.enums.BookingStatus;
import com.smcsystem.smart_campus_system.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    
    List<Booking> findByUserId(String userId);
    
    List<Booking> findByResourceId(String resourceId);
    
    List<Booking> findByStatus(BookingStatus status);
    
    List<Booking> findByUserIdAndStatus(String userId, BookingStatus status);
    
    List<Booking> findByStartDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    List<Booking> findByResourceIdAndStartDateAfter(String resourceId, LocalDateTime startDate);
    
    List<Booking> findByApprovedByIsNotNullAndApprovedAtIsNull();
    
    List<Booking> findByStatusIn(List<BookingStatus> statuses);
    
    void deleteById(String id);
}
