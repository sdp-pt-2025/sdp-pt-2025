import React from "react";
import logo from "./logo.svg";
import "./App.css";
import ApiExample from "./components/ApiExample";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Campus Study Buddy</h1>
        <p>
          A platform for students to find study partners and form study groups
        </p>
      </header>

      <main>
        <ApiExample />
      </main>
    </div>
  );
}

export default App;
