package com.smcsystem.smart_campus_system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication(scanBasePackages = {
		"com.smcsystem.smart_campus_system",
		"com.group202.smart_campus_backend"
})
@EnableMongoRepositories(basePackages = {
		"com.smcsystem.smart_campus_system.repository",
		"com.group202.smart_campus_backend.booking.repository"
})
public class SmartCampusSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmartCampusSystemApplication.class, args);
	}

}
