import React, { useEffect, useState } from "react";
import { playMusic } from "./player";
import { initializeSpotifyPlayer } from "./player";
import "./Friends.css"; // if using styles

const userId = localStorage.getItem("userId");

export const getFriendsSongs = async () => {
  try {
    const songResponse = await fetch(
      `http://localhost:5001/friendssongs?userId=${userId}`
    );
    if (!songResponse.ok)
      throw new Error(`Failed to fetch songs for user ${userId}`);

    const songs = await songResponse.json();
    console.log("Fetched songs:", songs);

    return songs;
  } catch (error) {
    console.error("Error fetching friends' songs:", error);
    return [];
  }
};

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [users, setUsers] = useState([]);
  const [friendSongs, setFriendSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("access_token");
  const [deviceId, setDeviceId] = useState(null);
  const [player, setPlayer] = useState(null);

  const fetchData = async () => {
    try {
      initializeSpotifyPlayer(token, setPlayer, setDeviceId);
      const [friendsRes, usersRes, songsRes] = await Promise.all([
        fetch(`http://localhost:5001/friends?userId=${userId}`),
        fetch(`http://localhost:5001/allusers?userId=${userId}`),
        getFriendsSongs(),
      ]);

      if (!friendsRes.ok || !usersRes.ok)
        throw new Error("Failed to fetch data");

      const friendsData = await friendsRes.json();
      const usersData = await usersRes.json();

      setFriends(friendsData);
      setUsers(usersData);
      setFriendSongs(songsRes);
    } catch (err) {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const addFriend = async (friendId, friendName) => {
    try {
      const response = await fetch("http://localhost:5001/addfriends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user1: userId, user2: friendId }),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Error adding friend");

      setFriends([...friends, { friendId, friendName }]);
    } catch (error) {
      alert("Error adding friend: " + error.message);
    }
  };

  const nonFriendUsers = users.filter(
    (user) =>
      !friends.some((friend) => friend.friendId === user.id) &&
      user.id !== userId
  );

  const removeFriend = async (friendId) => {
    try {
      const response = await fetch("http://localhost:5001/removefriend", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, friendId }),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Error removing friend");

      // ✅ Update the friends list immediately
      setFriends(friends.filter((friend) => friend.friendId !== friendId));
    } catch (error) {
      alert("Error removing friend: " + error.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="friends-container">
      <div className="friends-section">
        <h2 className="friends-header">Friends List</h2>
        {friends.length === 0 ? (
          <p>No friends found.</p>
        ) : (
          <ul>
            {friends.map((friend) => (
              <li key={friend.friendId}>
                <span className="friend-name">{friend.friendName}</span>
                <button onClick={() => removeFriend(friend.friendId)}>
                  Remove Friend
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="friends-section">
        <h2 className="friends-header">What Your Friends Are Listening To</h2>
        {friendSongs.length === 0 ? (
          <p>Your friends haven't liked any songs yet.</p>
        ) : (
          <ul>
            {friendSongs.map((song) => (
              <li key={song.songsid}>
                <strong>{song.songtitle}</strong>
                <div className="song-info">
                  by {song.artist_name?.length > 0 ? song.artist_name : "Unknown Artist"}
                </div>
                <div className="song-info">
                  Album: {song.album_name || "Unknown Genre"}
                </div>
                <div className="song-info">
                  Friend ID: {song.friend_id}
                </div>
                <button
                  onClick={() => {
                    playMusic(token, deviceId, song.track_uri);
                    console.log("Playing song friends:", song.track_uri);
                    console.log("Device ID:", deviceId);
                    console.log("Token:", token);
                  }}
                >
                  ▶️ Play
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="friends-section">
        <h2 className="friends-header">All Users (Not Yet Friends)</h2>
        {nonFriendUsers.length === 0 ? (
          <p>All users are already your friends.</p>
        ) : (
          <ul>
            {nonFriendUsers.map((user) => (
              <li key={user.id}>
                <span className="friend-name">{user.uname}</span>
                <button onClick={() => addFriend(user.id, user.uname)}>
                  Add Friend
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Friends;
