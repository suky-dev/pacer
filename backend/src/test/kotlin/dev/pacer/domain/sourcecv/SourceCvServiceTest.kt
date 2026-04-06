package dev.pacer.domain.sourcecv

import tools.jackson.databind.json.JsonMapper
import dev.pacer.domain.sourcecv.dto.CreateVersionRequest
import dev.pacer.domain.sourcecv.dto.UpdateSourceCvRequest
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentMatchers.any
import org.mockito.BDDMockito.given
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import java.util.Optional
import java.util.UUID
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class SourceCvServiceTest {

    @Mock
    lateinit var sourceCvRepository: SourceCvRepository

    private val objectMapper = JsonMapper()
    private lateinit var service: SourceCvService

    @BeforeEach
    fun setUp() {
        service = SourceCvService(sourceCvRepository, objectMapper)
    }

    // updateCurrent: creates a new row when no CV exists
    @Test
    fun `updateCurrent creates new row when no existing CV`() {
        val userId = UUID.randomUUID()
        val data = objectMapper.readTree("""{"sections":[]}""")
        val saved = SourceCv(userId = userId, version = 1)

        given(sourceCvRepository.findTopByUserIdOrderByVersionDesc(userId)).willReturn(null)
        given(sourceCvRepository.save(any(SourceCv::class.java))).willReturn(saved)

        val result = service.updateCurrent(userId, UpdateSourceCvRequest(data))

        assertEquals(1, result.version)
    }

    // updateCurrent: updates the existing row (does NOT increment version)
    @Test
    fun `updateCurrent updates existing row without incrementing version`() {
        val userId = UUID.randomUUID()
        val data = objectMapper.readTree("""{"sections":[]}""")
        val existing = SourceCv(userId = userId, version = 3, data = """{"sections":[]}""")

        given(sourceCvRepository.findTopByUserIdOrderByVersionDesc(userId)).willReturn(existing)
        given(sourceCvRepository.save(any(SourceCv::class.java))).willReturn(existing)

        val result = service.updateCurrent(userId, UpdateSourceCvRequest(data))

        assertEquals(3, result.version)
    }

    // createVersion: throws when no CV exists for the user
    @Test
    fun `createVersion throws NoSuchElementException when no CV exists`() {
        val userId = UUID.randomUUID()

        given(sourceCvRepository.findTopByUserIdOrderByVersionDesc(userId)).willReturn(null)

        assertThrows<NoSuchElementException> {
            service.createVersion(userId, CreateVersionRequest(label = null))
        }
    }

    // restore: throws when the target version belongs to a different user
    @Test
    fun `restore throws IllegalArgumentException when version belongs to different user`() {
        val userId = UUID.randomUUID()
        val otherUserId = UUID.randomUUID()
        val versionId = UUID.randomUUID()
        val target = SourceCv(userId = otherUserId, version = 1)

        given(sourceCvRepository.findById(versionId)).willReturn(Optional.of(target))

        assertThrows<IllegalArgumentException> {
            service.restore(userId, versionId)
        }
    }
}
