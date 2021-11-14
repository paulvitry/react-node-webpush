import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { getToken } from "./subscribtion";
import Axios from "axios";

function App() {
  const [data, setData] = useState("");
  const endpoint =
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_ENDPOINT_PROD
      : process.env.REACT_APP_ENDPOINT_DEV;

  const getHelloWorld = async () => {
    Axios.get(endpoint + "/")
      .then((res: any) => {
        setData(res.data);
        console.log(res);
      })
      .catch((err: any) => console.log(err));
  };

  const notify = async () => {
    getToken().then(async (token) => {
      const response = await fetch(endpoint + "/notifications/subscribe", {
        method: "POST",
        body: JSON.stringify(token),
        headers: {
          "Content-Type": "application/json",
        },
      }).catch((err: any) => console.log(err));
      console.log(response);
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>

        <button
          onClick={() => {
            getHelloWorld();
          }}
        >
          getHelloWorld
        </button>
        <button
          onClick={() => {
            notify();
          }}
        >
          notify
        </button>
        <div>{`Data: ${data}`}</div>
      </header>
    </div>
  );
}

export default App;
