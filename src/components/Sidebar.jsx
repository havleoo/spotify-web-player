import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { MdHomeFilled } from "react-icons/md";
import { IoLibrary } from "react-icons/io5";
import Playlists from "./Playlists";
import { useStateProvider } from "../utils/StateProvider";
import { reducerCases } from "../utils/Constants";
import CreatePlaylistModal from "./CreatePlaylistModal";

export default function Sidebar() {
  const [{ token }, dispatch] = useStateProvider();
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    console.log("Token:", token); // Ensure token is available
  }, [token]);

  const handleHomeClick = () => {
    dispatch({ type: reducerCases.SET_PLAYLIST_ID, selectedPlaylistId: "37i9dQZF1DWVOaOWiVD1Lf" });
  };

  const handleLibraryClick = () => {
    setShowPlaylists(prevShowPlaylists => !prevShowPlaylists);
    console.log("Library clicked, showPlaylists:", !showPlaylists);
  };

  const handleCreateClick = () => {
    setShowCreateModal(true);
    console.log("Create button clicked");
  };

  return (
    <Container>
      <div className="top__links">
        <div className="logo">
          <img
            src="https://husteduvn-my.sharepoint.com/personal/hung_vt210406_sis_hust_edu_vn/Documents/Hung/20232/Project%20II/logo/LOGO.png"
            alt="LOGO"
          />
        </div>
        <ul>
          <li onClick={handleHomeClick}>
            <MdHomeFilled />
            <span>Home</span>
          </li>
          <li className="library__item">
            <div className="library__button" onClick={handleLibraryClick}>
              <IoLibrary />
              <span>Your Library</span>
            </div>
            <CreateButton onClick={handleCreateClick}>+</CreateButton>
          </li>
        </ul>
      </div>
      {showPlaylists && <Playlists />}
      {showCreateModal && <CreatePlaylistModal onClose={() => setShowCreateModal(false)} />}
    </Container>
  );
}

const Container = styled.div`
  background-color: black;
  color: #b3b3b3;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  .top__links {
    display: flex;
    flex-direction: column;
    .logo {
      text-align: center;
      margin: 1rem 0;
      img {
        max-inline-size: 80%;
        block-size: auto;
      }
    }
    ul {
      list-style-type: none;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      li {
        display: flex;
        gap: 1rem;
        cursor: pointer;
        transition: 0.3s ease-in-out;
        &:hover {
          color: white;
        }
        &.library__item {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .library__button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          span {
            cursor: pointer;
          }
        }
      }
    }
  }
`;

const CreateButton = styled.button`
  background-color: #292929;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  line-height: 24px;
  margin-left: auto;
  &:hover {
    background-color: #283593;
  }
`;
