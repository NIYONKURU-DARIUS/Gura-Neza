package com.dariusfirstproject.gura_neza;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GuraNezaApplication {

    public static void main(String[] args) {
        SpringApplication.run(GuraNezaApplication.class, args);
    }

}
