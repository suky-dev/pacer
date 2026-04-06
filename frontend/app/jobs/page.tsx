import { Suspense } from 'react'
import { Header } from '@/components/header'
import { JobsList } from '@/components/jobs-list'

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Suspense>
          <JobsList />
        </Suspense>
      </main>
    </div>
  )
}
