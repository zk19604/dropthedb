import React, { useState, useEffect } from "react";
import { playMusic } from "./player";
import { initializeSpotifyPlayer } from "./player";
import { fetchPlaylists } from "./Playlist";
import { addsongstoplaylist } from "./Playlist";
import Play from "./Play";
export const handlelike = async (
  songName,
  artistNames,
  imageUrl,
  trackUri,
  album,
  genre,
  rating
) => {
  try {
    const response = await fetch("http://localhost:5001/likes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stitle: songName,
        trackUri: trackUri,
        authornames: artistNames, // Array of artists
        genrename: genre,
        albumname: album,
        albumname: album,
        rating: rating,
        simage: imageUrl,
        userId: localStorage.getItem("userId"),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to like the song");
    }

    console.log("Song liked successfully");
  } catch (error) {
    console.error("Error liking the song:", error);
  }
};

const Liked = () => {
  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const uname = localStorage.getItem("username"); 
  const userid = localStorage.getItem("userId");
  const token = localStorage.getItem("access_token");
  const [deviceId, setDeviceId] = useState(null);
  const [player, setPlayer] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
 
  const fetchLikedSongs = async () => {
    try {
      initializeSpotifyPlayer(token, setPlayer, setDeviceId);
      const response = await fetch(
        `http://localhost:5001/likedsongs?name=${uname}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch liked songs");
      }
      const data = await response.json();
      console.log("liked songs:", data);
      setLikedSongs(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uname) {
      fetchLikedSongs();
      fetchPlaylists(setPlaylists);
    }
  }, [uname]);
  if (!uname) {
    return <p>Error: Username not found in localStorage.</p>;
  }
  const removeLike = async (songsid) => {
    try {
      const response = await fetch(`http://localhost:5001/taste`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid, songsid }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove like");
      }

      await fetchLikedSongs();
    } catch (error) {
      console.error("Error removing like:", error);
      setError(error.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <Play />
      <h1>Liked Songs</h1>
      {likedSongs.length === 0 ? (
        <p>No liked songs for this user.</p>
      ) : (
        <ul>
          {likedSongs.map((song) => (
            <li key={song.songsid}>
              <strong>{song.stitle}</strong>
              <br />
              <span>
                by{" "}
                {song.artist_name && song.artist_name.length > 0
                  ? song.artist_name
                  : "Unknown Artist"}
              </span>
              <br />
              <span>
                Album: {song.album_name ? song.album_name : "Unknown Author"}
              <br/>
                Genre:  {song.genre ? song.genre : "Unknown Genre"}
              </span>
              <button
                onClick={() => {
                  playMusic(token, deviceId, song.trackuri);
                  console.log("Playing song:", song.trackuri);
                  console.log("Device ID:", deviceId);
                  console.log("Token:", token);
                }}
                style={{ marginLeft: "10px" }}
              >
                ▶️ Play
              </button>
              <button
                onClick={() => removeLike(song.songsid)}
                style={{ marginLeft: "10px" }}
              >
                Remove Like
              </button>
              <select
                value={selectedPlaylist}
                onChange={(e) => {
                  addsongstoplaylist(e.target.value, song.songsid);
                  console.log("Selected playlist:", e.target.value);
                  console.log("Selected song ID:", song.songsid);
                }}
                required
              >
                <option value="">Add to playlist</option>
                {playlists.map((c, index) => (
                  <option key={index} value={c.id}>
                    {c.ptitle}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Liked;
