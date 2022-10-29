import { React, useEffect, useState } from "react";
import Axios from "axios";
import { customAlphabet } from "nanoid";
import Cookies from "js-cookie";
import { useNavigate } from "@reach/router";
import config from "./config.json";

const RegistrationPage = () => {
  const navigate = useNavigate();
  const nanoid = customAlphabet("123456789ABCDEFGHJKLMNP", 10);
  let [event, setEvent] = useState("");
  let [name, setName] = useState("");
  let [id, setId] = useState("");
  let addingPlayer = false;

  if (!Cookies.get("playerId")) {
    Cookies.set("playerId", nanoid(7).toUpperCase());
  }

  function addPlayer() {
    console.log(`adding player ${Cookies.get("playerId")}`);
    if (name.length) {
      setName(name.trim());
    }
    if (!addingPlayer && name.length > 0) {
      addingPlayer = true;
      Axios.post(`http://${config.ip}:8080/events/addPlayer`, {
        name: name,
        id: Cookies.get("playerId"),
        mobileUser: true,
      }).then((res) => {
        console.log(res);
        addingPlayer = false;
        navigate(`/table/${Cookies.get("playerId")}`);
        window.location.reload();
      });
    }
  }

  function signIn() {
    Cookies.set("playerId", id);
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      if (event === "") {
        const response = await Axios.get(
          `http://${config.ip}:8080/events/getEventCode`
        );
        setEvent(response.data);
        console.log(event);
      } else {
        if (!event.ongoing) {
          const response = await Axios.get(
            `http://${config.ip}:8080/events/getEventCode`
          );
          setEvent(response.data);
          console.log(event);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [event]);

  if (event !== "") {
    if (!event.ongoing) {
      console.log(event);
      return (
        <form
          onSubmit={(formEvent) => {
            formEvent.preventDefault();
            addPlayer();
          }}
        >
          <div>
            Name:
            <input onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <button onClick={addPlayer}>Join</button>
          </div>
        </form>
      );
    } else {
      return (
        <div>
          The event has already started. If you are a part of this event, ask
          the event host for your ID.
          <div>
            ID:
            <input onChange={(e) => setId(e.target.value)} />
          </div>
          <div>
            <button onClick={signIn}>Join</button>
          </div>
        </div>
      );
    }
  } else {
    return <div>There are no ongoing events</div>;
  }
};
export default RegistrationPage;
