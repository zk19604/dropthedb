import React from "react";
import Player from "./player";
import User from "./User";
import Liked from "./Liked";
import Playlist from "./Playlist";
import Friends from "./Friends";
import Search from "./Search";
import Play from "./Play";
import Airec from "./Airec";
function Home() {
  const username = localStorage.getItem("username"); // ✅ Get username from localStorage
  const userid = localStorage.getItem("userId");

  return (
    <div>
      <Play />
      <User searchName={username} />  
      <Search />
      <Airec />
      <Friends />
      <Playlist/>
      <Player />
      <Liked uname={username} /> 
      <a href="/delete">Tired of us? Wanna delete?</a>
      <br />
      <a href={"/reccomendedsongspage"}>View Recommended Songs</a>
    </div>
  );
}

export default Home;