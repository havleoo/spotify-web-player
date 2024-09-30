import React, { useState } from "react";
import Axios from "axios";
import styled from "styled-components";

export default function LoginLocal() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState("");
  const [registerStatus, setRegisterStatus] = useState("");
  const client_id = "5ce22bf9a89040eb895942284fe06912";
  const redirect_uri = "http://localhost:3000/";
  const api_uri = "https://accounts.spotify.com/authorize";
  const scopes = [
    "streaming",
    "user-read-email",
    "user-read-private",
    "user-modify-playback-state",
    "user-read-playback-state",
    "user-read-currently-playing",
    "playlist-read-private",
    "playlist-read-collaborative",
    "playlist-modify-public",
    "playlist-modify-private",
    "user-read-recently-played",
    "user-library-read",
    "user-library-modify"
  ].join("%20");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const register = (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setRegisterStatus("WRONG EMAIL FORMAT");
      return;
    }
    Axios.post("http://localhost:3001/register", {
      email: email,
      username: username,
      password: password,
    }).then((response) => {
      if (response.data.message) {
        setRegisterStatus(response.data.message);
      } else {
        setRegisterStatus("ACCOUNT CREATED SUCCESSFULLY");
      }
    });
  };

  const login = (e) => {
    e.preventDefault();
    Axios.post("http://localhost:3001/login", {
      email: email,
      password: password,
    }).then((response) => {
      if (response.data.message) {
        setLoginStatus(response.data.message);
      } else {
        window.location.href = `${api_uri}?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scopes}&response_type=token&show_dialog=true`;
      }
    });
  };

  return (
    <Container>
      <FormContainer>
        <Form className="loginForm">
          <h4>Login Here</h4>
          <label htmlFor="email">Email*</label>
          <input
            className="textInput"
            type="text"
            name="email"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            placeholder="Enter your Email"
            required
          />
          <label htmlFor="password">Password*</label>
          <input
            className="textInput"
            type="password"
            name="password"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            placeholder="Enter your Password"
            required
          />
          <button className="button" type="submit" onClick={login}>
            Login
          </button>
          <h1>{loginStatus}</h1>
        </Form>
        <Form className="registerForm">
          <h4>Register Here</h4>
          <label htmlFor="email">Email Address*</label>
          <input
            className="textInput"
            type="text"
            name="email"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            placeholder="Enter your Email Address"
            required
          />
          <label htmlFor="username">Username*</label>
          <input
            className="textInput"
            type="username"
            name="username"
            onChange={(e) => {
              setUsername(e.target.value);
            }}
            placeholder="Enter your Username"
            required
          />
          <label htmlFor="password">Password*</label>
          <input
            className="textInput"
            type="password"
            name="password"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            placeholder="Enter your Password"
            required
          />
          <button className="button" type="submit" onClick={register}>
            Create an account
          </button>
          <h1>{registerStatus}</h1>
        </Form>
      </FormContainer>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #283593;
`;

const FormContainer = styled.div`
  display: flex;
  gap: 50px;
`;

const Form = styled.form`
  background-color: black;
  border-radius: 20px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: left;
  gap: 0.5rem;

  h4 {
    color: white;
    text-align: center;
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  label {
    color: white;
    font-size: 1rem;
  }

  input {
    margin-bottom: 0.8rem;
    padding: 0.7rem;
    border-radius: 0.5rem;
    border: none;
    font-size: 1.2rem;
  }

  .button {
    margin-top: auto;
    padding: 0.8rem 2rem;
    border-radius: 5rem;
    background-color: transparent;
    color: white;
    border: 2px solid #283593;
    font-size: 1.2rem;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  .button:hover {
    background-color: #283593;
    color: black;
  }

  h1 {
    margin-top: 10px;
    font-size: 1rem;
    color: red;
    text-align: center;
  }
`;
