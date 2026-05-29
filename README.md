# Saarthi

<p align="center" >
  AI ecosystem helping students learn, organize, and grow through personalized guidance, intelligent assistance, and connected educational experiences.
</p>


<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Shadcn_UI-000000?style=for-the-badge&logo=shadcnui&logoColor=white" />
  <img src="https://img.shields.io/badge/Lucide-000000?style=for-the-badge&logo=lucide&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white" />
  <img src="https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" />
  <img src="https://img.shields.io/badge/Grok_AI-000000?style=for-the-badge" />
  <img src="https://img.shields.io/badge/AI_Powered-111111?style=for-the-badge" />
  <img src="https://img.shields.io/badge/REST_API-FF6B35?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
  <img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black" />
  <img src="https://img.shields.io/badge/Responsive-000000?style=for-the-badge&logo=googlechrome&logoColor=white" />
  <img src="https://img.shields.io/badge/Open_Source-181717?style=for-the-badge&logo=github&logoColor=white" />
</p>


<p align="center">
  <a href="https://saarthi-v2.vercel.app">Saarthi</a>
</p>

---

## What is Saarthi?

Saarthi is an AI-powered educational ecosystem designed to support students throughout their learning journey.

Students today rely on a fragmented collection of tools for studying, organizing resources, tracking progress, managing tasks, and seeking guidance. Saarthi brings these experiences together into a unified platform built around personalized educational support.

The platform combines AI assistance, academic organization, intelligent recommendations, and progress tracking into a single experience that helps students focus less on managing information and more on learning effectively.

Whether understanding a difficult concept, organizing study material, tracking academic progress, or exploring opportunities, Saarthi acts as an intelligent companion that adapts to each student's needs.

---

## Core Features

* AI-powered educational assistant
* Personalized student dashboard
* Learning resource management
* Academic progress tracking
* Intelligent recommendations
* Secure authentication system
* Personalized learning support
* Modern responsive interface
* Cross-device accessibility
* Student-centric user experience
* Scalable AI ecosystem architecture

---

## Preview

Experience Saarthi → <a href="https://saarthi-v2.vercel.app">saarthi-v2.vercel.app</a>

### Landing Page


<p align="center">
  <a href="https://saarthi-v2.vercel.app/">
    <img
      src="https://raw.githubusercontent.com/vaibhav-katyal/saarthi/main/public/landing.png"
      alt="Saarthi Preview"
      width="100%"
    />
  </a>
</p>

### AI Assistant

<p align="center">
  <a href="https://saarthi-v2.vercel.app/">
    <img
      src="https://raw.githubusercontent.com/vaibhav-katyal/saarthi/main/public/SaarthiAI.png"
      alt="Saarthi Preview"
      width="100%"
    />
  </a>
</p>

---

## Tech Stack

| Layer          | Technology      |
| -------------- | --------------- |
| Frontend       | Next.js + React |
| Language       | TypeScript      |
| Styling        | Tailwind CSS    |
| Backend        | Node.js         |
| Database       | MongoDB         |
| Authentication | Clerk           |
| AI Layer       | OpenAI          |
| Deployment     | Vercel          |

---

## Local Development

### Clone Repository

```bash
git clone https://github.com/vaibhav-katyal/saarthi.git
```

### Navigate Into Project

```bash
cd saarthi
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

```env
MONGODB_URI=
OPENAI_API_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
```

### Start Development Server

```bash
npm run dev
```

Application runs locally at:

```bash
http://localhost:3000
```

---

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Create production build
npm run start     # Run production build
npm run lint      # Run lint checks
```

---

## Project Structure

```bash
saarthi/
│
├── backend/
│   │
│   ├── src/
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── assistant.controller.ts
│   │   │   └── analytics.controller.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── assistant.routes.ts
│   │   │   └── analytics.routes.ts
│   │   │
│   │   ├── services/
│   │   │   ├── ai.service.ts
│   │   │   ├── recommendation.service.ts
│   │   │   ├── analytics.service.ts
│   │   │   └── resource.service.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   └── error.middleware.ts
│   │   │
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Resource.ts
│   │   │   ├── Progress.ts
│   │   │   └── Analytics.ts
│   │   │
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── openai.ts
│   │   │   └── env.ts
│   │   │
│   │   ├── utils/
│   │   │
│   │   └── server.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   │
│   ├── public/
│   │   ├── images/
│   │   ├── icons/
│   │   └── screenshots/
│   │
│   ├── src/
│   │   │
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   ├── assistant/
│   │   │   ├── resources/
│   │   │   ├── profile/
│   │   │   ├── auth/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── dashboard/
│   │   │   ├── assistant/
│   │   │   └── shared/
│   │   │
│   │   ├── hooks/
│   │   │
│   │   ├── context/
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   └── assistant.ts
│   │   │
│   │   ├── lib/
│   │   │
│   │   ├── types/
│   │   │
│   │   └── styles/
│   │
│   ├── package.json
│   └── next.config.js
│
├── docs/
│   ├── architecture/
│   ├── api/
│   └── screenshots/
│
├── .env.example
├── .gitignore
├── README.md
└── LICENSE
```


---

## Engineering Principles

* AI-first educational experiences
* Performance-focused architecture
* Clean and maintainable codebase
* Modular component design
* Responsive and accessible interfaces
* Scalable system foundations
* Student-centric product decisions
* Developer-friendly workflows

---

## Vision

Education is not a content problem.

It is a guidance problem.

Saarthi is building an AI ecosystem where students can learn, organize, explore opportunities, and receive personalized support through interconnected intelligent systems designed around educational growth.

The goal is simple:

Provide every student access to personalized guidance, educational intelligence, and continuous support at scale.

---

## Contributing

Contributions, improvements, and feature suggestions are welcome.

```bash
git checkout -b feature/your-feature
```

Open a pull request with a clear explanation of the changes introduced.

---

## License

Powered by curiosity, ambition, and number of late-night commits.

---

