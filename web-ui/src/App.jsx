import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import Library from './pages/Library'
import Login from './pages/Login'
import Puzzle from './pages/Puzzle'
import Create from './pages/Create'
import logo from './assets/cube.png'


function App() {
  return (
    <BrowserRouter>  {/*//this component wraps the entire application and enables routing functionality */}
      <header className="site-header">
        <nav className="site-nav" aria-label="Main navigation">
          <Link className="brand" to="/" aria-label="Crossy Word home">
            <img src={logo} alt="" />
            <span>Crossy <span className="brand-accent">Word</span></span>
          </Link>

          <div className="nav-links">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/puzzle" state={{ title: 'Demo Puzzle' }}>Demo</NavLink>
            <NavLink to="/create">Create</NavLink>
            <NavLink to="/library">Collection</NavLink>
          </div>

          <Link className="nav-account" to="/login">Sign in</Link>
        </nav>
      </header>

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
