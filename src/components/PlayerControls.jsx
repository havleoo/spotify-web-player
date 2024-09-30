import React, { useState, useEffect } from "react";
import styled from "styled-components";
import SpotifyPlayer from "react-spotify-web-playback";
import { useStateProvider } from "../utils/StateProvider";
import { reducerCases } from "../utils/Constants";
import axios from "axios";

export default function PlayerControls({ selectedTrack }) {
  const [{ token, currentPlaying, playlists }, dispatch] = useStateProvider();
  const [play, setPlay] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (selectedTrack) {
      console.log("Selected track:", selectedTrack); // Debugging log
      dispatch({
        type: reducerCases.SET_PLAYING,
        currentPlaying: selectedTrack,
      });
      setPlay(true);
    }
  }, [selectedTrack, dispatch]);

  useEffect(() => {
    if (currentPlaying) {
      console.log("Current playing track URI:", currentPlaying.uri); // Debugging log
    }
  }, [currentPlaying]);

  const handlePlayerStateChange = (state) => {
    if (!state.isPlaying) setPlay(false);
    dispatch({
      type: reducerCases.SET_PLAYER_STATE,
      playerState: state.isPlaying,
    });
  };

  const handleAddToPlaylist = async () => {
    try {
      for (const playlistId of selectedPlaylists) {
        await axios.post(
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
          {
            uris: [currentPlaying.uri],
            position: 0,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }
      setNotification("Song added to selected playlists!");
    } catch (error) {
      console.error("Error adding song to playlists:", error);
      setNotification("Error adding song to playlists.");
    } finally {
      setShowDropdown(false);
      setSelectedPlaylists([]);
      setTimeout(() => setNotification(null), 3000); // Hide notification after 3 seconds
    }
  };

  const togglePlaylistSelection = (playlistId) => {
    setSelectedPlaylists((prev) =>
      prev.includes(playlistId)
        ? prev.filter((id) => id !== playlistId)
        : [...prev, playlistId]
    );
  };

  if (!token) return null;

  const trackUri = currentPlaying && currentPlaying.uri ? [currentPlaying.uri] : [];
  console.log("Track URI to play:", trackUri); // Debugging log

  return (
    <Container>
      <SpotifyPlayer
        token={token}
        callback={handlePlayerStateChange}
        play={play}
        uris={trackUri}
        styles={{
          activeColor: "#fff",
          bgColor: "#181818",
          color: "#fff",
          loaderColor: "#fff",
          sliderColor: "#283593",
          trackArtistColor: "#ccc",
          trackNameColor: "#fff",
        }}
      />
      <OptionsButton onClick={() => setShowDropdown(!showDropdown)}>...</OptionsButton>
      {showDropdown && (
        <Dropdown>
          <ul>
            {playlists.map((playlist) => (
              <li key={playlist.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedPlaylists.includes(playlist.id)}
                    onChange={() => togglePlaylistSelection(playlist.id)}
                  />
                  {playlist.name}
                </label>
              </li>
            ))}
          </ul>
          <AddButton onClick={handleAddToPlaylist}>Add to Playlist</AddButton>
        </Dropdown>
      )}
      {notification && <Notification>{notification}</Notification>}
    </Container>
  );
}

const Container = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #181818;
  border-top: 1px solid #282828;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const OptionsButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  margin-left: 0.5rem;
  margin-bottom: 0.8rem;
  cursor: pointer;
  position: relative;
`;

const Dropdown = styled.div`
  position: absolute;
  bottom: 70px;
  right: 10px;
  background-color: #282828;
  color: white;
  border: 1px solid #3d3d3d;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  z-index: 10;
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 200px;
    overflow-y: auto;
    li {
      margin: 0.5rem 0;
      label {
        cursor: pointer;
        display: flex;
        align-items: center;
        input {
          margin-right: 0.5rem;
        }
      }
    }
  }
`;

const AddButton = styled.button`
  background-color: #1a237e;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
  width: 100%;
  text-align: center;
  &:hover {
    background-color: #283593;
  }
`;

const Notification = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(40, 40, 40, 0.9);
  color: #fff;
  padding: 1rem 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  font-size: 1rem;
  text-align: center;
`;
