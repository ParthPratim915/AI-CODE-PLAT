# AI Code Assessment Platform

An industry-grade coding assessment platform (HackerRank-like) built with Next.js 14, Firebase, and TypeScript.

## Project Goal

This platform enables organizations to conduct coding assessments for candidates. The system supports:
- User authentication and role-based access control (Admin/Candidate)
- Test creation and management (Admin)
- Test taking and submission (Candidate)
- AI-powered code evaluation (future phase)
- Real-time code execution via Judge0 (future phase)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Deployment**: Vercel (recommended)

## Project Structure

```
/app
  /(auth)              # Authentication pages (grouped route)
    /login/page.tsx    # Login page
    /signup/page.tsx   # Signup page
  /dashboard
    /admin/page.tsx    # Admin dashboard
    /candidate/page.tsx # Candidate dashboard
  /test/[testId]/page.tsx # Test attempt page
  /api                 # API routes (to be implemented)
/components            # Reusable React components (to be implemented)
/lib
  firebase.ts          # Firebase initialization
  auth.ts              # Authentication helpers
/types                 # TypeScript type definitions (to be implemented)
/utils                 # Utility functions (to be implemented)
/middleware.ts         # Route protection middleware
```

## Development Phases

### Phase 1: Foundation (Current)
- ✅ Project scaffolding
- ✅ Firebase setup
- ✅ Authentication structure
- ✅ Route protection middleware
- ✅ Basic page placeholders

### Phase 2: Authentication (Next)
- User registration and login UI
- Firebase Auth integration
- Session cookie management
- Role-based access control implementation

### Phase 3: Test Management (Admin)
- Test creation interface
- Question management
- Test configuration (time limits, difficulty)
- Candidate assignment

### Phase 4: Test Taking (Candidate)
- Test interface
- Code editor integration
- Test submission
- Timer and progress tracking

### Phase 5: Code Execution
- Judge0 integration
- Test case execution
- Results compilation

### Phase 6: AI Evaluation
- AI-powered code review
- Automated feedback generation
- Score calculation

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Firebase project with Auth and Firestore enabled

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Firebase credentials in `.env.local`

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

See `.env.example` for required environment variables. All Firebase configuration values should be prefixed with `NEXT_PUBLIC_` for client-side access.

## Code Quality Standards

- **TypeScript**: Strict mode enabled, all files typed
- **Comments**: Clear, intent-explaining comments
- **Security**: No hardcoded secrets, environment variables only
- **Separation**: Client and server logic clearly separated
- **Extensibility**: Code structured for easy extension

## Security Notes

- Never commit `.env.local` or any file containing secrets
- Firebase API keys are safe to expose client-side (they're public by design)
- Server-side operations will use Firebase Admin SDK with private keys
- Route protection middleware will be fully implemented in Phase 2

## License

Private project - All rights reserved
