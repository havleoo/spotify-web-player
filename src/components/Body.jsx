import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useStateProvider } from "../utils/StateProvider";
import { reducerCases } from "../utils/Constants";
import Recommend from "./Recommend";
import axios from "axios";
import PlayerControls from "./PlayerControls";

export default function Body({ headerBackground }) {
  const [{ token, selectedPlaylist, selectedPlaylistId }, dispatch] = useStateProvider();
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showShareLink, setShowShareLink] = useState(false);

  useEffect(() => {
    const getInitialPlaylist = async () => {
      try {
        const response = await axios.get(
          `https://api.spotify.com/v1/playlists/${selectedPlaylistId}`,
          {
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            },
          }
        );
        const selectedPlaylist = {
          id: response.data.id,
          name: response.data.name,
          description: response.data.description.startsWith("<a")
            ? ""
            : response.data.description,
          image: response.data.images[0].url,
          tracks: response.data.tracks.items.map(({ track }) => ({
            id: track.id,
            name: track.name,
            artists: track.artists.map((artist) => artist.name),
            image: track.album.images[2].url,
            duration: track.duration_ms,
            album: track.album.name,
            context_uri: track.album.uri,
            track_number: track.track_number,
            uri: track.uri,
          })),
        };
        dispatch({ type: reducerCases.SET_PLAYLIST, selectedPlaylist });
      } catch (error) {
        console.error("Failed to fetch playlist:", error);
      }
    };
    getInitialPlaylist();
  }, [token, dispatch, selectedPlaylistId]);

  const msToMinutesAndSeconds = (ms) => {
    var minutes = Math.floor(ms / 60000);
    var seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  };

  const handleTrackSelect = (track) => {
    setSelectedTrack(track); // Update the selected track state
  };

  const handleDeleteTrack = async (track) => {
    try {
      await axios.delete(
        `https://api.spotify.com/v1/playlists/${selectedPlaylistId}/tracks`,
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
          data: {
            tracks: [{ uri: track.uri }],
          },
        }
      );
      // Refresh the playlist after deletion
      dispatch({
        type: reducerCases.SET_PLAYLIST,
        selectedPlaylist: {
          ...selectedPlaylist,
          tracks: selectedPlaylist.tracks.filter(t => t.uri !== track.uri),
        },
      });
      setNotification("Song deleted successfully!");
    } catch (error) {
      console.error("Failed to delete track:", error);
      setNotification("Error deleting song.");
    } finally {
      setShowDropdown(false);
      setTimeout(() => setNotification(null), 3000); // Hide notification after 3 seconds
    }
  };

  const toggleDropdown = (track) => {
    if (trackToDelete?.id === track.id && showDropdown) {
      setShowDropdown(false);
      setTrackToDelete(null);
    } else {
      setShowDropdown(true);
      setTrackToDelete(track);
    }
  };

  const handleShareClick = () => {
    setShowShareLink(!showShareLink);
  };

  return (
    <Container headerBackground={headerBackground}>
      {selectedPlaylist && (
        <div className="playlist">
          <div className="left">
            <div className="image">
              <img src={selectedPlaylist.image} alt="selected playlist" />
            </div>
            <div className="details">
              <span className="type">PLAYLIST</span>
              <h1 className="title">
                {selectedPlaylist.name}
                <ShareButton onClick={handleShareClick}>🔗</ShareButton>
              </h1>
              {showShareLink && (
                <ShareLink>
                  <p>Playlist Link:</p>
                  <a href={`https://open.spotify.com/playlist/${selectedPlaylistId}`} target="_blank" rel="noopener noreferrer">
                    {`https://open.spotify.com/playlist/${selectedPlaylistId}`}
                  </a>
                </ShareLink>
              )}
              <p className="description">{selectedPlaylist.description}</p>
            </div>
            <div className="list">
              <div className="header-row">
                <div className="col">
                  <span>#</span>
                </div>
                <div className="col">
                  <span>TITLE</span>
                </div>
                <div className="col">
                  <span>ALBUM</span>
                </div>
                <div className="col">
                  <span>DURATION</span>
                </div>
              </div>
              <div className="tracks">
                {selectedPlaylist.tracks.map(
                  ({ id, name, artists, image, duration, album, context_uri, track_number, uri }, index) => {
                    return (
                      <div
                        className="row"
                        key={id}
                        onClick={() => handleTrackSelect({ id, name, artists, image, duration, album, context_uri, track_number, uri })} // Ensure uri is passed
                      >
                        <div className="col">
                          <span>{index + 1}</span>
                        </div>
                        <div className="col detail">
                          <div className="image">
                            <img src={image} alt="track" />
                          </div>
                          <div className="info">
                            <span className="name">{name}</span>
                            <span>{artists.join(", ")}</span>
                          </div>
                        </div>
                        <div className="col">
                          <span>{album}</span>
                        </div>
                        <div className="col duration">
                          <span>{msToMinutesAndSeconds(duration)}</span>
                          <OptionsButton
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDropdown({ id, uri });
                            }}
                          >
                            ...
                          </OptionsButton>
                          {showDropdown && trackToDelete?.id === id && (
                            <Dropdown>
                              <DeleteButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTrack(trackToDelete);
                                }}
                              >
                                Delete
                              </DeleteButton>
                            </Dropdown>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
          <div className="right">
            <Recommend />
          </div>
        </div>
      )}
      {notification && <Notification>{notification}</Notification>}
      <PlayerControlsContainer>
        <PlayerControls selectedTrack={selectedTrack} /> 
      </PlayerControlsContainer>
    </Container>
  );
}

const Container = styled.div`
  .playlist {
    display: flex;
    .left {
      flex: 1;
      margin: 2rem;
      .image {
        img {
          height: 15rem;
          box-shadow: rgba(0, 0, 0, 0.25) 0px 25px 50px -12px;
        }
      }
      .details {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        color: #e0dede;
        .title {
          display: flex;
          align-items: center;
          color: white;
          font-size: 4rem;
        }
      }
      .list {
        .header-row {
          display: grid;
          grid-template-columns: 0.3fr 3fr 2fr 0.2fr 0.1fr;
          margin: 1rem 0 0 0;
          color: #dddcdc;
          position: sticky;
          top: 15vh;
          padding: 1rem 3rem;
          transition: 0.3s ease-in-out;
          background-color: ${({ headerBackground }) =>
            headerBackground ? "#000000dc" : "none"};
        }
        .tracks {
          margin: 0 2rem;
          display: flex;
          flex-direction: column;
          margin-bottom: 5rem;
          .row {
            padding: 0.5rem 1rem;
            display: grid;
            grid-template-columns: 0.3fr 3.1fr 2fr 0.1fr 0.1fr;
            align-items: center;
            &:hover {
              background-color: rgba(0, 0, 0, 0.7);
            }
            .col {
              display: flex;
              align-items: center;
              color: #dddcdc;
              img {
                height: 40px;
                width: 40px;
              }
            }
            .detail {
              display: flex;
              gap: 1rem;
              .info {
                display: flex;
                flex-direction: column;
              }
            }
            .duration {
              display: flex;
              align-items: center;
              justify-content: space-between;
              position: relative;
            }
          }
        }
      }
    }
    .left {
      flex: 1.8;
    }
    .right {
      flex: 1;
    }
  }
`;

const PlayerControlsContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
`;

const OptionsButton = styled.button`
  background: none;
  border: none;
  margin-left: 2rem;
  margin-bottom: 1rem;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  position: relative;
`;

const Dropdown = styled.div`
  position: absolute;
  bottom: 30px;
  right: 0;
  background-color: #282828;
  border: 1px solid #fff;
  border-radius: 4px;
  padding: 1rem;
`;

const DeleteButton = styled.button`
  background-color: #ff4d4d;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1rem;
  &:hover {
    background-color: #ff6666;
  }
`;

const Notification = styled.div`
  position: fixed;
  bottom: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #282828;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 1rem;
`;

const ShareButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  margin-left: 1rem;
`;

const ShareLink = styled.div`
  background-color: #282828;
  color: #fff;
  padding: 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  a {
    color: #1db954;
    text-decoration: none;
  }
`;
