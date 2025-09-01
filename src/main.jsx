import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

const functions = require("firebase-functions");


exports.helloFirebase = functions.https.onCall((data, context) => {
  return { message: "Hello Firebase! 👋" };
});

