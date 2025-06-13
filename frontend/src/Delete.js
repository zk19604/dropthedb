import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Delete.css"; // Make sure this is added

const Delete = () => {
    const [error, setError] = useState(null);
    const [message, setMessage] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const userId = localStorage.getItem("userId");

    const navigate = useNavigate();

    const handleDelete = async () => {
        if (!userId) {
            setError("User ID is required to delete the account.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5001/users", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: [userId] }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Your account has been deleted successfully.");
                navigate("/");
            } else {
                setError(data.message);
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            setError("Server error. Please try again.");
        }
    };

    return (
        <div className="delete-container">
            <p>Tired of us? Wanna delete your account?</p>
            <button className="delete-btn" onClick={() => setShowConfirm(true)}>
                Delete My Account
            </button>

            {showConfirm && (
                <div className="confirm-box">
                    <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                    <button onClick={handleDelete}>yesss (then get lost)</button>
                    <button onClick={() => setShowConfirm(false)}>nahhh</button>
                </div>
            )}

            {message && <p className="message-success">{message}</p>}
            {error && <p className="message-error">{error}</p>}
        </div>
    );
};

export default Delete;
