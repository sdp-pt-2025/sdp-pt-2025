import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Provider from "./provider";

import LandingPage from "./pages/landing-page/page";
import Dashboard from "./pages/dashboard/page";
import NoPage from "./components/nopage";
import CreateStudyGroup from "./pages/study-groups/page";

function App() {
  return (
    <BrowserRouter>
      <Provider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/partners" element={<NoPage />} />
          <Route path="/study-groups" element={<CreateStudyGroup />} />
          <Route path="/progress-tracker" element={<NoPage />} />
          <Route path="/chat" element={<NoPage />} />
          <Route path="/profile" element={<NoPage />} />
          <Route path="/settings" element={<NoPage />} />
        </Routes>
      </Provider>
    </BrowserRouter>
  );
}

export default App;
