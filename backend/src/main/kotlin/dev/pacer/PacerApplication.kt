package dev.pacer

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@EnableScheduling
class PacerApplication

fun main(args: Array<String>) {
	runApplication<PacerApplication>(*args)
}
