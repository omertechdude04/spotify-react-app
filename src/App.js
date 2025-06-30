import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";

function App() {
  const [token, setToken] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [tracks, setTracks] = useState([]);
  const [playlist, setPlaylist] = useState([]);

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if (!token && hash) {
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1];

      window.location.hash = "";
      window.localStorage.setItem("token", token);
    }

    setToken(token);
  }, []);

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
    setTracks([]);
    setSearchKey("");
    setPlaylist([]);
  };

  const searchTracks = async (e) => {
    e.preventDefault();
    if (!searchKey) return;

    const { data } = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        q: searchKey,
        type: "track",
      },
    });

    setTracks(data.tracks.items);
  };

  // Add track to playlist if not already added
  const addToPlaylist = (track) => {
    if (playlist.find((item) => item.id === track.id)) return;
    setPlaylist(prev => [...prev, track]);
  };

  // Remove track from playlist
  const removeFromPlaylist = (trackId) => {
    setPlaylist(prev => prev.filter(track => track.id !== trackId));
  };

  return (
    <div style={{ maxWidth: 900, margin: 'auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Spotify React App</h1>

      {!token ? (
        <a
          style={{ display: 'block', width: 200, margin: '20px auto', padding: 10, backgroundColor: '#1DB954', color: 'white', textAlign: 'center', borderRadius: 20, textDecoration: 'none', fontWeight: 'bold' }}
          href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}
        >
          Login to Spotify
        </a>
      ) : (
        <>
          <button onClick={logout} style={{ display: 'block', margin: '20px auto', padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer' }}>Logout</button>

          <form onSubmit={searchTracks} style={{ textAlign: 'center', marginBottom: 20 }}>
            <input
              type="text"
              placeholder="Search for songs"
              value={searchKey}
              onChange={e => setSearchKey(e.target.value)}
              style={{ padding: 10, width: '70%', fontSize: 16, borderRadius: 5, border: '1px solid #ccc' }}
            />
            <button type="submit" style={{ padding: '10px 20px', marginLeft: 10, backgroundColor: '#1DB954', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer', fontWeight: 'bold' }}>
              Search
            </button>
          </form>

          <div style={{ display: 'flex', gap: 30 }}>
            {/* Search Results */}
            <div style={{ flex: 1 }}>
              <h2>Search Results</h2>
              {tracks.length === 0 && <p>No tracks found.</p>}

              {tracks.map(track => (
                <div key={track.id} style={{ display: 'flex', marginBottom: 15, borderBottom: '1px solid #ddd', paddingBottom: 10 }}>
                  <img src={track.album.images[2]?.url} alt={track.name} style={{ height: 64, width: 64, marginRight: 15 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold' }}>{track.name}</div>
                    <div style={{ fontStyle: 'italic', color: '#666' }}>
                      {track.artists.map(artist => artist.name).join(", ")}
                    </div>
                    {track.preview_url ? (
                      <audio controls src={track.preview_url} style={{ marginTop: 10, width: '100%' }} />
                    ) : (
                      <div style={{ marginTop: 10, color: 'red' }}>No preview available</div>
                    )}
                  </div>
                  <button
                    onClick={() => addToPlaylist(track)}
                    style={{ alignSelf: 'center', padding: '6px 12px', cursor: 'pointer', borderRadius: 5, backgroundColor: '#1DB954', color: 'white', border: 'none', fontWeight: 'bold' }}
                  >
                    Add to Playlist
                  </button>
                </div>
              ))}
            </div>

            {/* Playlist */}
            <div style={{ flex: 1 }}>
              <h2>Your Playlist</h2>
              {playlist.length === 0 && <p>Add some songs to your playlist!</p>}

              {playlist.map(track => (
                <div key={track.id} style={{ display: 'flex', marginBottom: 15, borderBottom: '1px solid #ddd', paddingBottom: 10 }}>
                  <img src={track.album.images[2]?.url} alt={track.name} style={{ height: 64, width: 64, marginRight: 15 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold' }}>{track.name}</div>
                    <div style={{ fontStyle: 'italic', color: '#666' }}>
                      {track.artists.map(artist => artist.name).join(", ")}
                    </div>
                    {track.preview_url ? (
                      <audio controls src={track.preview_url} style={{ marginTop: 10, width: '100%' }} />
                    ) : (
                      <div style={{ marginTop: 10, color: 'red' }}>No preview available</div>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromPlaylist(track.id)}
                    style={{ alignSelf: 'center', padding: '6px 12px', cursor: 'pointer', borderRadius: 5, backgroundColor: 'red', color: 'white', border: 'none', fontWeight: 'bold' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
