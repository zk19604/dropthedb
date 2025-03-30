import { useState } from "react";

const API_KEY = "AIzaSyCLZN_0EzjgjXd6qrzW7wua4NyfxMcth1k"; 

function Airec() {
  const [mood, setMood] = useState("happy");
  const [language, setLanguage] = useState("English");
  const [songs, setSongs] = useState([]);
  const moods = ["Happy", "Sad", "Relaxed", "Energetic", "Focused", "Chill"];
  const languages = ["English", "Spanish", "French", "Hindi", "Urdu"];

  const handleGenerate = async () => {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Suggest 5 songs in ${language} that match a ${mood.toLowerCase()} mood. Provide a numbered list with song name and artist. only the name of song and artist, even remove the statement here are 5 songs`
              }]
            }]
          }),
        }
      );

      const data = await res.json();
      console.log("API Response:", data); // Debugging

      // ✅ Extract the response text correctly
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (!textResponse) {
        setSongs(["No recommendations found."]);
        return;
      }

    // ✅ Convert text response into an array of songs
    const recommendedSongs = textResponse
      .split("\n")
      .map(song => song.replace(/^\d+\.\s*/, "").trim()) // Remove numbering if present
      .filter(song => song); // Remove empty entries

    setSongs(recommendedSongs);
    console.log(songs);
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
              <li key={index}>{song}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Airec;
