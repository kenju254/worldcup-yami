# World Cup 2026 Tracking Application

*Author: Product Manager: Kenneth Kinyanjui*

## Product Overview
Welcome to the World Cup 2026 Tracking Application! Our goal was to build the ultimate, real-time companion for football fans globally. We aimed to deliver a product that is not only lightning-fast and reliable during peak match traffic but also visually stunning and deeply personalized.

## Features
- 📅 **Daily Schedule**: Real-time updates on upcoming matches.
- 🏆 **Match Results**: Instant access to final scores and statistics.
- 📺 **Highlights**: Curated video highlights integrated directly into the dashboard.
- 🌍 **Team Follower**: Personalized tracking for your favorite nations.

## Product Review & Documentation
To ensure we met our rigorous standards, this product has been thoroughly reviewed by our engineering and design leadership:

- 🏗️ **[Architecture Review](architecture.md)**: Read our Distinguished Engineer's analysis of our scalable Next.js and Firebase serverless backend.
- 🎨 **[Design Review](design.md)**: Read our Principal Designer's breakdown of the simple, elegant, and modern UX/UI.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Firebase CLI

### Installation

1. **Clone & Install Frontend:**
   ```bash
   npm install
   ```

2. **Setup Backend (Functions):**
   ```bash
   cd functions
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Environment Variables:**
   - Create `.env` in the `functions/` directory with `FOOTBALL_API_KEY` and `YOUTUBE_API_KEY`.

4. **Run Locally:**
   - Frontend: `npm run dev`
   - Backend: `firebase emulators:start` (or run the Flask app locally via python)

Enjoy the beautiful game! ⚽
