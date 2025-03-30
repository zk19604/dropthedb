import React, { useState, useEffect } from 'react';

const RecommendedSongsByArtistsAndGenres = ({ userId }) => {
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

}

export default RecommendedSongsByArtistsAndGenres;
