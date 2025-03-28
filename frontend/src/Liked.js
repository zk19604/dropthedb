import React, { useState, useEffect } from "react";

export const handlelike = async (songName, artistNames, imageUrl, trackUri, album, genre, rating) => {
    try {
        const response = await fetch("http://localhost:5001/likes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                stitle: songName,
                trackUri: trackUri,
                authornames: artistNames, // Array of artists
                genrename: genre,
                albumname: album,
                rating: rating,
                simage: imageUrl,
                userId: localStorage.getItem("userId"),
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to like the song");
        }

        console.log("Song liked successfully");

    } catch (error) {
        console.error("Error liking the song:", error);
    }
};


const Liked = () => {
    const [likedSongs, setLikedSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const uname = localStorage.getItem("username"); // ✅ Get username inside component
    const userid = localStorage.getItem("userId");

    // ✅ Define fetchLikedSongs inside Liked so we can update state
    const fetchLikedSongs = async () => {
        try {
            const response = await fetch(`http://localhost:5001/likedsongs?name=${uname}`);
            if (!response.ok) {
                throw new Error("Failed to fetch liked songs");
            }
            const data = await response.json();
            setLikedSongs(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLikedSongs();
    }, [uname]); // ✅ Only fetch when `uname` changes

    const removeLike = async (songsid) => {
        try {
            const response = await fetch(`http://localhost:5001/taste`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userid, songsid }),
            });

            if (!response.ok) {
                throw new Error("Failed to remove like");
            }

            // ✅ Refresh liked songs after removing
            await fetchLikedSongs();
        } catch (error) {
            console.error("Error removing like:", error);
            setError(error.message);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
        <h1>Liked Songs</h1>
        {likedSongs.length === 0 ? (
            <p>No liked songs for this user.</p>
        ) : (
            <ul>
                {likedSongs.map((song) => (
                   <li key={song.songsid}>
                   <strong>{song.stitle}</strong>  
                   <br />
                   <span>by {song.artists && song.artists.length > 0 ? song.artists : "Unknown Artist"}</span>  
                   <br />
                   <span>Genre: {song.genre ? song.genre : "Unknown Genre"}</span>
               
               
                        <button onClick={() => removeLike(song.songsid)} style={{ marginLeft: "10px" }}>
                            Remove Like
                        </button>
                    </li>
                ))}
            </ul>
        )}
    </div>
    
    );
};

export default Liked;
