import EventRegistration from "./EventRegistration";
import { useState } from "react";
import { customAlphabet } from "nanoid";
import Axios from "axios";

const Splashscreen = () => {
  const nanoid = customAlphabet("1234567890ABCDEFGHJKLMNP", 10);

  const [eventCode, setEventCode] = useState(null);
  const [tournament, setTournament] = useState(null);

  async function generateEventCode() {
    const code = nanoid(7).toUpperCase();
    try {
      const response = await Axios.post("http://localhost:8080/events", {
        eventCode: code,
      });
      setTournament(response.data);
      setEventCode(code);
    } catch (error) {
      console.log(error);
    }
  }

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
        <button>Start Event</button>
        <button>Add Player</button>
      </form>
    );
  }
};

export default Splashscreen;
