import { React, useEffect, useState } from "react";
import Axios from "axios";
import config from "./config.json";
import Popup from "reactjs-popup";
import { navigate } from "@reach/router";

const contentStyle = {
  background: "rgba(0,0,0,0.8)",
  color: "rgba(255,255,255,255)",
  margin: "auto",
  "list-style-type": "none",
  "text-align": "center",
};
const overlayStyle = { background: "rgba(0,0,0,0.5)" };

const Tables = () => {
  let [openSubmit, setOpenSubmit] = useState(false);
  const closeSubmitWindow = () => setOpenSubmit(false);
  const openSubmitWindow = () => {
    setOpenSubmit(true);
  };
  let [openDrop, setOpenDrop] = useState(false);
  const closeDropWindow = () => setOpenDrop(false);
  const openDropWindow = () => {
    setOpenDrop(true);
  };
  let [event, setEvent] = useState({
    ActiveTables: [
      {
        players: [
          { name: "", dropped: false, id: "", matchPoints: 0, points: 0 },
        ],
        tableNumber: 0,
        matchStatus: "",
        roundNumber: 0,
      },
    ],
    currentRound: 0,
    numberOfRounds: 0,
  });

  function generateNextRound() {
    Axios.post(`http://${config.ip}:8080/events/generateNextRound`).then(
      (res) => {
        if (event.currentRound === event.numberOfRounds) {
          navigate(`/table/standings`).then(() => window.location.reload());
        }
      }
    );
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      Axios.get(`http://${config.ip}:8080/events/tables`).then((res) => {
        setEvent(res.data);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [event]);

  if (event.eventCode !== 0) {
    console.log(event);
    return (
      <div>
        <h1>
          Round {event.currentRound}/{event.numberOfRounds}
        </h1>
        <h3>
          Ongoing games:
          {event.ActiveTables.filter((t) => t.matchStatus === "Ongoing").length}
          <br />
          <button
            disabled={event.ActiveTables.some(
              (t) => t.matchStatus !== "Completed"
            )}
            onClick={generateNextRound}
          >
            Submit Round
          </button>
        </h3>
        <ul className="table-list">
          {event.ActiveTables.filter(
            (t) => t.roundNumber === event.currentRound
          ).map((table) => (
            <li key={table.tableNumber}>
              Table {table.tableNumber} - {table.matchStatus}
              <br />
              Players:
              <ul className="player-list">
                {table.players.map((player) => (
                  <li>
                    {player.name} - ID:{player.id} - Points: {player.points} (+
                    {player.matchPoints})
                    <Popup
                      className="popup"
                      modal
                      contentStyle={contentStyle}
                      overlayStyle={overlayStyle}
                      trigger={<button disabled={player.dropped}>Drop</button>}
                      open={openDrop}
                    >
                      <h2>Are you sure you wish to drop this player?</h2>
                      <h2>{player.name}</h2>
                      <button
                        onClick={async () => {
                          await Axios.post(
                            `http://${config.ip}:8080/events/dropPlayer`,
                            {
                              player: player,
                              table: table,
                            }
                          ).then((res) => {
                            console.log(res);
                          });
                        }}
                      >
                        Drop
                      </button>
                      <br />
                      <br />
                    </Popup>
                  </li>
                ))}
              </ul>
              <Popup
                className="popup"
                modal
                contentStyle={contentStyle}
                overlayStyle={overlayStyle}
                trigger={
                  <button onClick={openSubmitWindow}>Enter Result</button>
                }
                open={openSubmit}
              >
                <div>Submit results as:</div>
                {table.players.map((player) => (
                  <li key={player.id}>
                    {player.name}:&nbsp;
                    <button
                      onClick={async () => {
                        player.matchPoints--;
                        await Axios.post(
                          `http://${config.ip}:8080/events/saveTable`,
                          {
                            table: table,
                            userId: player.id,
                          }
                        ).then((res) => {
                          console.log(res.data);
                        });
                      }}
                    >
                      -
                    </button>
                    {player.matchPoints}
                    <button
                      onClick={async () => {
                        player.matchPoints++;
                        await Axios.post(
                          `http://${config.ip}:8080/events/saveTable`,
                          {
                            table: table,
                            userId: player.id,
                          }
                        ).then((res) => {
                          console.log(res.data);
                        });
                      }}
                    >
                      +
                    </button>
                  </li>
                ))}
                <button
                  onClick={async () => {
                    await Axios.post(
                      `http://${config.ip}:8080/events/submitTable`,
                      {
                        table: table,
                      }
                    ).then((res) => {
                      console.log(res.data);
                    });
                    closeSubmitWindow();
                  }}
                >
                  Submit
                </button>
              </Popup>
              <br />
              <br />
            </li>
          ))}
        </ul>
      </div>
    );
  }
};

export default Tables;
