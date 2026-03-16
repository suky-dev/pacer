# Project: tech job aggregator

## Goal
Aggregate tech job listings from multiple sources with keyword filtering.
Personal side project — optimizing for clean Kotlin code and real deployment.

## Stack
- Backend: Kotlin + Spring Boot 3, PostgreSQL, Railway
- Frontend: Next.js + TypeScript, Vercel
- Job sources: Arbeitnow API + LinkedIn scraping (scheduled)

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

## Current phase
MVP: job collection pipeline + basic list/filter UI
