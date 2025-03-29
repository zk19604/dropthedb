import React, { useState, useEffect } from 'react';

const Liked = ({ uname }) => {
    const [likedSongs, setLikedSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLikedSongs = async () => {
        try {
            const response = await fetch(`http://localhost:5001/likedsongs?name=${uname}`);
            if (!response.ok) {
                throw new Error("Failed to fetch liked songs");
            }
            const data = await response.json();
            console.log("Liked songs:", data);
            setLikedSongs(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLikedSongs();
    }, [uname]); // ✅ Runs only when `uname` changes

    const removeLike = async (songId) => {
        try {
            const response = await fetch(`http://localhost:5001/removelike?songid=${songId}`, {
                method: "DELETE",
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
                            <span>
                                by {Array.isArray(song.artist_name) ? song.artist_name.join(", ") : song.artist_name || "Unknown Artist"}
                            </span>
                            <br />
                            <span>Genre: {song.genre || "Unknown Genre"}</span>
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
