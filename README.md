# folk-music-telugu-website

Telugu folk songs website with:
- Public pages for songs, lyrics, and artists
- Admin dashboard for adding/editing/deleting song metadata
- Node.js backend API
- MongoDB shared database
- Google Drive playable links for audio

## Architecture

- **Frontend**: static HTML/CSS/JS under root folders
- **Backend**: `server.js` (Express + JWT auth + MongoDB)
- **Database**: MongoDB (`Song`, `Category`, `AdminUser`)
- **Audio files**: Admin-managed playable URLs (Google Drive links supported)

## Admin flow

1. Login via `admin/login.html`
2. Open `admin/index.html`
3. Add song metadata + lyrics
4. Paste playable audio URL (Google Drive link is supported)
5. Save song to MongoDB

Public pages read data from backend APIs, so all users/devices see the same content.

## Required environment setup

Create `.env` in project root (use `.env.example` as template):

```env
PORT=8080
MONGODB_URI=mongodb+srv://project:mammillapally5@lokesh.nlars.mongodb.net/<dbName>?retryWrites=true&w=majority
JWT_SECRET=replace-with-long-random-secret
ADMIN_EMAIL=btp@gmail.com
ADMIN_PASSWORD=replace-with-strong-password
```

## Install and run

```bash
npm install
npm run check
npm start
```

Open:
- Public home: `http://localhost:8080/`
- Songs: `http://localhost:8080/songs/`
- Admin login: `http://localhost:8080/admin/login.html`

## API summary

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/categories`
- `POST /api/categories` (admin)
- `DELETE /api/categories/:name` (admin)
- `GET /api/songs`
- `GET /api/songs/:id`
- `POST /api/songs` (admin, JSON body with `audioUrl`)
- `PUT /api/songs/:id` (admin)
- `DELETE /api/songs/:id` (admin)

## Important security notes

- Do not commit `.env`.
- Validate that added audio links are publicly playable before saving songs.
