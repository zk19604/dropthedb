import React, { useState, useEffect } from "react";

const backendPort = 5001;

function User({ searchName }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false); // Track loading state
  const [error, setError] = useState(null); // Track error state

  useEffect(() => {
    if (!searchName) return; // Don't fetch if no name is provided

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:${backendPort}/users?name=${searchName}`); // ✅ Fixed URL

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchName]); // Runs when searchName changes

  return (
    <div>
      <h2>Users List</h2>

      {loading && <p>Loading users...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {users.length === 0 && !loading && !error && <p>No users found</p>}

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <strong>ID:</strong> {user.id} <br />
            <strong>Name:</strong> {user.uname} <br />
            <strong>Email:</strong> {user.uemail} <br />
            <strong>Age:</strong> {user.uage} <br />
            <strong>Country:</strong> {user.ucountry} <br />
            <strong>Created At:</strong> {user.u_created} <br />
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default User;
