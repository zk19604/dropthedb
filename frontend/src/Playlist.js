import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./playlist.css";

export const addsongstoplaylist = async (playlistid, songsid) => {
  try {
    if (!playlistid || !songsid) {
      throw new Error("Playlist ID and Song ID are required");
    }

    const response = await fetch(`http://localhost:5001/playlist_s`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playlistid, songsid }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add song to playlist");
    }

    console.log("Song added successfully to playlist");
    return true;
  } catch (error) {
    console.error("Error adding song to playlist:", error);
    return false;
  }
};

export const createPlaylist = async (ptitle, pdescription, userid) => {
  try {
    if (!ptitle || !userid) {
      throw new Error("Playlist title and User ID are required");
    }

    const description =
      pdescription && pdescription.trim() !== "" ? pdescription : null;

    const response = await fetch("http://localhost:5001/playlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ptitle, pdescription: description, userid }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create playlist");
    }

    const data = await response.json();
    console.log("Playlist created successfully:", data);
    return data;
  } catch (error) {
    console.error("Error creating playlist:", error);
  }
};

export const fetchPlaylists = async (setPlaylists) => {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) throw new Error("User ID is missing");

    const response = await fetch(
      `http://localhost:5001/playlist?userId=${userId}`
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch playlists");
    }

    const data = await response.json();
    setPlaylists(data);
  } catch (error) {
    console.error("Error fetching playlists:", error.message);
  }
};

const Playlist = () => {
  const [playlists, setPlaylists] = useState([]);
  const [playlistName, setPlaylistName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const userId = localStorage.getItem("userId");

  const deletePlaylist = async (playlistId) => {
    try {
      if (!playlistId) {
        throw new Error("Playlist ID is required");
      }

      const response = await fetch(
        `http://localhost:5001/playlist/${playlistId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete playlist");
      }

      console.log("Playlist deleted successfully");
      setPlaylists(playlists.filter((playlist) => playlist.id !== playlistId));
      return true;
    } catch (error) {
      console.error("Error deleting playlist:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchPlaylists(setPlaylists);
  }, []);

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();

    if (!playlistName.trim()) {
      setError("Playlist name is required");
      return;
    }

    setError("");

    const newPlaylist = await createPlaylist(playlistName, description, userId);
    if (newPlaylist) {
      setPlaylistName("");
      setDescription("");
      fetchPlaylists(setPlaylists);
    }
  };

  // Get first letter of playlist name for thumbnail
  const getInitial = (name) => {
    return name.charAt(0).toUpperCase();
  };

  // Funky vibrant colors for playlist thumbnails
  const getPlaylistColor = (index) => {
    const colors = [
      "#FF427F", // Pink
      "#5D3FD3", // Purple
      "#00C2FF", // Blue
      "#00D98B", // Green
      "#FFB400", // Yellow
      "#FF5722", // Orange
      "#8BC34A", // Light Green
      "#9C27B0", // Deep Purple
      "#FF2E63", // Red
      "#00BCD4", // Cyan
    ];
    return colors[index % colors.length];
  };

  return (

    <div className="playlist-container">
      <div className="playlist-header">
        <div className="playlist-title-box">
          <div className="playlist-title">
            <h1 className="playlist-text">PLAYLIST</h1>
          </div>
        </div>
      </div>

      <div className="create-form-container">
        <h2 className="form-title">Create New Playlist</h2>
        <form onSubmit={handleCreatePlaylist}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="playlist-name">Playlist Name (Required):</label>
              <input
                id="playlist-name"
                type="text"
                className="form-control name-input"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder="Enter playlist name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="playlist-description">Description (Optional):</label>
              <input
                id="playlist-description"
                type="text"
                className="form-control description-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter playlist description"
              />
            </div>
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="create-button">
            CREATE PLAYLIST
          </button>
        </form>
      </div>

      <div className="playlists-container">
        <h2 className="playlists-title">My Playlists</h2>

        {playlists.length === 0 ? (
          <div className="empty-playlists">
            You don't have any playlists yet. Create one!
          </div>
        ) : (
          <div className="playlists-list">
            {playlists.map((playlist, index) => (
              <div key={playlist.id || index} className="playlist-item">
                <div
                  className="playlist-thumbnail"
                  style={{ backgroundColor: getPlaylistColor(index) }}
                >
                  {getInitial(playlist.ptitle)}
                </div>
                <div className="playlist-info">
                  <Link
                    to={`/playlistsongs?playlistid=${playlist.id}&playlistname=${playlist.ptitle}`}
                    className="playlist-name"
                  >
                    {playlist.ptitle}
                  </Link>
                  {playlist.pdescription && (
                    <p className="playlist-description">{playlist.pdescription}</p>
                  )}
                </div>
                <button
                  onClick={() => deletePlaylist(playlist.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

  );
};

export default Playlist;