import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Cookbook from './components/Cookbook';
import Home from './components/Home';
import Destination from './components/Destination';
import Category from './components/Category';
import Recipe from './components/Recipe';

export default function App() {
    return (
        <Router>
            <div>
                {/* Header */}
                <header>
                    <h1 className="header">Willkommen auf meiner Website</h1>
                </header>

                {/* Navigation Bar */}
                <div className="top">
                    <Link to="/" className="button-link">Jans Website</Link>
                    <Link to="/cookbook" className="button-link">Mein Kochbuch</Link>
                </div>

                {/* Routes to display other pages */}
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/cookbook" element={<Cookbook />} />
                    <Route path="/destination/:destination" element={<Destination />} />
                    <Route path="/cookbook/:category" element={<Category />} />
                    <Route path="/cookbook/:category/:recipeTitle" element={<Recipe />} />
                </Routes>
            </div>
        </Router>
    );
}
