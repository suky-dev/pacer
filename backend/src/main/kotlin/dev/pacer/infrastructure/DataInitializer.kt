package dev.pacer.infrastructure

import dev.pacer.domain.searchprofile.ExperienceLevel
import dev.pacer.domain.searchprofile.RemoteOption
import dev.pacer.domain.searchprofile.SearchProfile
import dev.pacer.domain.searchprofile.SearchProfileRepository
import org.slf4j.LoggerFactory
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
class DataInitializer(private val searchProfileRepository: SearchProfileRepository) : ApplicationRunner {

    private val log = LoggerFactory.getLogger(javaClass)

    @Transactional
    override fun run(args: ApplicationArguments) {
        if (searchProfileRepository.count() > 0) return

        val profile = SearchProfile(
            name = "Berlin Backend",
            keywords = mutableListOf("java", "kotlin", "backend", "software engineer", "fullstack"),
            excludeKeywords = mutableListOf("devops", "infra", "frontend", "ios", "android", "c++", "c#"),
            locations = mutableListOf("Berlin"),
            remoteOptions = mutableListOf(RemoteOption.ONSITE, RemoteOption.HYBRID),
            experienceLevels = mutableListOf(ExperienceLevel.ASSOCIATE, ExperienceLevel.MID_SENIOR),
            timeframeDays = 1,
        )
        searchProfileRepository.save(profile)
        log.info("Seed data: created search profile '${profile.name}'")
    }
}
