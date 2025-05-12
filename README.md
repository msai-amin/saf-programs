# SAF AI Readiness Comparison Tool

A web application for comparing AI readiness across SAF-accredited forestry programs.

## Project Structure

```
SAF-AI-Comparison/
├── frontend/           # React frontend application
│   ├── public/        # Static files and reports
│   └── src/           # Source code
└── backend/           # Node.js backend server
    └── src/           # Server source code
```

## Features

- Compare AI readiness across multiple universities
- View detailed university profiles
- Access comprehensive reports
- Print-friendly document viewer

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/msai-amin/saf-programs.git
   cd saf-programs
   ```

2. Install frontend dependencies:
   ```bash
   cd SAF-AI-Comparison/frontend
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd ../backend
   npm install
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

5. In a new terminal, start the frontend:
   ```bash
   cd ../frontend
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Technologies Used

- Frontend:
  - React
  - TypeScript
  - Material-UI
  - Recharts
  - Mammoth.js

- Backend:
  - Node.js
  - Express
  - TypeScript

## License

MIT License 