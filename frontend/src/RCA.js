import React, { useState, useEffect } from 'react';

const RecommendedSongsByArtists = ({ userId }) => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const response = await fetch(`http://localhost:5001/topartistsongs?id=${userId}`);
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
            <h2>Recommended Songs by Top Artists</h2>
            {songs.length === 0 ? (
                <p>No recommendations available.</p>
            ) : (
                <ul>
                    {songs.map(song => (
                        <li key={song.songid}>
                            <strong>{song.stitle}</strong>
                            //other features to be added here like being able to play the song, like it, and add to playlist
    
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default RecommendedSongsByArtists;
