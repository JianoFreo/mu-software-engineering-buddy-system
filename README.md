# Manulife Software Engineering Buddy System 
Jiano Freo Magtangob - Technological University of the Philippines

Katrina Reigne Dela Cruz - De La Salle University 
— Anonymous Forum

A full-stack anonymous forum. Plain JavaScript throughout (no TypeScript).

- **Backend**: Node.js + Express + `@neondatabase/serverless` (Postgres on Neon)
- **Frontend**: React (Vite) + Tailwind CSS

## Features

- Create posts (title + content, content capped at 200 chars)
- Comment on posts (hidden by default, click to show/hide)
- Upvote / downvote posts and comments independently
- Edit post titles
- Delete posts
- Latest post/comment shown first
- Pagination (10 posts/page)
- Sort by newest, oldest, or most upvoted
- Search posts by title/content

## 1. Database setup (Neon)

1. Create a free project at [neon.tech](https://neon.tech).
2. Copy the connection string (looks like `postgres://user:pass@ep-xxx.neon.tech/dbname?sslmode=require`).
3. In `backend/`, copy `.env.example` to `.env` and paste it in as `DATABASE_URL`.

## 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # then edit DATABASE_URL
npm run migrate        # creates posts + comments tables
npm run dev             # starts API on http://localhost:4000
```

## 3. Frontend

```bash
cd frontend
npm install
npm run dev              # starts on http://localhost:5173, proxies /api to :4000
```

Open http://localhost:5173.

## API

| Method | Route                        | Description                     |
|--------|-------------------------------|----------------------------------|
| GET    | /api/posts?page=&limit=&sort=&search= | List posts (paginated)  |
| GET    | /api/posts/:id                | Get one post with comments      |
| POST   | /api/posts                    | Create a post `{title, content}`|
| PATCH  | /api/posts/:id                | Edit post title `{title}`       |
| DELETE | /api/posts/:id                | Delete a post                   |
| POST   | /api/posts/:id/vote           | Vote on post `{direction}`      |
| GET    | /api/posts/:postId/comments   | List comments for a post        |
| POST   | /api/posts/:postId/comments   | Add a comment `{content}`       |
| POST   | /api/comments/:id/vote        | Vote on comment `{direction}`   |

`direction` is `"up"` or `"down"`.

## Notes

- No auth/accounts by design — the forum is anonymous. All posting/voting actions are open (no access control on votes, so duplicate votes from the same user aren't currently prevented — a stretch goal to add if needed, e.g. via a client-side fingerprint or session cookie).
- Deploy backend anywhere that runs Node (Render, Railway, Fly.io) with `DATABASE_URL` set; deploy frontend as a static build (`npm run build` → `dist/`) to Vercel/Netlify, pointing its API calls at the deployed backend URL (update the proxy or add a `VITE_API_URL` env if hosting separately).
