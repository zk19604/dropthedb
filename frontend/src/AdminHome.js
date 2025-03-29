import React from "react";
import User from "./User";

function AdminHome() {
  const username = localStorage.getItem("username"); // ✅ Get username from localStorage
  const userid = localStorage.getItem("userId")
  return (
    <div >
        <h1>Admin</h1>
      <User searchName={username} />  
    </div>
  );
}

export default AdminHome;