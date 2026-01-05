# School_AS Frontend

## Overview
This is the modern Frontend for the School_AS platform, built with **React**, **Vite**, and **TailwindCSS**. It consumes the School_AS Backend API.

## Repositories
- **Frontend (This Repo)**: [https://github.com/Mylisuthy/School_AS_Frontend.git](https://github.com/Mylisuthy/School_AS_Frontend.git)
- **Backend API**: [https://github.com/Mylisuthy/School_AS.git](https://github.com/Mylisuthy/School_AS.git)

## Features
- **Premium Design**: Modern UI with TailwindCSS, gradients, and animations.
- **Authentication**: JWT-based login with persistent session.
- **Course Management**: Create, Read, Update, Delete (Soft Delete).
- **Lesson Management**: Add and reorder lessons.

## Prerequisites
- Node.js 18+
- Running Backend API (via Docker on port 5000 recommended).

## Configuration
Create a `.env` file in the root directory:
```ini
VITE_API_URL=http://localhost:5000/api
```
*Note: The backend default docker port is 5000. Adjust if different.*

## Running Locally
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start Development Server**:
   ```bash
   npm run dev
   ```
3. **Access Application**:
   - URL: [http://localhost:5173](http://localhost:5173)

## Deployment (Vercel)
1. Import this repository into Vercel.
2. Set Environment Variable in Vercel Project Settings:
   - `VITE_API_URL`: URL of your live Backend API (e.g. Render URL).
