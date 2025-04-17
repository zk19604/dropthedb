import { useState } from "react";
import { playMusic } from "./player";
import { initializeSpotifyPlayer } from "./player";
const API_KEY = "AIzaSyCLZN_0EzjgjXd6qrzW7wua4NyfxMcth1k";

async function fetchSongsByName(name) {
  try {
    const response = await fetch(
      `http://localhost:5001/searchairec?name=${encodeURIComponent(name)}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch songs");
    }

    const data = await response.json();
    if (data.songs) {
      console.log("Fetched songs:", data.songs);
      return data.songs;
      // Debugging
    } else {
      throw new Error("No songs found.");
    }
  } catch (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
}

function Airec() {
  const [mood, setMood] = useState("happy");
  const [language, setLanguage] = useState("English");
  const [songs, setSongs] = useState([]);
  const moods = ["Happy", "Sad", "Relaxed", "Energetic", "Focused", "Chill"];
  const languages = ["English", "Spanish", "French", "Hindi", "Urdu"];
  const [deviceId, setDeviceId] = useState(null);
  const [player, setPlayer] = useState(null);
  const token = localStorage.getItem("access_token");
  
  const handleGenerate = async () => {
    try {
      initializeSpotifyPlayer(token, setPlayer, setDeviceId);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Suggest 5 songs in ${language} that match a ${mood.toLowerCase()} mood. Provide a numbered list with song name and artist. only the name of song and artist, even remove the statement here are 5 songs, and also make sure those songs are on spotify`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await res.json();
      console.log("API Response:", data); // Debugging

      const textResponse =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (!textResponse) {
        setSongs(["No recommendations found."]);
        return;
      }

      const recommendedSongs = textResponse
        .split("\n")
        .map((song) => song.replace(/^\d+\.\s*/, "").trim()) // Remove numbering if present
        .filter((song) => song); // Remove empty entries

      setSongs(recommendedSongs); // State update
      console.log("Recommended Songs:", recommendedSongs); // Log recommended songs

      // Optionally fetch song details from Spotify
      const songDetails = await Promise.all(
        recommendedSongs.map(async (song) => {
          const songData = await fetchSongsByName(song);
          console.log("Song Data:", songData); // Debugging
          if (songData.length > 0) {
            // Return the full song data instead of just the first song
            return songData[0];
          }
        })
      );

      setSongs(songDetails); // Update state with detailed songs
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setSongs(["Error: Unable to fetch recommendations."]);
    }
  };

  return (
    <div>
      <h2>🎵 Mood-Based Song Recommender</h2>
      <label>Select Mood:</label>
      <select value={mood} onChange={(e) => setMood(e.target.value)}>
        {moods.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <label>Select Language:</label>
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>

      <button onClick={handleGenerate}>Get Songs</button>
      {songs.length > 0 && (
        <div>
          <h3>Recommended Songs:</h3>
          <ul>
            {songs.map((song, index) => (
              <li key={index}>
                <strong>{song.name}</strong> by {song.artist} <br />
                <em>Album: {song.album}</em> <br />
                <p>{song.uri}</p>
                <button
                  onClick={() => {
                    playMusic(token, deviceId, song.uri); 
                  }}
                  style={{ marginLeft: "10px" }}
                >
                  ▶️ Play
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Airec;
