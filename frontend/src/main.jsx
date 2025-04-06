import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes } from "react-router";
import { Route } from 'react-router';
import RaceList from './pages/RaceList.jsx';
import RaceDetail from './pages/RaceDetail.jsx';


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route index element={<App/>} />
      <Route path='/races' element={<RaceList/>}/>
      <Route path='/races/:year/:round' element={<RaceDetail/>}/>
    </Routes>
  </BrowserRouter>,
)
