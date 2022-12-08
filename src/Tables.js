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
  const openSubmitWindow = () => setOpenSubmit(true);

  let [openDrop, setOpenDrop] = useState(false);
  const closeDropWindow = () => setOpenDrop(false);

  let [event, setEvent] = useState({
    ActiveTables: [
      {
        players: [
          {
            name: "",
            dropped: false,
            id: "",
            matchPoints: 0,
            points: 0,
            votes: 0,
            APP: 0,
          },
        ],
        tableNumber: 0,
        matchStatus: "",
        roundNumber: 0,
        votes: [
          {
            voter: { id: "", name: "" },
            vote: { id: "", name: "" },
          },
        ],
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
        event.ActiveTables.forEach((table) => {
          if (table.votes) {
            console.log(table.votes);
            table.players.forEach((player) => {
              player.votes =
                table.votes.filter((ballot) => ballot.vote.id === player.id)
                  .length || 0;
              console.log(player.votes);
            });
          } else {
            table.players.forEach((player) => {
              player.votes = 0;
              console.log(player.votes);
            });
          }
          console.log(table);
        });
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
              (t) => t.matchStatus === "Ongoing"
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
                  <li key={player.id}>
                    {player.name} - ID:{player.id} - Points: {player.points} (+
                    {player.matchPoints}) AP/P: {player.APP} Votes:{" "}
                    {table.votes &&
                    table.votes.filter(
                      (ballot) => ballot.vote.name === player.name
                    ).length > 0
                      ? table.votes.filter(
                          (ballot) => ballot.vote.name === player.name
                        ).length
                      : 0}{" "}
                    Voted for:{" "}
                    {table.votes &&
                    table.votes.filter(
                      (ballot) => ballot.voter.name === player.name
                    ).length > 0
                      ? table.votes.filter(
                          (ballot) => ballot.voter.name === player.name
                        )[0].vote.name
                      : "No one"}
                    <Popup
                      className="popup"
                      modal
                      contentStyle={contentStyle}
                      overlayStyle={overlayStyle}
                      trigger={<button disabled={player.dropped}>Drop</button>}
                      open={openDrop}
                      onClose={closeDropWindow}
                    >
                      {(close) => (
                        <div>
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
                                close();
                              });
                            }}
                          >
                            Drop
                          </button>
                          <br />
                          <br />
                        </div>
                      )}
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
                {(close) => (
                  <div>
                    <div>Submit results as:</div>
                    <ul className="table-list">
                      {table.players.map((player) => (
                        <li key={player.id}>
                          {player.name}&nbsp; Points:
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
                                closeSubmitWindow();
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
                          &nbsp;Votes
                          <button
                            onClick={async () => {
                              player.votes--;
                              await Axios.post(
                                `http://${config.ip}:8080/events/removeVote`,
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
                          {table.votes &&
                          table.votes.filter(
                            (ballot) => ballot.vote.name === player.name
                          ).length > 0
                            ? table.votes.filter(
                                (ballot) => ballot.vote.name === player.name
                              ).length
                            : 0}
                          <button
                            onClick={async () => {
                              player.votes++;
                              await Axios.post(
                                `http://${config.ip}:8080/events/addVote`,
                                {
                                  table: table,
                                  user: player,
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
                    </ul>
                    <button
                      onClick={async () => {
                        await Axios.post(
                          `http://${config.ip}:8080/events/saveTable`,
                          {
                            table: table,
                            userId: null,
                          }
                        ).then((res) => {
                          console.log(res.data);
                          close();
                        });
                      }}
                    >
                      Submit
                    </button>
                  </div>
                )}
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
