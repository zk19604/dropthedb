import React from "react";
import Player from "./player";
import User from "./User";
import Liked from "./Liked";
import Playlist from "./Playlist";
import Friends from "./Friends";

function Home() {
  const username = localStorage.getItem("username"); // ✅ Get username from localStorage
  const userid = localStorage.getItem("userId");

  return (
    <div>
      <User searchName={username} />  
      <a href="/AI">get ai recommendations</a>
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