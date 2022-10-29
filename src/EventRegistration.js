import { useEffect, useState } from "react";
import Axios from "axios";
import { useNavigate } from "@reach/router";
import config from "./config.json";
import { customAlphabet } from "nanoid";

const EventRegistration = (props) => {
  const nanoid = customAlphabet("123456789ABCDEFGHJKLMNP", 10);
  const navigate = useNavigate();
  let [players, setPlayers] = useState([]);
  let [newPlayer, setPlayer] = useState("");
  let addingPlayer = false;

  function addPlayer() {
    if (newPlayer.length) {
      setPlayer(newPlayer.trim());
    }
    if (!addingPlayer && newPlayer.length > 0) {
      addingPlayer = true;
      Axios.post(`http://${config.ip}:8080/events/addPlayer`, {
        name: newPlayer,
        id: nanoid(7).toUpperCase(),
        mobileUser: false,
      }).then((res) => {
        console.log(res.data);
        addingPlayer = false;
      });
      setPlayers([...players, { name: newPlayer }]);
    }
  }

  async function startEvent() {
    console.log(players.length);
    if (players.length >= 6) {
      navigate(`/tables/${props.tournament.eventCode}`);
      window.location.reload();
    }
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      if (props.tournament.eventCode) {
        try {
          const response = await Axios.get(
            `http://${config.ip}:8080/events/players`
          );
          if (response.data) {
            setPlayers(response.data);
          }
        } catch (error) {
          console.log(error);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [players, props.tournament.eventCode]);

  if (props.tournament.eventCode)
    return (
      <div>
        <h1>{props.tournament.eventCode}</h1>
        <div>
          <button onClick={addPlayer}>Add Player</button>
          <input onChange={(e) => setPlayer(e.target.value)} />
        </div>
        <button onClick={startEvent}>Start Event</button>
        <ul className="player-list">
          {players.map((player) => (
            <li>
              {player.name}&nbsp;
              <button
                onClick={() => {
                  Axios.post(`http://${config.ip}:8080/events/removePlayer`, {
                    player: player,
                  }).then((res) => {
                    console.log(res.data);
                    setPlayers(res.data);
                  });
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
};

export default EventRegistration;
