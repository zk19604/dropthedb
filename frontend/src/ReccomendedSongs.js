import React, { useState, useEffect } from 'react';
import { playMusic } from './player';

const RecommendedSongs = ({ userId, token, deviceId }) => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterArtists, setFilterArtists] = useState(true);
    const [filterGenres, setFilterGenres] = useState(false);

    useEffect(() => {
        const fetchSongs = async () => {
            if (!userId || isNaN(userId)) {
                setError("Invalid User ID");
                setLoading(false);
                return;
            }
            let endpoint = `http://localhost:5001/topartistsongs?id=${userId}`;
            if (filterArtists && filterGenres) {
                endpoint = `http://localhost:5001/topartistandgenresongs?id=${userId}`;
            } else if (filterGenres) {
                endpoint = `http://localhost:5001/topgenresongs?id=${userId}`;
            }

            try {
                setLoading(true);
                const response = await fetch(endpoint);
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
    }, [userId, filterArtists, filterGenres]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <div>
                <label>
                    <input
                        type="checkbox"
                        onChange={() => setFilterArtists(!filterArtists)}
                        checked={filterArtists}
                    />
                    Top Artists
                </label>
                <br />
                <label>
                    <input
                        type="checkbox"
                        onChange={() => setFilterGenres(!filterGenres)}
                        checked={filterGenres}
                    />
                    Top Genres
                </label>
            </div>
            {songs.length === 0 ? (
                <p>No recommendations available.</p>
            ) : (
                <ul>
                    {songs.map(song => (
                        <li key={song.songid}>
                            <strong>{song.stitle}</strong>
                            <button
                                onClick={() => {
                                    if (!deviceId || !token) {
                                        return <p>🎵 Player loading... please wait.</p>;
                                    }
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

export default RecommendedSongs;
