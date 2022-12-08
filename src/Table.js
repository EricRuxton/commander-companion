import { useEffect, useState } from "react";
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

const Table = (props) => {
  //submit table pop up hooks
  let [openSubmit, setOpenSubmit] = useState(false);
  const closeSubmitWindow = () => setOpenSubmit(false);
  const openSubmitWindow = () => {
    setOpenSubmit(true);
  };

  //table data hooks
  let [table, setTable] = useState({
    tableNumber: 0,
    players: [
      { name: "", matchPoints: 0, id: "", points: 0, voteSubmitted: false },
    ],
    votes: [
      {
        voter: {
          id: "",
          name: "",
        },
        vote: {
          id: "",
          name: "",
        },
      },
    ],
    roundNumber: 0,
    matchStatus: "",
    numberOfRounds: 0,
    tournamentComplete: false,
  });

  async function addPoint() {
    table.players.filter((p) => p.id === props.userId)[0].matchPoints++;
    console.log(table.players.filter((p) => p.id === props.userId)[0]);
    await Axios.post(`http://${config.ip}:8080/events/saveTable`, {
      table: table,
      userId: props.userId,
    }).then((res) => {
      setTable(res.data);
    });
  }

  async function removePoint() {
    table.players.filter((p) => p.id === props.userId)[0].matchPoints--;
    console.log(table.players.filter((p) => p.id === props.userId)[0]);
    await Axios.post(`http://${config.ip}:8080/events/saveTable`, {
      table: table,
      userId: props.userId,
    }).then((res) => {
      setTable(res.data);
    });
  }

  async function triggerGroupVote() {
    await Axios.post(`http://${config.ip}:8080/events/markTableComplete`, {
      table: table,
    })
      .catch((e) => {
        console.log(e);
      })
      .then((res) => {
        console.log(res.data);
        closeSubmitWindow();
      });
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      Axios.get(`http://${config.ip}:8080/events/table/${props.userId}`)
        .then((res) => {
          if (res.data) {
            console.log(res.data);
            setTable(res.data);
            if (table.tournamentComplete) {
              navigate(`/table/standings`).then(() => window.location.reload());
            }
            if (table.votes) {
              if (
                table.votes.filter((ballot) => ballot.vote.id === props.userId)
                  .length > 0
              ) {
                console.log(
                  table.votes.filter(
                    (ballot) => ballot.vote.id === props.userId
                  ).length
                );
                document.getElementById("voteCount").style.visibility =
                  "visible";
              } else {
                document.getElementById("voteCount").style.visibility =
                  "hidden";
              }
              if (
                table.votes.filter((ballot) => ballot.voter.id === props.userId)
                  .length > 0
              ) {
                document.getElementById("voteRecord").style.visibility =
                  "visible";
              } else {
                document.getElementById("voteRecord").style.visibility =
                  "hidden";
              }
            } else {
              document.getElementById("voteCount").style.visibility = "hidden";
              document.getElementById("voteRecord").style.visibility = "hidden";
            }
          }
        })
        .catch((e) => {
          console.log(e);
        });
    }, 1000);
    return () => clearInterval(interval);
  }, [table, props]);

  if (table.matchStatus === "Completed") {
    return (
      <div>
        <h1>Match Submitted</h1>
        <h2>
          {table.players.filter((p) => p.id === props.userId)[0].name} - Points:{" "}
          {table.players.filter((p) => p.id === props.userId)[0].matchPoints}
        </h2>
        <ul className="player-list">
          {table.players
            .filter((p) => p.id !== props.userId)
            .map((player) => (
              <li key={player.id}>
                {player.name} - Points: {player.matchPoints} -{" "}
                <button
                  disabled={
                    table.players.filter((p) => p.id === props.userId)[0]
                      .voteSubmitted
                  }
                  onClick={async () => {
                    await Axios.post(
                      `http://${config.ip}:8080/events/submitVote`,
                      {
                        vote: player,
                        tableNumber: table.tableNumber,
                        voter: table.players.filter(
                          (p) => p.id === props.userId
                        )[0],
                      }
                    ).then((res) => {
                      console.log(res);
                    });
                  }}
                >
                  Give Vote
                </button>
              </li>
            ))}
        </ul>
        {table.votes ? (
          <div>
            <div id="voteRecord">
              Thanks for giving{" "}
              {table.votes.filter((ballot) => ballot.voter.id === props.userId)
                .length > 0
                ? table.votes.filter(
                    (ballot) => ballot.voter.id === props.userId
                  )[0].vote.name
                : null}{" "}
              a sportsmanship vote!
            </div>
            <div id="voteCount">
              You've received{" "}
              {table.votes.filter((ballot) => ballot.vote.id === props.userId)
                .length > 0
                ? table.votes.filter(
                    (ballot) => ballot.vote.id === props.userId
                  ).length
                : null}{" "}
              sportsmanship vote(s)!
            </div>
          </div>
        ) : (
          <div>
            You have until the next round begins to award 1 sportsmanship vote
            to another player
          </div>
        )}
      </div>
    );
  } else if (table.matchStatus !== "") {
    return (
      <div>
        <h1>
          Table {table.tableNumber} - Round {table.roundNumber}/
          {table.numberOfRounds}
        </h1>
        <h2>{table.players.filter((p) => p.id === props.userId)[0].name}</h2>
        <h3>
          <button
            disabled={table.matchStatus !== "Ongoing"}
            onClick={removePoint}
          >
            -
          </button>
          &nbsp;Points:&nbsp;
          {table.players.filter((p) => p.id === props.userId)[0].points} (+
          {table.players.filter((p) => p.id === props.userId)[0].matchPoints})
          &nbsp;
          <button disabled={table.matchStatus !== "Ongoing"} onClick={addPoint}>
            +
          </button>
        </h3>
        <h3>Opponents:</h3>
        <ul className="player-list">
          {table.players
            .filter((p) => p.id !== props.userId)
            .map((player) => (
              <li key={player.id}>
                {player.name} - Points: {player.points} (+{player.matchPoints})
              </li>
            ))}
        </ul>
        <button
          onClick={openSubmitWindow}
          disabled={table.matchStatus !== "Ongoing"}
        >
          Submit
        </button>
        <Popup
          className="popup"
          modal
          contentStyle={contentStyle}
          overlayStyle={overlayStyle}
          closeOnDocumentClick={true}
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
                    setTable(res.data);
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
                    setTable(res.data);
                  });
                }}
              >
                +
              </button>
            </li>
          ))}
          <button onClick={triggerGroupVote}>Submit</button>
        </Popup>
      </div>
    );
  } else {
    return (
      <div>
        <div>You have not yet been assigned a table.</div>
      </div>
    );
  }
};
export default Table;
