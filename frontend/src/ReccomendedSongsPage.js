import React from "react";
import RecommendedSongs from "./ReccomendedSongs";
import Play from "./Play"; // Import Play component
function ReccomendedSongsPage() {
  const username = localStorage.getItem("username"); // ✅ Get username from localStorage
  const userid = localStorage.getItem("userId")
  const token = localStorage.getItem("access_token");  
  const deviceId = localStorage.getItem("deviceId");
  return (
    <div >
      <Play />
        <h1>Recommend Songs</h1>
        <RecommendedSongs userId = {userid} token={token} />
    </div>
  );
}

export default ReccomendedSongsPage;