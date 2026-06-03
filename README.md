# StreamSphere — OTT Streaming Platform

Full-stack MERN application with live streaming, real-time chat, video management, and subscription system.

## Tech Stack

- **Frontend**: React 18, React Router 6, Axios, Socket.IO Client — deployable on Vercel
- **Backend**: Node.js, Express, Socket.IO — deployable on Render
- **Database**: MongoDB Atlas
- **Media**: Cloudinary (video + image storage)

## Roles

| Role | Capabilities |
|------|-------------|
| Admin | Manage users, videos, categories, subscriptions; analytics dashboard |
| Creator | Upload/manage videos, create/manage live streams, creator analytics |
| Subscriber | Browse, watch, history, continue watching, manage subscription |

## Quick Start (Local)

### Backend
```bash
cd Backend
npm install
cp .env.example .env   # fill in your values
node utils/seed.js     # seeds admin + categories
npm run dev
```

### Frontend
```bash
cd Frontend
npm install
cp .env.example .env   # fill in your values
npm start
```

Default seed credentials:
- Admin: `admin@streamsphere.com` / `Admin@123`
- Creator: `creator@streamsphere.com` / `Creator@123`

## Deployment

### Backend → Render

1. Create a new **Web Service** on Render
2. Connect your repo, set root directory to `Backend/`
3. Build: `npm install` | Start: `npm start`
4. Add environment variables (see `Backend/.env.example`)

### Frontend → Vercel

1. Import repo on Vercel, set root directory to `Frontend/`
2. Framework: Create React App
3. Add environment variables:
   - `REACT_APP_API_URL` = `https://your-backend.onrender.com/api`
   - `REACT_APP_SOCKET_URL` = `https://your-backend.onrender.com`

### Database → MongoDB Atlas

1. Create a free cluster
2. Add `0.0.0.0/0` to IP whitelist (or Render's IP)
3. Copy connection string to `MONGO_URI` env var

### Media → Cloudinary

1. Create free Cloudinary account
2. Copy Cloud Name, API Key, API Secret to env vars

## Environment Variables

### Backend
| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key (min 32 chars) |
| `JWT_EXPIRE` | Token expiry (e.g. `7d`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLIENT_URL` | Frontend URL (comma-separated for multiple) |
| `PORT` | Server port (default 5000) |

### Frontend
| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Backend API base URL |
| `REACT_APP_SOCKET_URL` | Backend Socket.IO URL |

## API Endpoints

| Route | Description |
|-------|-------------|
| `POST /api/auth/register` | Register user |
| `POST /api/auth/login` | Login |
| `GET /api/auth/me` | Get current user |
| `GET /api/videos` | List published videos |
| `POST /api/videos` | Upload video (creator) |
| `GET /api/streams` | List live/scheduled streams |
| `POST /api/streams` | Create stream (creator) |
| `GET /api/analytics/admin` | Admin analytics |
| `GET /api/analytics/creator` | Creator analytics |

## Features

- JWT Authentication + Role-Based Access Control
- Video upload to Cloudinary with progress tracking
- Live stream creation, scheduling, start/end
- Real-time chat via Socket.IO (global + stream rooms)
- Subscription plans: Free, Basic ($8.99), Premium ($15.99), Family ($22.99)
- Admin dashboard with user/video/category/subscription management
- Full analytics for admin and creators
- Watch history + continue watching
- Search, categories, trending, featured videos
# StreamSphere
