package com.smcsystem.smart_campus_system.repository;

import com.smcsystem.smart_campus_system.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findFirstByUsernameStartingWithOrderByUsernameDesc(String usernamePrefix);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
}
