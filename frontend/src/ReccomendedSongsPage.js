import React from "react";
import ReccomendedSongs from "./ReccomendedSongs";

function ReccomendedSongsPage() {
  const username = localStorage.getItem("username"); // ✅ Get username from localStorage
  const userid = localStorage.getItem("userId")
  return (
    <div >
        <h1>Recommend Songs</h1>
      <ReccomendedSongs userId={userid} />  
    </div>
  );
}

export default ReccomendedSongsPage;