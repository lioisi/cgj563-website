import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import ValueProposition from './components/ValueProposition';
import Services from './components/Services';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';

function App() {
  const [page, setPage] = useState('home');

  useEffect(() => {
    // Detectar ruta por hash
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'home';
      setPage(hash);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Página del dashboard
  if (page === 'dashboard') {
    return (
      <div className="app">
        <Header />
        <Dashboard />
        <Footer />
      </div>
    );
  }

  // Página principal
  return (
    <div className="app">
      <Header />
      <Hero />
      <ValueProposition />
      <Services />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
