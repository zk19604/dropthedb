# 🎵 DropTheDB

A full-stack music social platform where users can search and like songs via the Spotify API, build playlists, connect with friends, and get personalized recommendations — all backed by a custom SQL Server database.

---

## 🖼️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (JavaScript) |
| Backend | Node.js + Express |
| Database | Microsoft SQL Server (T-SQL) |
| Music Data | Spotify Web API |
| Mood Based Recommendation | Gemini API |

---

## ✨ Features

### 🎧 Music
- Search songs via the **Spotify API** and like them directly into your library
- Songs, artists, albums, and genres are automatically stored in the database on first like
- View your full **liked songs** library with artist, album, and genre info

### 📋 Playlists
- Create, update, and delete personal playlists
- Add or remove songs from any playlist
- Filter playlist songs by genre

### 👥 Social
- Add and remove friends
- Browse songs your **friends have liked**
- Search for other users by name

### 🤖 Recommendations
- Get song suggestions based on your **top artists**
- Get suggestions based on your **top genres**
- Combined recommendations using both top artists and genres

### 😊 Mood Based Recommendations
- Provides mood based recommendations
- Uses the **Gemini API** for recommendation based on user mood

### 🏷️ Data Management
- Full CRUD for genres, artists, albums, users, songs, and taste records
- Batch insert/delete support (pass arrays of IDs)
- Partial update support for users and artists
