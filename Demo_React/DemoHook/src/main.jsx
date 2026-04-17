import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Demo from './UsoUseState.jsx'
import Contador from './Contador.jsx'
import {DemoEffect} from './UsoUseEffect.jsx'
import Pokemon from './Pokemon.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Pokemon />
  </StrictMode>,
)
