# One Piece TCG Tournament Tracker

A web application for One Piece Trading Card Game (TCG) players to track their tournament matches, record match results, and analyze their performance statistics.

## Features

- **Tournament Management**: Create and manage multiple tournaments with date
- **Match Tracking**: Record individual matches with:
  - Opponent name
  - Opponent's deck type
  - Match result (won/lost)
  - Coin flip result (won/lost)
- **Statistics**: View tournament statistics including:
  - Total matches played
  - Win/loss count
  - Win rate percentage
  - Coin flip win count
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Framework**: Next.js 16.2.6
- **UI Library**: React 19.2.4
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript

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
│   │           └── matches/    # Match endpoints
│   ├── tournaments/            # Tournament pages
│   │   ├── page.tsx           # Tournaments list
│   │   └── [id]/              # Tournament detail page
│   ├── layout.tsx             # Root layout with navigation
│   ├── page.tsx               # Home page
│   └── globals.css            # Global styles
├── components/
│   ├── TournamentForm.tsx      # Create tournament form
│   ├── TournamentList.tsx      # Display tournaments
│   ├── MatchForm.tsx           # Add match form
│   └── MatchList.tsx           # Display matches
├── lib/
│   └── db.ts                   # In-memory data management
├── models/
│   ├── tournament.ts           # TypeScript types
│   └── match.ts                # Re-exports types
└── public/                     # Static files
```

## API Endpoints

### Tournaments

- `GET /api/tournaments` - List all tournaments
- `POST /api/tournaments` - Create a new tournament
- `GET /api/tournaments/[id]` - Get tournament details
- `PUT /api/tournaments/[id]` - Update tournament
- `DELETE /api/tournaments/[id]` - Delete tournament

### Matches

- `POST /api/tournaments/[id]/matches` - Add a match to a tournament
- `DELETE /api/tournaments/[id]/matches/[matchId]` - Delete a match

## Data Storage

Currently, the application uses in-memory storage for development. To use a persistent database:

1. Replace the functions in `lib/db.ts` with database calls
2. Recommended databases: PostgreSQL, MongoDB, or SQLite
3. Add a `.env.local` file with database connection strings

## Usage

1. **Create a Tournament**: Go to home page, fill the form with tournament details
2. **View Tournament**: Click on a tournament card to view details
3. **Add Matches**: Use the "Add Match" form to record matches
4. **Track Stats**: View win rate and match statistics automatically calculated
5. **Delete Matches**: Use the delete button on any match to remove it

## Future Improvements

- [ ] Persistent database integration
- [ ] Deck statistics and win rates by deck
- [ ] Export tournament data (CSV/PDF)
- [ ] Tournament seeding and bracket generation
- [ ] Player profiles and statistics aggregation
- [ ] Dark mode support
- [ ] Multi-language support

## License

This project is open source and available under the MIT License.
