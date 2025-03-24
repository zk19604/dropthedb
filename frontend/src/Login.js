import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
                method: "POST", // ✅ Use POST for security
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uemail: email, upassword: password }) // ✅ Send data in body
            });

            const data = await response.json();

            if (data.success) {
                console.log(data);
                localStorage.setItem("username", data.user.uname); // Store user info
                localStorage.setItem("userId", data.user.id); // Store user ID if needed
                console.log("Navigating to Home...");
                navigate("/home"); // ✅ Redirect to home page
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Server error. Please try again.");
        }
    };

    return (
        <div>
            <h2>Login</h2>
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
            {error && <p style={{ color: "red" }}>{error}</p>}
        
            <p>New member?</p>
            <a href="/signup">Sign up</a>
        
        </div>
        
    );
};

export default Login;
