'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Upload, Sparkles, ArrowRight } from 'lucide-react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/auth-provider'

export default function ResumeOptimizerPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [experienceStore, setExperienceStore] = useState('')
  const [jobDescription, setJobDescription] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-foreground">Resume Optimizer</h1>
            <Badge variant="secondary" className="text-xs">Beta</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Tailor your resume to match job descriptions with AI-powered suggestions
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-medium text-foreground">Experience Bank</h2>
                  <p className="text-xs text-muted-foreground">Your bullet variations and achievements</p>
                </div>
              </div>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="experience" className="sr-only">Experience</FieldLabel>
                  <Textarea
                    id="experience"
                    placeholder="Paste your experience bullets here...

Example:
- Led migration of monolithic app to microservices, reducing deployment time by 60%
- Built real-time notification system handling 1M+ daily messages
- Mentored 5 junior developers through weekly code reviews"
                    className="min-h-[200px] resize-none"
                    value={experienceStore}
                    onChange={(e) => setExperienceStore(e.target.value)}
                  />
                </Field>
              </FieldGroup>
              
              <div className="mt-4">
                <Button variant="outline" size="sm" disabled className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Resume (PDF, DOCX) - Coming soon
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-medium text-foreground">Job Description</h2>
                  <p className="text-xs text-muted-foreground">Paste the job posting you're targeting</p>
                </div>
              </div>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="jobdesc" className="sr-only">Job Description</FieldLabel>
                  <Textarea
                    id="jobdesc"
                    placeholder="Paste the job description here...

The AI will analyze keywords, required skills, and responsibilities to suggest the best matching bullets from your experience bank."
                    className="min-h-[200px] resize-none"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </Field>
              </FieldGroup>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              disabled={!experienceStore || !jobDescription}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze & Optimize
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6">
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Sparkles className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-base font-medium text-foreground">AI Suggestions</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                After analysis, you'll see AI-powered recommendations here:
              </p>
              <ul className="mt-4 space-y-2 text-left text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Best matching bullets from your experience bank
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Suggested edits to better match JD keywords
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Skills to highlight or add
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Items to cut or reorder
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
