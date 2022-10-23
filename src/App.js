import logo from "./logo.svg";
import "./App.css";
import Splashscreen from "./Splashscreen";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Splashscreen />
      </header>
    </div>
  );
}

export default App;
