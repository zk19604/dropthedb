import React, { useState, useEffect } from "react";
import { playMusic, pauseMusic } from "./player"; // Import functions

function Play() {
  const [track, setTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastTrackId, setLastTrackId] = useState(null); // Store last track ID to detect changes

  // Function to fetch song from localStorage
  const updateTrack = () => {
    const songDetailsString = localStorage.getItem("currentTrack");
    if (songDetailsString) {
      const songDetails = JSON.parse(songDetailsString);
      if (!songDetails.item) return;

      // Only update state if a new song is played
      if (songDetails.item.id !== lastTrackId) {
        setTrack(songDetails.item);
        setLastTrackId(songDetails.item.id);
        setIsPlaying(true);
      }
    }
  };

  // Load song on first render
  useEffect(() => {
    updateTrack(); // Load initially
    const interval = setInterval(updateTrack, 1000); // Poll every second
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  if (!track) return null; // Hide player if no track is found


  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        backgroundColor: "white",
        padding: "10px",
        boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <img
          src={track.album?.images?.[0]?.url || ""}
          alt="Album Art"
          style={{ width: "50px", height: "50px", borderRadius: "5px" }}
        />
        <div>
          <div>{track.name || "Unknown Title"}</div>
          <div style={{ fontSize: "14px", color: "gray" }}>
            {track.artists?.map((artist, index) => (
              <span key={index}>
                {artist.name}
                {index < track.artists.length - 1 ? ", " : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
     
    </div>
  );
}

export default Play;
