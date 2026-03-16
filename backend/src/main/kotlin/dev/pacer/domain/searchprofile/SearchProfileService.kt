package dev.pacer.domain.searchprofile

import dev.pacer.domain.searchprofile.dto.CreateSearchProfileRequest
import dev.pacer.domain.searchprofile.dto.SearchProfileResponse
import dev.pacer.domain.searchprofile.dto.UpdateSearchProfileRequest
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
@Transactional
class SearchProfileService(private val repository: SearchProfileRepository) {

    fun create(request: CreateSearchProfileRequest): SearchProfileResponse {
        val profile = SearchProfile(
            name = request.name,
            keywords = request.keywords.toMutableList(),
            excludeKeywords = request.excludeKeywords.toMutableList(),
            locations = request.locations.toMutableList(),
            remoteOptions = request.remoteOptions.toMutableList(),
            experienceLevels = request.experienceLevels.toMutableList(),
            timeframeDays = request.timeframeDays,
            isActive = request.isActive,
        )
        return SearchProfileResponse.from(repository.save(profile))
    }

    @Transactional(readOnly = true)
    fun findAll(): List<SearchProfileResponse> =
        repository.findAll().map { SearchProfileResponse.from(it) }

    fun update(id: UUID, request: UpdateSearchProfileRequest): SearchProfileResponse {
        val profile = repository.findByIdOrNull(id)
            ?: throw NoSuchElementException("SearchProfile $id not found")

        request.name?.let { profile.name = it }
        request.keywords?.let { profile.keywords = it.toMutableList() }
        request.excludeKeywords?.let { profile.excludeKeywords = it.toMutableList() }
        request.locations?.let { profile.locations = it.toMutableList() }
        request.remoteOptions?.let { profile.remoteOptions = it.toMutableList() }
        request.experienceLevels?.let { profile.experienceLevels = it.toMutableList() }
        request.timeframeDays?.let { profile.timeframeDays = it }
        request.isActive?.let { profile.isActive = it }
        profile.updatedAt = Instant.now()

        return SearchProfileResponse.from(repository.save(profile))
    }

    fun delete(id: UUID) {
        if (!repository.existsById(id)) throw NoSuchElementException("SearchProfile $id not found")
        repository.deleteById(id)
    }
}
