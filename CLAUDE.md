
# Project: tech job aggregator

## Goal
Aggregate tech job listings from multiple sources with keyword filtering.
Personal side project — optimizing for clean Kotlin code and real deployment.

## Stack
- Backend: Kotlin + Spring Boot **4.0.3**, Java 21, PostgreSQL, Railway
- Frontend: Next.js + TypeScript, Vercel
- Job sources: LinkedIn scraping (scheduled)
- Package manager: pnpm (run with `npx pnpm` if not installed globally)

## Environment
- `application-local.properties` is gitignored — copy manually to worktrees
- Run backend: `./gradlew bootRun` from `backend/`
- Run frontend: `npx pnpm dev` from `frontend/`

## Architecture
### BE
- API server - no server-side rendering
- It should follow **DDD**, SOLID and OOP principles
- Keep track test coverage. You can develop by TDD if possible
- Scheduled job runs every 6 hours to collect new listings

### FE
- calls BE API, deployed separately

## Kotlin conventions
- Use data classes for DTOs
- Coroutines over blocking I/O where possible
- Repository pattern for DB access (Spring Data JPA)
- All entity PKs: UUID with `@UuidGenerator(style = UuidGenerator.Style.TIME)`

## Spring Boot 4 gotchas
- `@DataJpaTest` → `org.springframework.boot.data.jpa.test.autoconfigure`
- `@AutoConfigureTestDatabase` → `org.springframework.boot.jdbc.test.autoconfigure`
- Tests use real PostgreSQL (no Testcontainers/Docker): add `@AutoConfigureTestDatabase(replace=NONE)` + `@ActiveProfiles("local")`
- JWT beans (`JwtEncoder`/`JwtDecoder`) must live in a separate `@Configuration` to avoid circular deps with `SecurityConfig`

## Frontend gotchas
- `useSearchParams()` must be wrapped in `<Suspense>` or build fails

## Current phase
- Auth: Google OAuth2 + JWT ✅
- Resume optimization: in progress (B → A → Tracking)
- Job collection pipeline: planned
