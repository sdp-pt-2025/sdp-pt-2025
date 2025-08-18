import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Provider from "./provider";

import LandingPage from "./pages/landing-page/page";
import Dashboard from "./pages/dashboard/page";

function App() {
  return (
    <BrowserRouter>
      <Provider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Provider>
    </BrowserRouter>
  );
}

export default App;
