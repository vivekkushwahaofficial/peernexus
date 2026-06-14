package com.peernexus.peernexus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PeernexusApplication {

	public static void main(String[] args) {
		SpringApplication.run(PeernexusApplication.class, args);
	}

}
