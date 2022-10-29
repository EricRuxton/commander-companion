import EventRegistration from "./EventRegistration";
import { useEffect, useState } from "react";
import { customAlphabet } from "nanoid";
import Axios from "axios";
import config from "./config.json";

const Splashscreen = () => {
  const nanoid = customAlphabet("123456789ABCDEFGHJKLMNP", 10);
  const [eventCode, setEventCode] = useState(null);
  const [tournament, setTournament] = useState(null);
  let firstTimeThrough = true;

  async function generateEventCode() {
    const code = nanoid(7).toUpperCase();
    try {
      const response = await Axios.post(`http://${config.ip}:8080/events`, {
        eventCode: code,
      });
      setTournament(response.data);
      setEventCode(code);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (firstTimeThrough) {
      Axios.delete(`http://${config.ip}:8080/events`).then((res) => {
        console.log(res);
      });
      firstTimeThrough = false;
    }
  }, [firstTimeThrough]);

  if (eventCode == null) {
    return (
      <form
        onSubmit={(formEvent) => {
          formEvent.preventDefault();
          if (!eventCode) generateEventCode();
        }}
      >
        <div className="Splashscreen">
          <p>
            <h3>
              <b>C</b>ommander <b>C</b>ompanion
            </h3>
          </p>
          <div>Sponsored by Nerdz Cafe</div>
          <a
            className="App-link"
            href="https://nerdzcafe.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit the store
          </a>
          <br />
          <button>Start Event</button>
        </div>
      </form>
    );
  } else {
    return (
      <form
        onSubmit={(formEvent) => {
          formEvent.preventDefault();
        }}
      >
        <EventRegistration tournament={tournament} />
      </form>
    );
  }
};

export default Splashscreen;
