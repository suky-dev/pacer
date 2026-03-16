package dev.pacer.domain.searchprofile

import dev.pacer.domain.searchprofile.dto.CreateSearchProfileRequest
import dev.pacer.domain.searchprofile.dto.SearchProfileResponse
import dev.pacer.domain.searchprofile.dto.UpdateSearchProfileRequest
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/search-profiles")
class SearchProfileController(private val service: SearchProfileService) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@Valid @RequestBody request: CreateSearchProfileRequest): SearchProfileResponse =
        service.create(request)

    @GetMapping
    fun findAll(): List<SearchProfileResponse> = service.findAll()

    @PutMapping("/{id}")
    fun update(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateSearchProfileRequest,
    ): SearchProfileResponse = service.update(id, request)

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: UUID) = service.delete(id)
}
