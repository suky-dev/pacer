package dev.pacer

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class PacerApplication

fun main(args: Array<String>) {
	runApplication<PacerApplication>(*args)
}
