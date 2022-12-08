import { useEffect, useState } from "react";
import Axios from "axios";
import config from "./config.json";

const Standings = () => {
  const [standings, setStandings] = useState([]);
  useEffect(() => {
    const interval = setInterval(async () => {
      if (standings.length === 0) {
        Axios.get(`http://${config.ip}:8080/events/standings`).then((res) => {
          setStandings(res.data);
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [standings]);

  if (standings.length === 0) {
    return <div>Awaiting Standings...</div>;
  } else {
    console.log(standings);
    return (
      <div>
        {standings.map((player) => (
          <ul>
            <li>
              {standings.indexOf(player) + 1}. {player.name} Points:{" "}
              {player.points} - AP/P: {player.APP}
            </li>
          </ul>
        ))}
      </div>
    );
  }
};
export default Standings;
