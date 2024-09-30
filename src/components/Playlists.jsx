import axios from "axios";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { reducerCases } from "../utils/Constants";
import { useStateProvider } from "../utils/StateProvider";

export default function Playlists() {
  const [{ token, playlists }, dispatch] = useStateProvider();
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const getPlaylistData = async () => {
      const response = await axios.get(
        "https://api.spotify.com/v1/me/playlists",
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      );
      const { items } = response.data;
      const playlists = items.map(({ name, id }) => {
        return { name, id };
      });
      dispatch({ type: reducerCases.SET_PLAYLISTS, playlists });
    };
    getPlaylistData();
  }, [token, dispatch]);

  const changeCurrentPlaylist = async (selectedPlaylistId) => {
    dispatch({ type: reducerCases.SET_PLAYLIST_ID, selectedPlaylistId });

    // Check if the selected playlist is empty
    const response = await axios.get(
      `https://api.spotify.com/v1/playlists/${selectedPlaylistId}/tracks`,
      {
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.items.length === 0) {
      setNotification("The selected playlist is empty.");
    } else {
      setNotification(null);
    }
  };

  return (
    <Container>
      <ul>
        {playlists.map(({ name, id }) => {
          return (
            <PlaylistItem key={id} onClick={() => changeCurrentPlaylist(id)}>
              {name}
            </PlaylistItem>
          );
        })}
      </ul>
      {notification && (
        <Notification>
          <p>{notification}</p>
          <button onClick={() => setNotification(null)}>OK</button>
        </Notification>
      )}
    </Container>
  );
}

const Container = styled.div`
  color: #b3b3b3;
  height: 100%;
  overflow: hidden;
  ul {
    list-style-type: none;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    height: 55vh;
    max-height: 100%;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.7rem;
      &-thumb {
        background-color: rgba(255, 255, 255, 0.6);
      }
    }
  }
`;

const PlaylistItem = styled.li`
  background-color: #292929;
  padding: 0.5rem;
  border-radius: 4px;
  transition: 0.3s ease-in-out;
  cursor: pointer;
  &:hover {
    color: white;
    background-color: #3d3d3d;
  }
`;

const Notification = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #ffcccb;
  color: #333;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  text-align: center;
  z-index: 1000;

  p {
    margin-bottom: 1rem;
  }

  button {
    background-color: #333;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    &:hover {
      background-color: #555;
    }
  }
`;
