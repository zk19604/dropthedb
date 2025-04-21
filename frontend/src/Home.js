import React from "react";
import { Link } from "react-router-dom";
import "./home.css";

function Home() {
  const username = localStorage.getItem("username");
  const userid = localStorage.getItem("userId");

  return (
    <div className="home-body">
      <div className="home-container">
        <div className="window-bar">
          <span>🎧 Home Dashboard</span>
          <span>ID: {userid}</span>
        </div>

        <h2 className="welcome">Welcome, {username} 👋</h2>

        <nav className="nav-links">
          <Link to="/play">🎮 Play</Link>
          <Link to="/user">👤 User Info</Link>
          <Link to="/ai">🤖 AI Recommendations</Link>
          <Link to="/reccomendedsongspage">🎵 View Recommended Songs</Link>
          <Link to="/friends">👯 Friends</Link>
          <Link to="/playlist">📂 Playlist</Link>
          <Link to="/player">▶️ Player</Link>
          <Link to="/liked">❤️ Liked Songs</Link>
          <Link to="/delete">💀 Tired of us?</Link>
        </nav>
      </div>
    </div>
  );
}

export default Home;
