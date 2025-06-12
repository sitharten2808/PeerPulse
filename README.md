# Pulse - Peer Learning Platform

A modern web application for managing peer learning, team collaboration, and assignment submissions.

## Features

- User authentication with Supabase
- Team management and collaboration
- Assignment creation and submission
- Peer grading and feedback
- Analytics and insights
- Real-time updates

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Shadcn UI
- Supabase (Auth + Database)
- React Query
- React Router

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pulse-team-bloom.git
cd pulse-team-bloom
```

2. Install dependencies:
```bash
npm install
```

3. Create a Supabase project and get your project URL and anon key.

4. Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the database migrations:
```bash
# Install Supabase CLI
npm install -g supabase-cli

# Link your project
supabase link --project-ref your_project_ref

# Push the migrations
supabase db push
```

6. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8080`.

## Project Structure

```
src/
  ├── components/     # React components
  ├── contexts/       # React contexts
  ├── lib/           # Utility functions and configurations
  ├── pages/         # Page components
  └── types/         # TypeScript type definitions
```

## Database Schema

The application uses the following tables:

- `users`: User profiles and authentication
- `teams`: Team information
- `team_members`: Team membership
- `assignments`: Assignment details
- `submissions`: Assignment submissions
- `feedback`: Feedback on submissions
- `peer_grading`: Peer grading data

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.