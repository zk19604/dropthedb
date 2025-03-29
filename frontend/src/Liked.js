// liked.js
import React, { useState, useEffect } from 'react';

const Liked = ({ uname }) => {
    const [likedSongs, setLikedSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch liked songs when the component mounts
        const fetchLikedSongs = async () => {
            try {
                const response = await fetch(`http://localhost:5001/likedsongs?name=${uname}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch liked songs');
                }
                const data = await response.json();
                setLikedSongs(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLikedSongs();
    }, [uname]); // Only re-fetch if userId changes

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div>
            <h1>Liked Songs</h1>
            {likedSongs.length === 0 ? (
                <p>No liked songs for this user.</p>
            ) : (
                <ul>
                    {likedSongs.map((song) => (
                        <li key={song.songsid}>
                            <strong>{song.stitle}</strong> by {song.artist}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Liked;
