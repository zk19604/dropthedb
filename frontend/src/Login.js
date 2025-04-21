import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch("http://localhost:5001/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uemail: email, upassword: password })
            });

            const data = await response.json();

            if (data.success) {
                console.log(data);
                localStorage.setItem("username", data.user.uname);
                localStorage.setItem("userId", data.user.id);
                localStorage.setItem("isAdmin", data.user.u_type);

                if (data.user.u_type === "a") {
                    console.log("Navigating to Admin Home...");
                    navigate("/adminhome");
                } else {
                    console.log("Navigating to Home...");
                    navigate("/home");
                }
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Server error. Please try again.");
        }
    };

    return (
        <>
            <div className="login-body">

                {/* Floating pixels */}
                <div className="pixel pixel-1"></div>
                <div className="pixel pixel-2"></div>
                <div className="pixel pixel-3"></div>
                <div className="pixel pixel-4"></div>

                <div className="login-container">
                    {/* Window Bar */}
                    <div className="window-bar">
                        <div className="window-title">Run.exe - Music Player</div>
                        <div className="window-controls">
                            <div className="window-button">_</div>
                            <div className="window-button">□</div>
                            <div className="window-button">X</div>
                        </div>
                    </div>

                    {/* Warning Box */}
                    <div className="warning-box">
                        <div className="warning-header">
                            <div className="warning-icon">⚠️</div>
                            <div className="warning-title">WARNING!</div>
                        </div>
                        <div className="warning-text">
                            Prepare to be swept off your feet with retro music that will transport you back in time!
                        </div>
                        <button className="warning-button">Let's GO</button>
                    </div>

                    <h2 className="login-title">Music Player</h2>

                    {/* Pixel Avatar */}
                    <div className="pixel-avatar"></div>

                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit">Login</button>
                    </form>

                    {error && <p className="error-message">{error}</p>}

                    {/* Player Controls */}
                    <div className="player-controls">
                        <div className="player-button">◀◀</div>
                        <div className="player-button">▶</div>
                        <div className="player-button">▶▶</div>
                    </div>

                    <div className="signup-section">
                        <p>New member?</p>
                        <a href="/signup" className="signup-link">Sign up</a>
                    </div>

                    {/* Social Icons */}
                    <div className="social-icons">
                        <div className="social-icon">♫</div>
                        <div className="social-icon">♥</div>
                    </div>

                    {/* Equalizer animation */}
                    <div className="equalizer">
                        <div className="equalizer-bar"></div>
                        <div className="equalizer-bar"></div>
                        <div className="equalizer-bar"></div>
                        <div className="equalizer-bar"></div>
                    </div>
                </div>
            </div>
        </>
    );

};

export default Login;