import React, { useState } from "react";
import "./components/login.css";
import trialImage from "./components/images/trial.png";
import { useNavigate } from "react-router-dom";
import "./login.css";
// import listeningImg from "./assets/listening.png";
// import musicImg from "./assets/music.png";
// import playerImg from "./assets/music-player.png";
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
        body: JSON.stringify({ uemail: email, upassword: password }),
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
    <div className="pixel-login-container">
      <div className="pixel pixel-1"></div>
      <div className="pixel pixel-2"></div>
      <div className="pixel pixel-3"></div>
      <div className="pixel pixel-4"></div>
      <div className="pixel-login-card">
        <div className="window-bar">
        <div className="window-title">Run.exe - Music Player</div>
          <div className="window-controls">
            <div className="window-button">_</div>
            <div className="window-button">□</div>
            <div className="window-button">X</div>
          </div>
        </div>

        <div className="pixel-character-side">
          <div className="pixel-character">
            <img src={trialImage} alt="Trial" className="manimage" />
          </div>
        </div>

        <div className="pixel-login-side">
          <div className="login-form-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group-container">
                <div className="input-group">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="submit-btn">
                  Login
                </button>
              </div>
            </form>
            {error && <p className="error-message">{error}</p>}
            <div className="signup-section">
              <span> New Member?</span>
              <a href="/signup" className="signup-pill">
                Sign up
              </a>
            </div>
          </div>
        

          <div className="equalizer">
            <div className="equalizer-bar"></div>
            <div className="equalizer-bar"></div>
            <div className="equalizer-bar"></div>
            <div className="equalizer-bar"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
