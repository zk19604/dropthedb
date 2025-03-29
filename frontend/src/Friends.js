import React, { useEffect, useState } from "react";

const userId = localStorage.getItem("userId"); // Get userId from localStorage

// ✅ Function to Get Friends' Songs
export const getFriendsSongs = async () => {
  try {
    const songResponse = await fetch(`http://localhost:5001/friendssongs?userId=${userId}`);
    if (!songResponse.ok) throw new Error(`Failed to fetch songs for user ${userId}`);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [friendsRes, usersRes, songsRes] = await Promise.all([
          fetch(`http://localhost:5001/friends?userId=${userId}`),
          fetch(`http://localhost:5001/allusers?userId=${userId}`),
          getFriendsSongs(),
        ]);

        if (!friendsRes.ok || !usersRes.ok) throw new Error("Failed to fetch data");

        const friendsData = await friendsRes.json();
        const usersData = await usersRes.json();

        setFriends(friendsData);
        setUsers(usersData);
        setFriendSongs(songsRes);
      } catch (err) {
        setError("Error fetching data");
      } finally {
        setLoading(false); }
    };

    fetchData();
  }, []);


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
      if (!response.ok) throw new Error(result.message || "Error adding friend");


      setFriends([...friends, { friendId, friendName }]);
    } catch (error) {
      alert("Error adding friend: " + error.message);
    }
  };

  const nonFriendUsers = users.filter(
    (user) => !friends.some((friend) => friend.friendId === user.id) && user.id !== userId
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
      if (!response.ok) throw new Error(result.message || "Error removing friend");

      // ✅ Update the friends list immediately
      setFriends(friends.filter((friend) => friend.friendId !== friendId));
    } catch (error) {
      alert("Error removing friend: " + error.message);
    }
  };


  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Friends List</h2>
      {friends.length === 0 ? (
        <p>No friends found.</p>
      ) : (
        <ul>
          {friends.map((friend) => (
            <li key={friend.friendId}>{friend.friendName}
            <button onClick={() => removeFriend(friend.friendId)}>Remove Friend</button>
            </li>

          ))}
        </ul>
      )}

      <h2>What Your Friends Are Listening To</h2>
      {friendSongs.length === 0 ? (
        <p>Your friends haven't liked any songs yet.</p>
      ) : (
        <ul>
          {friendSongs.map((song) => (
            <li key={song.songsid}>
            <strong>{song.songtitle}</strong>  
            <br />
            <span>by {song.artist_name && song.artist_name.length > 0 ? song.artist_name : "Unknown Artist"}</span>  
            <br />
            <span>Album: {song.album_name? song.album_name : "Unknown Genre"}</span>
            <br/>
              <span>friend : {song.friend_id}</span>
             </li>
          ))}
        </ul>
      )}

      <h2>All Users (Not Yet Friends)</h2>
      {nonFriendUsers.length === 0 ? (
        <p>All users are already your friends.</p>
      ) : (
        <ul>
          {nonFriendUsers.map((user) => (
            <li key={user.id}>
              {user.uname}{" "}
              <button onClick={() => addFriend(user.id, user.uname)}>Add Friend</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Friends;
