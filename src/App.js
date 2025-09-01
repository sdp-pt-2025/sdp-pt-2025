import logo from './logo.svg';
import './App.css';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import Dashboard from "./pages/dashboard"
import LoginPage from './pages/login';
import UserInfo from './pages/userinfo';
import Modules from './pages/modules';
import Avatar from './pages/avatar';
import Profile from './pages/profile';

function App() {
  return (
    <section>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Profile/>}/>
         <Route path="/login" element={<LoginPage/>}/>
         <Route path="/userinfo" element={<UserInfo/>}/>
         <Route path="/modules" element={<Modules/>}/>
         <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/avatar" element={<Avatar/>}/>
          <Route path="/profile" element={<Profile/>}/>
      </Routes>
      </BrowserRouter>
    </section>
  );
}

export default App;
