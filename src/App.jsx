import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Avatar from './profilepicture'
import UserInfo from './userinfo'
import UserPreferance from './userpreference'
import Modules from './modules'
import { BrowserRouter,Routes,Route } from 'react-router-dom'


function App() {
  const [count, setCount] = useState(0)

  return (
    <section>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserInfo/>}/>
        <Route path="/userinfo" element={<UserInfo/>}/>
                <Route path="/userpreference" element={<UserPreferance/>}/>
                        <Route path="/profilepicture" element={<Avatar/>}/>
<Route path="/modules" element={<Modules/>}/>


      </Routes>
      </BrowserRouter>
      
    </section>
  )
}

export default App
