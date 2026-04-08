package com.smcsystem.smart_campus_system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class SmartCampusSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmartCampusSystemApplication.class, args);
	}

}
