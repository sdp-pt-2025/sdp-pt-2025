import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Provider from "./provider.jsx";

import LandingPage from "./pages/landing-page/page.jsx";
import Dashboard from "./pages/dashboard/page.jsx";
import NoPage from "./components/nopage.jsx";
import CreateStudyGroup from "./pages/study-groups/page.jsx";
import Partners from "./pages/partners/page.jsx"
import Progress from "./pages/progress/page.jsx";
import Chat from "./pages/chat/components/ChatList.jsx"
import Profile from "./pages/profile/page.jsx"
import ChatPage from "./pages/chat/page.jsx"; 
// import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner";

function App() {
    return (
        <BrowserRouter>
        {/* <Analytics/> */}
            <Provider>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/partners" element={<Partners />} />
                    <Route path="/study-groups" element={<CreateStudyGroup />} />
                    <Route path="/progress-tracker" element={<Progress />} />
                    <Route path="/profile" element={<Profile />} />
                    
                   
                    <Route path="/chats" element={<ChatPage />} />
                    <Route path="/chats/:chatId" element={<ChatPage />} />
                </Routes>
                <Toaster/>
            </Provider>
        </BrowserRouter>
    );
}

export default App;