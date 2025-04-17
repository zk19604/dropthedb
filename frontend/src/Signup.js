import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./components/signup.css";

const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Argentina",
  "Australia",
  "Austria",
  "Bangladesh",
  "Belgium",
  "Brazil",
  "Canada",
  "China",
  "Denmark",
  "Egypt",
  "France",
  "Germany",
  "India",
  "Indonesia",
  "Italy",
  "Japan",
  "Mexico",
  "Netherlands",
  "Pakistan",
  "Russia",
  "South Africa",
  "Spain",
  "Sweden",
  "United Kingdom",
  "United States",
];

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const navigate = useNavigate();

  // Password Validation
  const validatePassword = (pwd) => {
    const minLength = pwd.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecialChar = /[@$!%*?&]/.test(pwd);

    if (!minLength) return "Password must be at least 8 characters.";
    if (!hasUpperCase) return "Password must include an uppercase letter.";
    if (!hasLowerCase) return "Password must include a lowercase letter.";
    if (!hasNumber) return "Password must include a number.";
    if (!hasSpecialChar)
      return "Password must include a special character (@$!%*?&).";

    return ""; // No errors
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordError(validatePassword(newPassword));
  };

  // Handle Play functionality
  const handlePlay = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.play().catch((err) => console.log("Autoplay blocked:", err));
      setIsPlaying(true);
    }
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const rewindMusic = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.max(0, audio.currentTime - 10);
    }
  };

  const forwardMusic = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Play music as part of form submit (user interaction)
    handlePlay();

    try {
      const response = await fetch("http://localhost:5001/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, age, country }),
      });

      const data = await response.json();
      if (data.success) {
        navigate("/"); // Redirect to login page
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="signup">
      <div className="pixel-grid">
        <div className="pixel pixel-1"></div>
        <div className="pixel pixel-2"></div>
        <div className="pixel pixel-3"></div>
        <div className="pixel pixel-4"></div>
      </div>
      <div className="signup-container">
        <div className="window-bar">
          <div className="window-title">Run.exe - Music Player</div>
          <div className="window-controls">
            <div className="window-button">_</div>
            <div className="window-button">□</div>
            <div className="window-button">X</div>
          </div>
        </div>

        <div className="warning-box">
          <div className="warning-header">
            <div className="warning-icon">⚠️</div>
            <div className="warning-title">WARNING!</div>
          </div>
          <div className="warning-text">
            Prepare to be swept off your feet with retro music that will
            transport you back in time!
          </div>
          <button className="warning-button" onClick={handlePlay}>
            Let's GO
          </button>
        </div>
        <h2 className="signup-title">Sign Up</h2>
        <form className="signup-form" onSubmit={handleSubmit}>
          <input
            className="signup-input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="signup-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="signup-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
          {passwordError && <p className="error-text">{passwordError}</p>}
          <input
            className="signup-input"
            type="number"
            placeholder="Age"
            value={age}
            min="13"
            onChange={(e) => setAge(e.target.value)}
            required
          />
          <select
            className="signup-select"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          >
            <option value="">Select your country</option>
            {countries.map((c, index) => (
              <option key={index} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button className="signup-button" type="submit">
            Sign Up
          </button>
        </form>
        {error && <p className="error-text">{error}</p>}

        <div className="equalizer">
          <div className="equalizer-bar"></div>
          <div className="equalizer-bar"></div>
          <div className="equalizer-bar"></div>
          <div className="equalizer-bar"></div>
        </div>
        <div className="player-controls">
          <div className="player-button" onClick={rewindMusic}>
            ◀◀
          </div>
          <div className="player-button" onClick={toggleMusic}>
            {isPlaying ? "⏸" : "▶"}
          </div>
          <div className="player-button" onClick={forwardMusic}>
            ▶▶
          </div>
        </div>
        <audio ref={audioRef} loop>
          <source src="/music/signup.mp3" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>
  );
};

export default SignUp;
