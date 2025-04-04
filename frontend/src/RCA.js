
import React, { useState, useEffect } from 'react';
import { playMusic } from './player';

const RecommendedSongsByArtists = ({ userId, token, deviceId }) => { // Accept token and deviceId
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    console.log("User ID:", userId);
    console.log("Token:", token);   
    console.log("Device ID:", deviceId);
    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const response = await fetch(`http://localhost:5001/topartistsongs?id=${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch recommended songs');
                }
                const data = await response.json();
                console.log("Fetched songs:", data); // Debugging
                setSongs(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSongs();
    }, [userId]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h3>Recommended Songs</h3>
            {songs.length === 0 ? (
                <p>No recommendations available.</p>
            ) : (
                <ul>
                    {songs.map(song => (
                        <li key={song.songid}>
                            <strong>{song.stitle}</strong>
                            <button
                                onClick={() => {
                                    console.log("Playing song:", song.stitle);
                                    console.log("Spotify URI:", song.trackuri);
                                    console.log("Token:", token);
                                    console.log("Device ID:", deviceId);
                                    playMusic(token, deviceId, song.trackuri); // Pass token and deviceId
                                }}
                                style={{ marginLeft: "10px" }}
                            >
                                ▶️ Play
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default RecommendedSongsByArtists;
