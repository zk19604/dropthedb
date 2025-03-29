import React, { useEffect, useState } from "react";
import { handlelike } from "./Liked";
import { handleplaylist } from "./Playlist"
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


// async function fetchProfile(token) {
//   const result = await fetch("https://api.spotify.com/v1/me", {
//     method: "GET",
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   return await result.json();
// }
async function fetchProfile(token) {
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const profile = await response.json();
  console.log('Spotify Profile:', profile);
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
async function playMusic(token, deviceId, trackUri) {
  await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uris: [trackUri] }),
  });
}


async function pauseMusic(token) {
  await fetch("https://api.spotify.com/v1/me/player/pause", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
}


async function searchSongs(token, query) {
  if (!query) return [];


  const result = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const data = await result.json();
  console.log(data);
  return data.tracks.items || [];
}

function Player() {
  const [profile, setProfile] = useState(null);
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {

    async function fetchToken() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      const accessToken = await getAccessToken(code);
      if (accessToken) {
        setToken(accessToken);
        const userProfile = await fetchProfile(token);
        setProfile(userProfile);
        initializeSpotifyPlayer(token, setPlayer, setDeviceId);
      } else {
        console.error("Failed to get access token");
      }
    }
    fetchToken();
  }, [token]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!token) return;
    const results = await searchSongs(token, query);
    setSearchResults(results);
  };
  return (
    <div>
      <h1>Spotify Player</h1>
      {profile ? (
        <div>
          {deviceId ? (
            <div>
              <button onClick={() => pauseMusic(token)}>⏸ Pause</button>
            </div>
          ) : (
            <p>Loading player...</p>
          )}

          <form onSubmit={handleSearch}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for songs..."
            />
            <button type="submit">Search</button>
          </form>

          {searchResults.length > 0 && (
            <div>
              <h3>Search Results:</h3>
              {searchResults.map((track) => (
                <div
                  key={track.id}
                  style={{
                    margin: "10px 0",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={track.album.images[0]?.url}
                    alt="Album"
                    width={50}
                  />
                  <div style={{ marginLeft: "10px" }}>
                    <strong>{track.name}</strong> -{" "}
                    {track.artists.map((artist) => artist.name).join(", ")}
                  </div>
                  <button
                    onClick={() => playMusic(token, deviceId, track.uri)}
                    style={{ marginLeft: "10px" }}
                  >
                    ▶️ Play
                  </button>
                  <button
                    onClick={() =>
                      handlelike(
                        track.name,
                        track.artists.map((artist) => artist.name), // ✅ Pass an array of artist names
                        track.album.images[0]?.url, // ✅ Pass album image URL
                        track.uri,
                        track.album.name, // ✅ Pass album name correctly
                        track.artists[0]?.genres ? track.artists[0].genres[0] : "Unknown", // ✅ Handle missing genre
                        track.popularity // ✅ Using Spotify's popularity rating as a rating
                      )
                    }
                    style={{ marginLeft: "10px" }}
                  >
                    Like
                  </button>


                  <button
                    onClick={() => handleplaylist(track.name, track.artists.map(artist => artist.name).join(", "), track.album.images[0]?.url, track.uri)}
                    style={{ marginLeft: "10px" }}
                  >
                    Add to playlist
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <button onClick={loginWithSpotify}>Login with Spotify</button>
      )}
    </div>
  );
}

export default Player;
