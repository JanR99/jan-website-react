import React from 'react';
import { useParams, Link } from 'react-router-dom';
import '../App.css'; // Assuming the CSS file is the same

function Destination() {
    // Get the destination from the URL parameter
    const { destination } = useParams();

    // Define the image paths dynamically based on the destination
    const images = [
        `${destination}1-min.jpg`,
        `${destination}2-min.jpg`,
        `${destination}3-min.jpg`,
        `${destination}4-min.jpg`
    ];

    return (
        <div>
            {/* Header */}
            <header>
                <h1 className="header">{destination.charAt(0).toUpperCase() + destination.slice(1)}</h1>
            </header>

            {/* Back button */}
            <div className="back">
                <Link to="/">
                    <button>Zurück</button>
                </Link>
            </div>

            {/* Image container */}
            <div className="container">
                {images.slice(0, 2).map((image, index) => (
                    <div className="img-container" key={index}>
                        <a target="_blank" href={`/Bilder/Urlaub-normal/${image.replace('-min', '')}`} rel="noopener noreferrer">
                            <img src={`/Bilder/Urlaub-thumbnail/${image}`} alt={destination} />
                        </a>
                    </div>
                ))}
            </div>

            <div className="container">
                {images.slice(2, 4).map((image, index) => (
                    <div className="img-container" key={index}>
                        <a target="_blank" href={`/Bilder/Urlaub-normal/${image.replace('-min', '')}`} rel="noopener noreferrer">
                            <img src={`/Bilder/Urlaub-thumbnail/${image}`} alt={destination} />
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Destination;
