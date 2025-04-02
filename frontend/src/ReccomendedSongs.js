import React, { useState, useEffect } from 'react';
import playMusic from './player'

const token = localStorage.getItem("access_token");
const deviceId=localStorage.getItem("device_id");
const RecommendedSongs = ({ userId }) => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterArtists, setFilterArtists] = useState(true);
    const [filterGenres, setFilterGenres] = useState(false);

    useEffect(() => {
        const fetchSongs = async () => {
            let endpoint = "http://localhost:5001/topartistsongs?id=";
            if (filterArtists && filterGenres) {
                endpoint = "http://localhost:5001/topartistandgenresongs?id=";
            } else if (filterGenres) {
                endpoint = "http://localhost:5001/topgenresongs?id=";
            }

            try {
                setLoading(true);
                const response = await fetch(`${endpoint}${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch recommended songs');
                }
                const data = await response.json();
                setSongs(data);
                console.log(data);
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
                <br/>
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
                             {/* <button
                                                onClick={() => {
                                                  playMusic(token, deviceId, track.uri); // ✅ First function
                                                  addToSongs(
                                                    track.name,
                                                    track.artists.map((artist) => artist.name), // ✅ Pass an array of artist names
                                                    track.album.images[0]?.url, // ✅ Pass album image URL
                                                    track.uri,
                                                    track.album.name, // ✅ Pass album name correctly
                                                    track.artists[0]?.genres
                                                      ? track.artists[0].genres[0]
                                                      : "Unknown", // ✅ Handle missing genre
                                                    track.popularity
                                                  );
                                                }}
                                                style={{ marginLeft: "10px" }}
                                              >
                                                ▶️ Play
                                              </button> */}
                        </li>
                        //other feature like player like button and add to playlist added here
                    ))}
                </ul>
            )}
        </div>
    );
};

export default RecommendedSongs;
