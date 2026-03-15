import { Job } from './types'

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Backend Engineer',
    company: 'Stripe',
    location: 'San Francisco, CA',
    description: `We're looking for a Senior Backend Engineer to join our Payments Infrastructure team. You'll work on systems that process billions of dollars in payments every year.

**What you'll do:**
- Design and build scalable APIs that power Stripe's payment processing
- Work on distributed systems handling millions of transactions per second
- Collaborate with product teams to ship new features
- Mentor junior engineers and contribute to engineering culture

**What we're looking for:**
- 5+ years of experience building backend systems at scale
- Strong proficiency in Java or Kotlin
- Experience with distributed systems and microservices
- Familiarity with databases like PostgreSQL, Redis, and Kafka
- Excellent communication skills

**Nice to have:**
- Experience in fintech or payments
- Contributions to open source projects
- Experience with Ruby or Go`,
    tags: ['Java', 'Kotlin', 'PostgreSQL', 'Redis', 'Kafka'],
    source: 'linkedin',
    workType: 'hybrid',
    url: 'https://stripe.com/jobs',
    postedAt: '2024-01-15',
    salary: '$180k - $250k',
  },
  {
    id: '2',
    title: 'Frontend Engineer',
    company: 'Vercel',
    location: 'Remote',
    description: `Join Vercel's Frontend Infrastructure team and help build the future of web development. You'll work on our dashboard, CLI tools, and developer experience.

**What you'll do:**
- Build and maintain Vercel's dashboard using React and Next.js
- Improve developer experience for millions of developers
- Work on performance optimizations and accessibility
- Contribute to open source projects like Next.js

**What we're looking for:**
- 3+ years of experience with React and TypeScript
- Strong understanding of web fundamentals (HTML, CSS, JavaScript)
- Experience with Next.js or similar frameworks
- Passion for developer experience and design systems

**Our stack:**
- Next.js, React, TypeScript
- Tailwind CSS, Radix UI
- Turborepo, SWR`,
    tags: ['React', 'TypeScript', 'Next.js', 'Tailwind'],
    source: 'arbeitnow',
    workType: 'remote',
    url: 'https://vercel.com/careers',
    postedAt: '2024-01-14',
    salary: '$150k - $200k',
  },
  {
    id: '3',
    title: 'Staff Software Engineer',
    company: 'Linear',
    location: 'Remote (US/EU)',
    description: `Linear is looking for a Staff Software Engineer to help build the next generation of project management tools. We're a small team building software that developers love.

**About the role:**
- Own major features from conception to deployment
- Work across the full stack (React, Node.js, PostgreSQL)
- Help define our technical direction and architecture
- Collaborate closely with design and product

**Requirements:**
- 7+ years of software engineering experience
- Experience building and scaling web applications
- Strong opinions on code quality and developer experience
- Excellent written and verbal communication

**Tech stack:**
- React, TypeScript, Node.js
- PostgreSQL, Redis
- Electron for desktop app`,
    tags: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    source: 'linkedin',
    workType: 'remote',
    url: 'https://linear.app/careers',
    postedAt: '2024-01-13',
    salary: '$200k - $280k',
  },
  {
    id: '4',
    title: 'Mobile Engineer (Android)',
    company: 'Duolingo',
    location: 'Pittsburgh, PA',
    description: `Join Duolingo's Android team and help 500+ million people learn languages! We're looking for an engineer who cares deeply about craft and user experience.

**What you'll do:**
- Build new features for our Android app
- Improve app performance and reliability
- Work with product and design to create delightful experiences
- Contribute to our Android architecture and patterns

**Requirements:**
- 3+ years of Android development experience
- Strong Kotlin skills
- Experience with modern Android architecture (MVVM, Compose)
- Understanding of CI/CD practices

**Bonus:**
- Experience with A/B testing
- Interest in language learning or education`,
    tags: ['Kotlin', 'Android', 'Jetpack Compose', 'MVVM'],
    source: 'arbeitnow',
    workType: 'onsite',
    url: 'https://duolingo.com/careers',
    postedAt: '2024-01-12',
  },
  {
    id: '5',
    title: 'Infrastructure Engineer',
    company: 'Cloudflare',
    location: 'Austin, TX',
    description: `Help build one of the world's largest networks. Cloudflare's infrastructure powers millions of websites and protects them from attacks.

**What you'll do:**
- Build and maintain distributed systems at global scale
- Work on our edge computing platform (Workers)
- Improve reliability and performance of critical systems
- Debug complex issues across our network

**Requirements:**
- 4+ years of infrastructure or backend experience
- Strong systems programming skills (Go, Rust, or C++)
- Experience with Linux and networking
- Understanding of distributed systems concepts

**Nice to have:**
- Experience with Kubernetes or similar orchestration
- Knowledge of networking protocols (TCP/IP, DNS, HTTP)
- Previous experience at scale (millions of requests/sec)`,
    tags: ['Go', 'Rust', 'Kubernetes', 'Linux', 'Networking'],
    source: 'linkedin',
    workType: 'hybrid',
    url: 'https://cloudflare.com/careers',
    postedAt: '2024-01-11',
    salary: '$170k - $230k',
  },
  {
    id: '6',
    title: 'Full Stack Developer',
    company: 'Notion',
    location: 'San Francisco, CA',
    description: `Notion is looking for a Full Stack Developer to help build the all-in-one workspace used by millions of people. Join us in our mission to make software that empowers everyone.

**What you'll do:**
- Build features across our web and desktop apps
- Work on our real-time collaboration engine
- Improve performance and reliability
- Contribute to our design system

**Requirements:**
- 4+ years of full stack development experience
- Strong React and TypeScript skills
- Experience with Node.js or similar backend technologies
- Interest in building productivity tools

**Our stack:**
- React, TypeScript
- Node.js, PostgreSQL
- Electron for desktop`,
    tags: ['React', 'TypeScript', 'Node.js', 'Electron'],
    source: 'arbeitnow',
    workType: 'hybrid',
    url: 'https://notion.so/careers',
    postedAt: '2024-01-10',
    salary: '$160k - $220k',
  },
  {
    id: '7',
    title: 'Machine Learning Engineer',
    company: 'Anthropic',
    location: 'San Francisco, CA',
    description: `Join Anthropic and work on some of the most challenging problems in AI safety. We're building AI systems that are safe, beneficial, and understandable.

**What you'll do:**
- Train and evaluate large language models
- Research new techniques for AI alignment
- Build infrastructure for ML experiments
- Collaborate with researchers on novel approaches

**Requirements:**
- PhD or equivalent experience in ML/AI
- Strong Python and PyTorch skills
- Experience training large models
- Published research is a plus

**About us:**
We're a team of researchers and engineers working to ensure AI systems are safe and beneficial. Our work spans from fundamental research to production systems.`,
    tags: ['Python', 'PyTorch', 'ML', 'AI', 'LLM'],
    source: 'linkedin',
    workType: 'onsite',
    url: 'https://anthropic.com/careers',
    postedAt: '2024-01-09',
    salary: '$250k - $400k',
  },
  {
    id: '8',
    title: 'DevOps Engineer',
    company: 'GitLab',
    location: 'Remote (Worldwide)',
    description: `GitLab is 100% remote and we're looking for a DevOps Engineer to help us scale our platform. You'll work on infrastructure that serves millions of developers.

**What you'll do:**
- Maintain and improve our Kubernetes clusters
- Build automation for deployment and monitoring
- Respond to incidents and improve reliability
- Document processes and runbooks

**Requirements:**
- 3+ years of DevOps/SRE experience
- Strong Kubernetes and Docker skills
- Experience with Terraform or similar IaC tools
- Familiarity with monitoring tools (Prometheus, Grafana)

**Why GitLab:**
- 100% remote company
- Transparent culture
- Competitive compensation
- Work with the DevOps platform used by millions`,
    tags: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'GCP'],
    source: 'arbeitnow',
    workType: 'remote',
    url: 'https://gitlab.com/jobs',
    postedAt: '2024-01-08',
    salary: '$140k - $190k',
  },
]
