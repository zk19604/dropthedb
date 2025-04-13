import React, { useState, useEffect } from "react";
import { playMusic } from "./player"; // Import playMusic function
import { initializeSpotifyPlayer } from "./player"; // Import Spotify player initialization
const userId = localStorage.getItem("userId"); // Get userId from localStorage

// Function to fetch songs for a specific playlist
const fetchPlaylistSongs = async (playlistid, setSongs) => {
  try {
    if (!playlistid) {
      throw new Error("Playlist ID is required");
    }

    const response = await fetch(
      `http://localhost:5001/playlistsongs?playlistid=${playlistid}`
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch playlist songs");
    }

    const data = await response.json();
    setSongs(data); // Update the songs state with fetched data
  } catch (error) {
    console.error("Error fetching playlist songs:", error.message);
  }
};

// PlaylistSongs Component to show songs of the selected playlist
const PlaylistSongs = () => {
  const [songs, setSongs] = useState([]);
  const queryParams = new URLSearchParams(window.location.search);
  const playlistid = queryParams.get("playlistid"); // Get playlistid from query params
  const playlistname = queryParams.get("playlistname"); // Get playlistname from query params

  const token = localStorage.getItem("access_token");
  const [deviceId, setDeviceId] = useState(null);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    if (playlistid) {
      initializeSpotifyPlayer(token, setPlayer, setDeviceId);
      fetchPlaylistSongs(playlistid, setSongs); // Fetch songs when playlistid changes
    }
  }, [playlistid]);

  return (
    <div>
      <h1>{playlistname}</h1>

      {/* Display the songs of the selected playlist */}
      <ul>
        {songs.length === 0 ? (
          <p>No songs in this playlist.</p>
        ) : (
          songs.map((song, index) => (
            <li key={song.songid || index}>
              <strong>{song.songtitle}</strong>
              <button
                onClick={() => {
                  playMusic(token, deviceId, song.trackuri);
                  console.log("Playing song friends:", song.trackuri);
                  console.log("Device ID:", deviceId);
                  console.log("Token:", token);
                }}
                style={{ marginLeft: "10px" }}
              >
                ▶️ Play
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default PlaylistSongs;
