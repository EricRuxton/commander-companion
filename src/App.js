import logo from "./logo.svg";
import "./App.css";
import Splashscreen from "./Splashscreen";
import RegistrationPage from "./RegistrationPage";
import Tables from "./Tables";
import { Router } from "@reach/router";
import Table from "./Table";
import Standings from "./Standings";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Router>
          <Splashscreen path="/" />
          <RegistrationPage path="/register" />
          <Tables path="/tables/:eventId" />
          <Table path="/table/:userId" />
          <Standings path="/table/standings" />
        </Router>
      </header>
    </div>
  );
}

export default App;
