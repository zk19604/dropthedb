import React, { useState, useEffect } from "react";


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
    return true; // Indicate success
  } catch (error) {
    console.error("Error adding song to playlist:", error);
    return false; // Indicate failure
  }
};

// Create Playlist Function (Outside the Component)
export const createPlaylist = async (ptitle, pdescription, userid) => {
  try {
    if (!ptitle || !userid) {
      throw new Error("Playlist title and User ID are required");
    }

    // If no description is provided, set it to an empty string or null
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

// Delete Playlist Function (Outside the Component)
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
    return true; // Indicate success
  } catch (error) {
    console.error("Error deleting playlist:", error);
    return false; // Indicate failure
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

// Playlist Component
const Playlist = () => {
  const [playlists, setPlaylists] = useState([]);
  const [playlistName, setPlaylistName] = useState("");
  const [description, setDescription] = useState(""); // Optional description
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
      return true; // Indicate success
    } catch (error) {
      console.error("Error deleting playlist:", error);
      return false; // Indicate failure
    }
  };

  useEffect(() => {
    fetchPlaylists(setPlaylists);
  }, []);

  // Handle creating a playlist
  const handleCreatePlaylist = async (e) => {
    e.preventDefault();

    if (!playlistName.trim()) {
      setError("Playlist name is required");
      return;
    }

    setError(""); // Clear error if name is provided

    const newPlaylist = await createPlaylist(playlistName, description, userId);
    if (newPlaylist) {
      setPlaylists([...playlists, newPlaylist]); // Update state with new playlist
      setPlaylistName(""); // Reset input fields
      setDescription("");
      fetchPlaylists(setPlaylists);
    }
  };

  // Handle deleting a playlist
  const handleDeletePlaylist = async (playlistId) => {
    await deletePlaylist(playlistId);
    setPlaylists(playlists.filter((playlist) => playlist.id !== playlistId));
    fetchPlaylists();
  };

  return (
    <div>
      <h1>My Playlists</h1>

      {/* Playlist Creation Form */}
      <form onSubmit={handleCreatePlaylist}>
        <div>
          <label>Playlist Name (Required): </label>
          <input
            type="text"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description (Optional): </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Create Playlist</button>
      </form>

      <ul>
        {playlists.map((playlist, index) => (
          <li key={playlist.id || index}>
            {" "}
            {/* Ensuring each list item has a unique key */}
            <a href={`/playlistsongs?playlistid=${playlist.id}&playlistname=${playlist.ptitle}`}>
              <strong>{playlist.ptitle}</strong>
            </a>{" "}
            {playlist.pdescription && ` - ${playlist.pdescription}`}

            <button
              onClick={() => handleDeletePlaylist(playlist.id)}
              style={{ marginLeft: "10px" }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Playlist;
