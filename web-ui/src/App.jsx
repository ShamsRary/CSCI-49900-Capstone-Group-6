import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Library from './pages/Library'
import Login from './pages/Login'
import Puzzle from './pages/Puzzle'
import Upload from './pages/Upload'


function App() {
  return (
    <BrowserRouter>  
      <nav>
        <Link to="/">Home</Link>
        <Link to="/library">Library</Link>
        <Link to="/login">Login</Link>
        <Link to="/puzzle">Puzzle</Link>
        <Link to="/upload">Upload</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="/login" element={<Login />} />
        <Route path="/puzzle" element={<Puzzle />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>


    </BrowserRouter>
  )
}

export default App
