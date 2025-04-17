import React from "react";
import Player from "./player";
import User from "./User";
import Play from "./Play";
function Home() {
  const username = localStorage.getItem("username"); // ✅ Get username from localStorage
  const userid = localStorage.getItem("userId");

  return (
    <div>
      <Play />
      <User searchName={username} /> 
      <a href={"/Ai"}>AI Recommendations</a>
      <br/>
      <a href={"/reccomendedsongspage"}>View Recommended Songs</a>
      <br/>
      <a href = "/friends" >Friends </a>
      <br />
      <a href={"/liked"}>Liked Songs</a>
      <br/>
      <a href={"/playlists"}>Playlists</a>
      <Player />
      <a href="/delete">Tired of us? Wanna delete?</a>
      <br />
    </div>
  );
}

export default Home;