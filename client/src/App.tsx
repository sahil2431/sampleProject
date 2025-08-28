
import { Route, Routes } from 'react-router-dom'
import './App.css'
import { Home } from './pages'
import AnnouncementsPage from './pages/AnnouncementsPage'


function App() {
  return (
    <>
    {/* <Routes>
        <Route path='/' element={<Home/>}/>
    </Routes> */}

    <AnnouncementsPage/>
    </>
  )
}

export default App
