# EcoInsight Emissions Dashboard

A full-stack dashboard for visualizing industrial emissions data, featuring an AI-powered chat analyst capable of querying the live internet for insights.

## Features
- **Interactive Visualization**: Emissions trends (Bar Chart) and Sector breakdown (Doughnut Chart).
- **AI Analyst**: Chat interface powered by OpenAI.
- **Live Internet Access**: Uses Tavily API to fetch real-time environmental regulations and news.
- **Premium UI**: Responsive Glassmorphism design.

## Prerequisites
- Node.js (v16+)
- OpenAI API Key (Optional, for smart chat)
- Tavily API Key (Optional, for internet search)

## Quick Start (Docker)
The easiest way to run the "server" environment is using Docker Compose.

1. Create a `.env` file in the `./server` directory (see `.env.example`).
2. Run:
   ```bash
   docker-compose up --build
   ```
3. Open `http://localhost:4173` in your browser.

## Manual Setup

### Backend
```bash
cd server
npm install
# Create .env file with your keys
npm start
# Runs on http://localhost:3000
```

### Frontend
```bash
cd client
npm install
npm run dev
# Runs on http://localhost:5173
```

## Architecture
- **Frontend**: React, Vite, Chart.js, Lucide React
- **Backend**: Node.js, Express, Axios
- **Data**: JSON-based structured store (`/server/data/emissions.json`)

## Deployment
This project is containerized and ready for public cloud deployment.
- **Render/Railway**: Connect this repo and deploy using the `Dockerfile` in specific directories.
- **AWS/DigitalOcean**: SCP the files to your instance and run `docker-compose up -d`.
