import React, { useEffect, useState } from "react";

const userId = localStorage.getItem("userId"); // Get userId from localStorage

const Friends = () => {
  const [friends, setFriends] = useState([]); // Stores user's friends
  const [users, setUsers] = useState([]); // Stores all users
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
        try {
          const [friendsRes, usersRes] = await Promise.all([
            fetch(`http://localhost:5001/friends?userId=${userId}`),
            fetch(`http://localhost:5001/allusers?userId=${userId}`)
          ]);
    
          if (!friendsRes.ok || !usersRes.ok) throw new Error("Failed to fetch data");
    
          const friendsData = await friendsRes.json();
          const usersData = await usersRes.json();
    
          setFriends(friendsData);
          setUsers(usersData);
        } catch (err) {
          setError("Error fetching data");
        } finally {
          setLoading(false); // ✅ Ensure loading is set to false after fetching
        }
      };
    
      fetchData();
    }, );

  // ✅ Function to Add a Friend
  const addFriend = async (friendId) => {
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

      // ✅ Update Friend List Immediately
      setFriends([...friends, { friendId, friendName: `User ${friendId}` }]);
    } catch (error) {
      alert("Error adding friend: " + error.message);
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
            <li key={friend.friendId}>{friend.friendName}</li>
          ))}
        </ul>
      )}

      <h2>All Users</h2>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.uname}{" "}
              {user.id !== userId && (
                <button onClick={() => addFriend(user.id)}>Add Friend</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Friends;
