import { useEffect, useState } from "react";
import Axios from "axios";

const EventRegistration = (props) => {
  let [players, setPlayers] = useState([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      //setPlayers([...players, { name: "test" }]);
      try {
        const response = await Axios.get(
          "http://localhost:8080/events/players"
        );
        if (response.data) setPlayers(response.data);
      } catch (error) {
        console.log(error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [players]);

  if (props.tournament.eventCode)
    return (
      <div>
        <h1>{props.tournament.eventCode}</h1>
        <body>
          <ul className="player-list">
            {players.map((player) => (
              <li>name: {player.name}</li>
            ))}
          </ul>
        </body>
      </div>
    );
};

export default EventRegistration;
