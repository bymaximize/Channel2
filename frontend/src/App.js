import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar   from './components/Navbar';
import Home     from './pages/Home';
import Articles from './pages/Articles';
import Article  from './pages/Article';
import Write    from './pages/Write';
import Login    from './pages/Login';
import Signup   from './pages/Signup';
import Profile  from './pages/Profile';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"             element={<Home />} />
          <Route path="/articles"     element={<Articles />} />
          <Route path="/articles/:id" element={<Article />} />
          <Route path="/write"        element={<Write />} />
          <Route path="/login"        element={<Login />} />
          <Route path="/signup"       element={<Signup />} />
          <Route path="/profile"      element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
