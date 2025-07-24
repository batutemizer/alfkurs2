import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import AdminLogin from './pages/AdminLogin'
import AdminPanel from './pages/AdminPanel'
import { CSSTransition, TransitionGroup } from 'react-transition-group'

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <TransitionGroup>
      <CSSTransition key={location.pathname} classNames="page" timeout={400}>
        <Routes location={location}>
          <Route path="/" element={<App />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  </React.StrictMode>
)
