import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Library from './pages/Library'
import Login from './pages/Login'
import Puzzle from './pages/Puzzle'
import Create from './pages/Create'


function App() {
  return (
    <BrowserRouter>  {/*//this component wraps the entire application and enables routing functionality */}
      <nav>
        <Link to="/">Home</Link>
        <Link to="/library">Library</Link> {/*//display Library as a link, when clicked changes the URL to /library and renders the Library component without a full page reload */}
        <Link to="/login">Login</Link>
        <Link to="/puzzle">Puzzle</Link>
        <Link to="/create">Create</Link>
      </nav>

      <Routes> {/*//this component defines the different routes in the application and maps them to their corresponding components */}
       {/* When a Link is clicked, it changes the URL ex: "/" to "/login" without reloading the page. */}
      {/* React Router sees the URL changed, checks the Route list for a matching "path", and renders that Route's "element". */}
        
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<Library />} /> {/*//if the url matches /library, the Library component will be rendered */}
        <Route path="/login" element={<Login />} />
        <Route path="/puzzle" element={<Puzzle />} />
        <Route path="/create" element={<Create />} />
      </Routes>


    </BrowserRouter>
  )
}

export default App
