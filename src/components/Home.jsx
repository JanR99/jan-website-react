import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

export default function Home() {
    return (
        <div>
            <div className="container">
                <div className="img-container">
                    <Link to="/destination/Andorra">
                        <img
                            src={"Bilder/Urlaub-thumbnail/Andorra1-min.jpg"}
                            alt="Andorra"
                        />
                    </Link>
                </div>
                <div className="img-container">
                    <Link to="/destination/Porto">
                        <img
                            src={"Bilder/Urlaub-thumbnail/Porto1-min.jpg"}
                            alt="Porto"
                        />
                    </Link>
                </div>
            </div>

            <div className="container">
                <div className="img-container">
                    <Link to="/destination/Prag">
                        <img
                            src={"Bilder/Urlaub-thumbnail/Prag1-min.jpg"}
                            alt="Prag"
                        />
                    </Link>
                </div>
                <div className="img-container">
                    <Link to="/destination/Spanien">
                        <img
                            src={"Bilder/Urlaub-thumbnail/Spanien1-min.jpg"}
                            alt="Spanien"
                        />
                    </Link>
                </div>
            </div>
        </div>
    );
}
