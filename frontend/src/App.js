import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";  // Import Home Component
import Login from "./Login";  // Import User Component
import Signup from "./Signup"
import Delete from "./Delete"
const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/home" element={<Home />} />
                <Route path="/delete" element={<Delete />} />
            </Routes>
        </Router>
    );
};

export default App;
