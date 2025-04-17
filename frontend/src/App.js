import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";  // Import Home Component
import Login from "./Login";  // Import User Component
import AdminHome from "./AdminHome";//Import Admin Component
import RecommendedSongsPage from "./ReccomendedSongsPage";
import Signup from "./Signup"
import Delete from "./Delete"
import Airecpage from "./Airecpage";
import Liked from "./Liked";
import Friends from "./Friends";
import PlaylistSongs from "./PlaylistSongs";
import PlayPage from "./PlayPage"
import "./App.css"
const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/home" element={<Home />} />
                <Route path="/delete" element={<Delete />} />
                <Route path="/adminhome" element={<AdminHome />} />
                <Route path="/reccomendedsongspage" element={<RecommendedSongsPage/>}/>
                <Route path="/Ai" element ={<Airecpage/>}/>
                <Route path="/liked" element = {<Liked />}/>
                <Route path="/friends" element = {<Friends />}/>
                <Route path="/playlistsongs" element = {<PlaylistSongs />}/>
                <Route path="/playlists" element = {<PlayPage/>}/>
            </Routes>
        </Router>
    );
};

export default App;
