import React from 'react';
import { useParams} from 'react-router-dom';
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

    // Split the images into chunks of 2 for easy rendering
    const chunkSize = 2;
    const imageChunks = [];
    for (let i = 0; i < images.length; i += chunkSize) {
        imageChunks.push(images.slice(i, i + chunkSize));
    }

    return (
        <div>
            {/* Header */}
            <header>
                <h1 className="header">{destination.charAt(0).toUpperCase() + destination.slice(1)}</h1>
            </header>

            {/* Image containers */}
            {imageChunks.map((chunk, chunkIndex) => (
                <div className="container" key={chunkIndex}>
                    {chunk.map((image, index) => (
                        <div className="img-container" key={index}>
                            <a target="_blank" href={`/Bilder/Urlaub-normal/${image.replace('-min', '')}`} rel="noopener noreferrer">
                                <img src={`/Bilder/Urlaub-thumbnail/${image}`} alt={destination} />
                            </a>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default Destination;
