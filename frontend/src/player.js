import React, { useEffect, useState } from "react";
const clientId = "2cbadd009ef8428285512f390151a730";
const clientSecret = "f8e498771c7f42f29fccfa9a72083555";
const redirectUri = "http://localhost:3000/home";

const scopes = [
  "user-read-private",
  "user-read-email",
  "streaming",
  "user-modify-playback-state",
  "user-read-playback-state",
].join(" "); //for spotify authentication url , requires spaces

const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(
  scopes
)}&redirect_uri=${encodeURIComponent(redirectUri)}`;

//redirecting url to login with spotify
const loginWithSpotify = () => {
  window.location.href = authUrl;
};

async function getAccessToken(code) {
  let accessToken = localStorage.getItem("access_token");
  let refreshToken = localStorage.getItem("refresh_token");
  let expiresAt = localStorage.getItem("expires_at");

  //Check if access token is still valid
  if (accessToken && new Date().getTime() < expiresAt) {
    return accessToken;
  }

  //Refresh token if it exists
  if (refreshToken) {
    console.log("Refreshing access token...");
    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", refreshToken);

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(clientId + ":" + clientSecret),
      },
      body: params,
    });

    const data = await response.json();

    if (data.access_token) {
      const expiresIn = data.expires_in;
      const newExpiresAt = new Date().getTime() + expiresIn * 1000;

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("expires_at", newExpiresAt);
      return data.access_token;
    }

    //If refresh fails, clear storage and force re-login
    console.error("Refresh token expired or invalid.");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("expires_at");
    return null;
  }

  //If no refresh token, get a new one using auth code
  console.log("Fetching new access token...");
  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("code", code);
  params.append("redirect_uri", redirectUri);

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(clientId + ":" + clientSecret),
    },
    body: params,
  });

  const data = await response.json();

  if (data.access_token) {
    const expiresIn = data.expires_in;
    const newExpiresAt = new Date().getTime() + expiresIn * 1000;

    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("expires_at", newExpiresAt);
    return data.access_token;
  }

  return null;
}

async function fetchProfile(token) {
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const profile = await response.json();
  console.log("Spotify Profile:", profile);
  return profile;
}
async function initializeSpotifyPlayer(token, setPlayer, setDeviceId) {
  //web player sdk
  const script = document.createElement("script");
  script.src = "https://sdk.scdn.co/spotify-player.js";
  script.async = true;
  document.body.appendChild(script);

  //initialise the spotify player
  window.onSpotifyWebPlaybackSDKReady = () => {
    const player = new window.Spotify.Player({
      name: "My Web Player",
      getOAuthToken: (cb) => cb(token),
      volume: 0.5,
    });

    //for play
    player.addListener("ready", ({ device_id }) => {
      console.log("Ready with Device ID", device_id);
      setDeviceId(device_id);
      localStorage.setItem("device_id", device_id);
    });

    player.addListener("not_ready", ({ device_id }) => {
      console.log("Device ID has gone offline", device_id);
    });

    //connect the player to spotify
    player.connect();
    setPlayer(player);
  };
}


//token for spotfiy access
//device id where the music will play
//track uri, spotify uri of the track to play
export async function playMusic(trackUri) {
  const deviceId = localStorage.getItem("device_id");
  const token = localStorage.getItem("access_token");
  console.log("Device ID:", deviceId);
  console.log("Track URI:", trackUri);
  console.log("Token:", token);

  if (!deviceId) {
    console.error("No device ID found in localStorage.");
    return;
  }

  if (!trackUri) {
    console.error("No track URI provided.");
    return;
  }

  try {
    // Start playing the music
    const response = await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: [trackUri] }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to play music: ${response.statusText}`);
    }

    // Fetch the current playing track details after successful playback
    const currentTrackResponse = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!currentTrackResponse.ok) {
      throw new Error("Failed to fetch current track");
    }

    const currentTrack = await currentTrackResponse.json();
    localStorage.setItem("currentTrack", JSON.stringify(currentTrack));
    console.log("Current Track:", currentTrack);
    
  } catch (error) {
    console.error("Error playing music:", error);
  }
}

export async function pauseMusic() {

  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch("https://api.spotify.com/v1/me/player/pause", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error("Failed to pause music");
    }
  } catch (error) {
    console.error("Error pausing music:", error);
  }
}


export const addToSongs = async (songName, artistNames, imageUrl, trackUri, album, genre, rating) => {
  try {
      const response = await fetch("http://localhost:5001/addsong", {
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
          throw new Error("Failed to add the song");
      }

      console.log("Song added successfully");

  } catch (error) {
      console.error("Error adding the song:", error);
  }
};

function Player() {
  const [profile, setProfile] = useState(null);
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [track, setTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    async function fetchToken() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      const accessToken = await getAccessToken(code);
      if (accessToken) {
        setToken(accessToken);
        localStorage.setItem("access_token", accessToken); // Store new token
        const userProfile = await fetchProfile(accessToken);
        setProfile(userProfile);
        initializeSpotifyPlayer(accessToken, setPlayer, setDeviceId);
      } else {
        console.error("Failed to get access token");
      }
      
    }
    
    
    fetchToken();
  }, []);

  // Toggle play/pause
  const togglePlayPause = async () => {
    if (!token || !track) return;
    if (isPlaying) {
      await pauseMusic();
    } else {
      await playMusic( track.uri);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div
    >
      <h1>Spotify Player</h1>

      {profile ? (
        <div>
          
          logged in
          </div>
      ) : (
        <button onClick={loginWithSpotify}>Login with Spotify</button>
      )}
    </div>
  );
}

export default Player;