# One Piece TCG Tournament Tracker

A web application for One Piece Trading Card Game (TCG) players to track their tournament rounds, record round results, and analyze their performance statistics.

## Features

- **Tournament Management**: Create and manage multiple tournaments with date
- **Round Tracking**: Record individual rounds with:
  - Opponent name
  - Opponent's deck type
  - Round result (won/lost)
  - Coin flip result (won/lost)
- **Statistics**: View tournament statistics including:
  - Total rounds played
  - Win/loss count
  - Win rate percentage
  - Coin flip win count
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Framework**: Next.js 16.2.6
- **UI Library**: React 19.2.4
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)

## Getting Started

### Installation

```bash
# Install dependencies
npm install
# or
pnpm install
```

### Development

```bash
# Run the development server
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   └── tournaments/        # Tournament CRUD endpoints
│   │       └── [id]/
│   │           └── rounds/     # Round endpoints
│   ├── tournaments/            # Tournament pages
│   │   ├── page.tsx           # Tournaments list
│   │   └── [id]/              # Tournament detail page
│   ├── layout.tsx             # Root layout with navigation
│   ├── page.tsx               # Home page
│   └── globals.css            # Global styles
├── components/
│   ├── TournamentForm.tsx      # Create tournament form
│   ├── TournamentList.tsx      # Display tournaments
│   ├── RoundForm.tsx           # Add round form
│   └── RoundList.tsx           # Display rounds
├── lib/
│   ├── db.ts                   # Tournament and round data access (Supabase)
│   └── leaders.ts              # Leader data access (Supabase)
├── models/
│   ├── tournament.ts           # TypeScript types
│   └── round.ts                # Re-exports types
├── supabase/
│   └── schema.sql              # Database schema and policies
└── public/                     # Static files
```

## API Endpoints

### Tournaments

- `GET /api/tournaments` - List all tournaments
- `POST /api/tournaments` - Create a new tournament
- `GET /api/tournaments/[id]` - Get tournament details
- `PUT /api/tournaments/[id]` - Update tournament
- `DELETE /api/tournaments/[id]` - Delete tournament

### Rounds

- `POST /api/tournaments/[id]/rounds` - Add a round to a tournament
- `DELETE /api/tournaments/[id]/rounds/[roundId]` - Delete a round

## Data Storage

This application uses Supabase for all data persistence (leaders, tournaments, and rounds).

1. Create a Supabase project.
2. Run the SQL in `supabase/schema.sql` in the Supabase SQL editor.
3. Create a `.env.local` file with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
# Optional for server-only privileged access:
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

4. Restart the dev server after updating environment variables.

## Usage

1. **Create a Tournament**: Go to home page, fill the form with tournament details
2. **View Tournament**: Click on a tournament card to view details
3. **Add Rounds**: Use the "Add Round" form to record rounds
4. **Track Stats**: View win rate and round statistics automatically calculated
5. **Delete Rounds**: Use the delete button on any round to remove it

## Future Improvements

- [ ] Deck statistics and win rates by deck
- [ ] Export tournament data (CSV/PDF)
- [ ] Tournament seeding and bracket generation
- [ ] Player profiles and statistics aggregation
- [ ] Dark mode support
- [ ] Multi-language support

## License

This project is open source and available under the MIT License.
