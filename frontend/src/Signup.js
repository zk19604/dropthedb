import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './signup.css';  // Make sure you import the CSS file for styling

const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Australia", "Austria",
  "Bangladesh", "Belgium", "Brazil", "Canada", "China", "Denmark", "Egypt", "France", "Germany",
  "India", "Indonesia", "Italy", "Japan", "Mexico", "Netherlands", "Pakistan", "Russia", "South Africa",
  "Spain", "Sweden", "United Kingdom", "United States",
];

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

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
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
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
          onChange={handlePasswordChange}
          required
        />
        {passwordError && <p className="error-message">{passwordError}</p>}
        <input
          type="number"
          placeholder="Age"
          value={age}
          min="13"
          onChange={(e) => setAge(e.target.value)}
          required
        />
        <select
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
        <button type="submit">Sign Up</button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default SignUp;
