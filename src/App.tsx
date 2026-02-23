import React from 'react';
import { HashRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css';
import Cookbook from './components/Cookbook';
import Home from './components/Home';
import Destination from './components/Destination';
import RecipePage from './components/RecipePage';

const App: React.FC = () => {
    return (
        <Router>
            <div>
                {/* Routes */}
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/cookbook" element={<Cookbook />} />
                    <Route path="/destination/:destination" element={<Destination />} />
                    <Route path="/cookbook/:recipeTitle" element={<RecipePage />} />
                </Routes>
            </div>
        </Router>
    );
}
export default App;