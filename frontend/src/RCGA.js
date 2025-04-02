import React, { useState, useEffect } from 'react';
import { playMusic } from './player';

const RecommendedSongsByArtistsAndGenres = ({ userId, token, deviceId }) => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const response = await fetch(`http://localhost:5001/topartistandgenresongs?id=${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch recommended songs');
                }
                const data = await response.json();
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
            <h3>Recommended Songs (Artists & Genres)</h3>
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
                                    playMusic(token, deviceId, song.trackuri);
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

export default RecommendedSongsByArtistsAndGenres;
