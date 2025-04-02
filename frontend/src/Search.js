// Search.js
import React, { useState, useEffect } from "react";
import { handlelike } from "./Liked";
import { playMusic } from "./player";
 import { addToSongs } from "./player"; 
function Search() {
  const [query, setQuery] = useState("");
  const [token, setToken] = useState("");
  const [results, setResults] = useState([]);

  // Fetch the token from the backend when the component mounts
  useEffect(() => {
    const fetchToken = async () => {
      try {
     
        const response = await fetch("http://localhost:5001/api/spotify-token-search"); // Adjust the URL as per your backend
        const data = await response.json();
        if (data.access_token) {
          setToken(data.access_token);
        console.log("Token fetched successfully:", token);
        } else {
          console.error("Token not found.");
        }
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };

    fetchToken();
  }, []); // Run this effect once on mount

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!token) return;

    const results = await searchSongs(token, query);
    setResults(results); // Store the results locally within this component
  };

  const searchSongs = async (token, query) => {
    if (!query) return [];

    const result = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        query
      )}&type=track&limit=10`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await result.json();

    if (!data.tracks || !data.tracks.items) {
      console.log("No tracks found.");
      return [];
    }

    return data.tracks.items;
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for songs..."
        />
        <button type="submit">Search</button>
      </form>

      {results.length > 0 && (
        <div>
          <h3>Search Results:</h3>
          <ul>
            {results.map((song) => (
              <li key={song.id}>
                <img
                  src={song.album.images[0].url}
                  alt={song.name}
                  width={50}
                  height={50}
                />
                <div>
                  {song.name} by{" "}
                  {song.artists.map((artist) => artist.name).join(", ")}
                  <button 
                  onClick={() => {
                      playMusic(song.uri); // ✅ First function
                      addToSongs(
                        song.name,
                        (song.artists ||[]).map((artist) => artist.name), // ✅ Pass an array of artist names
                        song.album.images[0]?.url, // ✅ Pass album image URL
                        song.uri,
                        song.album.name, // ✅ Pass album name correctly
                       song.artists[0]?.genres
                          ? song.artists[0].genres[0]
                          : "Unknown", // ✅ Handle missing genre
                        song.popularity
                      );
                    }}
                    style={{ marginLeft: "10px" }}
                  >
                    ▶️ Play
                  </button>
                <button
                  onClick={() =>
                    handlelike(
                      song.name,
                      song.artists.map((artist) => artist.name), // ✅ Pass an array of artist names
                      song.album.images[0]?.url, // ✅ Pass album image URL
                      song.uri,
                      song.album.name, // ✅ Pass album name correctly
                      song.artists[0]?.genres
                        ? song.artists[0].genres[0]
                        : "Unknown", // ✅ Handle missing genre
                      song.popularity // ✅ Using Spotify's popularity rating as a rating
                    )
                  }
                  style={{ marginLeft: "10px" }}
                >
                  Like
                </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {results.length === 0 && query && <p>No songs found for your search.</p>}
    </div>
  );
}

export default Search;


