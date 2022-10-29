import { React, useEffect, useState } from "react";
import Axios from "axios";
import config from "./config.json";
import Popup from "reactjs-popup";
import { useTimer } from "react-timer-hook";
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
  // let [submitting, setSubmitting] = useState(false);
  // const setSubmittingFalse = () => setSubmitting(false);
  // const setSubmittingTrue = () => setSubmitting(true);
  let [openSubmit, setOpenSubmit] = useState(false);
  const closeSubmitWindow = () => setOpenSubmit(false);
  const openSubmitWindow = () => {
    setOpenSubmit(true);
    // setSubmittingTrue();
  };
  let [openVote, setOpenVote] = useState(false);
  const closeVoteWindow = () => setOpenVote(false);
  const openVoteWindow = () => setOpenVote(true);
  let [expiryTimestamp, setExpiryTime] = useState(
    new Date().setSeconds(new Date().getSeconds() + 30)
  );
  let [table, setTable] = useState({
    tableNumber: 0,
    players: [
      { name: "", matchPoints: 0, id: "", points: 0, voteSubmitted: false },
    ],
    roundNumber: 0,
    matchStatus: "",
    numberOfRounds: 0,
    tournamentComplete: false,
  });
  const { seconds, start, pause, restart } = useTimer({
    expiryTimestamp,
    onExpire: async () => {
      if (
        !table.players.filter((p) => p.id === props.userId)[0].voteSubmitted
      ) {
        await Axios.post(`http://${config.ip}:8080/events/submitVote`, {
          vote: null,
          tableNumber: table.tableNumber,
          voter: table.players.filter((p) => p.id === props.userId)[0],
        }).then((res) => {
          closeVoteWindow();
          window.location.reload();
        });
      }
    },
    autoStart: false,
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

  async function triggerGroupVote() {
    // setSubmittingFalse();
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

  useEffect(() => {
    const interval = setInterval(async () => {
      Axios.get(`http://${config.ip}:8080/events/table/${props.userId}`)
        .then((res) => {
          if (res.data) {
            setTable(res.data);
            if (table.tournamentComplete) {
              navigate(`/table/standings`).then(() => window.location.reload());
            }
            if (table.matchStatus === "Voting") {
              setOpenVote(true);
              setExpiryTime(
                new Date().setSeconds(new Date().getSeconds() + 30)
              );
              start();
            }
          }
        })
        .catch((e) => {
          console.log(e);
        });
    }, 1000);
    return () => clearInterval(interval);
  }, [table, props, start]);

  if (table.matchStatus !== "") {
    if (table.players.filter((p) => p.id === props.userId)[0].voteSubmitted)
      return (
        <div>
          {table.players.filter((p) => p.id === props.userId)[0].name}
          <br />
          Points:{" "}
          {table.players.filter((p) => p.id === props.userId)[0].points +
            table.players.filter((p) => p.id === props.userId)[0].matchPoints}
          <br />
          Awaiting next round pairings
        </div>
      );
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
        <Popup
          className="popup"
          open={openVote}
          modal
          contentStyle={contentStyle}
          overlayStyle={overlayStyle}
        >
          <h3>Your table has been submitted</h3>
          <div>
            Select one player to receive the sportsmanship bonus point({seconds}
            )
          </div>
          <br />
          {table.players
            .filter((p) => p.id !== props.userId)
            .map((player) => (
              <li key={player.id}>
                <button
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
                      pause();
                      setOpenVote(false);
                      window.location.reload();
                    });
                  }}
                >
                  {player.name}
                </button>
                <br />
                <br />
              </li>
            ))}
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
