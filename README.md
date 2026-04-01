# Revalto

Revalto is a full-stack real estate platform where users can discover and manage property listings, post reviews, upload property documents, and create booking or purchase records.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- EJS + ejs-mate templates
- Passport.js (local auth)
- Cloudinary + Multer for uploads
- Joi for validation

## Core Features

- User authentication (signup, login, profile)
- Property listing CRUD
- Reviews with author/ownership checks
- Booking and purchase flows
- Document upload support
- Flash messages and session-based UX
- Geocoding migration script for existing listings

## Project Structure

```text
controllers/   Request handlers by resource
models/        Mongoose models
routes/        Express route modules
views/         EJS pages and layouts
public/        Static assets (CSS, JS, HTML)
utils/         Shared utilities (errors, upload, cloudinary)
init/          Seed and migration scripts
```

## Local Setup

### 1) Prerequisites

- Node.js 18+
- MongoDB running locally on `mongodb://127.0.0.1:27017/test`

### 2) Install dependencies

```bash
npm install
```

### 3) Configure environment variables

Create a `.env` file in the project root:

```env
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
NODE_ENV=development
```

Notes:
- Cloudinary variables are required for upload features.
- The app currently uses a local MongoDB URL inside source files.

### 4) Run the app

```bash
npm start
```

Open: `http://localhost:8088`

## Useful Scripts

- `npm start` - Run the Express app
- `npm run seed` - Seed initial listing data
- `npm run geocode` - Geocode listings that still have default/missing coordinates

## Contribution Guide

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before creating a pull request.

## Roadmap Ideas

- Add automated tests (unit and integration)
- Move hardcoded secrets/DB URL to environment variables
- Add CI checks for lint + test
- Add API/route documentation

## Repository

- Issues: https://github.com/Bharadwaj-2024/Revalto/issues
- Source: https://github.com/Bharadwaj-2024/Revalto
