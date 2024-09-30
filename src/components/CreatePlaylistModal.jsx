import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useStateProvider } from "../utils/StateProvider";
import { reducerCases } from "../utils/Constants";

export default function CreatePlaylistModal({ onClose }) {
  const [{ token, userInfo, playlists }, dispatch] = useStateProvider();
  const [playlistName, setPlaylistName] = useState("");
  const [playlistLink, setPlaylistLink] = useState("");
  const [createByLink, setCreateByLink] = useState(false);

  const handleCreate = async () => {
    try {
      if (createByLink) {
        // Extract playlist ID from the link
        const playlistId = playlistLink.split("playlist/")[1].split("?")[0];
        console.log("Creating playlist by link, playlist ID:", playlistId); // Debugging log

        // Fetch the playlist details
        const response = await axios.get(
          `https://api.spotify.com/v1/playlists/${playlistId}`,
          {
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            },
          }
        );
        // Add the fetched playlist to the list of playlists
        dispatch({
          type: reducerCases.SET_PLAYLISTS,
          playlists: [...playlists, response.data],
        });
      } else {
        console.log("Creating playlist by name, playlist name:", playlistName); // Debugging log

        // Create a new playlist
        const response = await axios.post(
          `https://api.spotify.com/v1/users/${userInfo?.userId}/playlists`,
          {
            name: playlistName,
            description: "New playlist description",
            public: false,
          },
          {
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            },
          }
        );
        // Add the new playlist to the list of playlists
        dispatch({
          type: reducerCases.SET_PLAYLISTS,
          playlists: [...playlists, response.data],
        });
      }
      onClose();
    } catch (error) {
      console.error("Error creating playlist:", error);
    }
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <h2>Create New Playlist</h2>
        <RadioGroup>
          <RadioLabel>
            <input
              type="radio"
              checked={!createByLink}
              onChange={() => setCreateByLink(false)}
            />
            <span>Create by Name</span>
          </RadioLabel>
          <RadioLabel>
            <input
              type="radio"
              checked={createByLink}
              onChange={() => setCreateByLink(true)}
            />
            <span>Create by Link</span>
          </RadioLabel>
        </RadioGroup>
        {!createByLink ? (
          <input
            type="text"
            placeholder="Playlist Name"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
          />
        ) : (
          <input
            type="text"
            placeholder="Playlist Link"
            value={playlistLink}
            onChange={(e) => setPlaylistLink(e.target.value)}
          />
        )}
        <div className="buttons">
          <button onClick={handleCreate}>Create</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </ModalContent>
    </ModalOverlay>
  );
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  h2 {
    margin-bottom: 1rem;
  }
  input {
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border-radius: 4px;
    border: 1px solid #ccc;
  }
  .buttons {
    display: flex;
    justify-content: space-between;
    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      &:first-child {
        background-color: #283593;
        color: white;
      }
      &:last-child {
        background-color: #ccc;
      }
    }
  }
`;

const RadioGroup = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 1rem;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  input[type="radio"] {
    display: none;
  }
  span {
    margin-left: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    border: 1px solid #ccc;
    background-color: #f5f5f5;
    color: #333;
    transition: background-color 0.3s, border-color 0.3s;
  }
  input[type="radio"]:checked + span {
    background-color: #283593;
    color: white;
    border-color: #283593;
  }
`;
