# School_AS Frontend

## Overview
This is the modern Frontend for the School_AS platform, built with **React**, **Vite**, and **TailwindCSS**. It consumes the School_AS Backend API.

## Repositories
- **Frontend (This Repo)**: [https://github.com/Mylisuthy/School_AS_Frontend.git](https://github.com/Mylisuthy/School_AS_Frontend.git)
- **Backend API**: [https://github.com/Mylisuthy/School_AS.git](https://github.com/Mylisuthy/School_AS.git)

## Features
- **Premium Design**: Modern UI with TailwindCSS, gradients, and animations.
- **Authentication**: JWT-based login with persistent session.
- **Course Management**: Full CRUD (Create, Read, Update, Delete).
- **Lesson Management**: Add and reorder lessons.
- **Docker Support**: Multi-stage build (Node -> Nginx).

## Prerequisites
- Node.js 18+

## Configuration
Create a `.env` file (or use `.env.local`):
```ini
VITE_API_URL=http://localhost:8080/api
```

## Running Locally

### Option 1: Docker (Recommended)
Run as part of the main `docker-compose` stack in the backend repository.
```bash
# In the backend repo root
sudo docker-compose up --build
```

### Option 2: npm
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Access at: http://localhost:5173

## Deployment (Vercel)
1. Import this repository into Vercel.
2. Set Environment Variable:
   - `VITE_API_URL`: URL of your deployed Backend API.
