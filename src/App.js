import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Cookbook from './components/Cookbook';
import Links from './components/Links';
import Home from './components/Home';
import Destination from './components/Destination';
import Asiatisch from './components/Asiatisch';
import Recipe from './components/Recipe';


function App() {
    return (
        <Router>
            <div>
                {/* Header */}
                <header>
                    <h1 className="header">Willkommen auf meiner Website</h1>
                </header>

                {/* Navigation Bar */}
                <div className="top">
                    {/* Use Link instead of buttons with onClick */}
                    <Link to="/" className="button-link">Jans Website</Link>
                    <Link to="/cookbook" className="button-link">Mein Kochbuch</Link>
                    <Link to="/links" className="button-link">Links</Link>
                </div>

                {/* Routes to display other pages */}
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/cookbook" element={<Cookbook />} />
                    <Route path="/links" element={<Links />} />
                    <Route path="/destination/:destination" element={<Destination />} />
                    <Route path="/cookbook/asiatisch" element={<Asiatisch />} />
                    <Route path="/recipe/:recipeTitle" element={<Recipe />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
