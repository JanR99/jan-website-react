import React from 'react';
import { useParams } from 'react-router-dom';
import '../App.css';

interface DestinationParams {
    destination?: string;
}

const Destination: React.FC = () => {
    const { destination } = useParams<DestinationParams>();

    if (!destination) {
        return <p>Destination not found.</p>;
    }

    const images = [
        `${destination}1-min.jpg`,
        `${destination}2-min.jpg`,
        `${destination}3-min.jpg`,
        `${destination}4-min.jpg`,
    ];

    // Split images into chunks of 2 for easy rendering
    const chunkSize = 2;
    const imageChunks: string[][] = [];
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
                            <a
                                href={`/Bilder/Urlaub-normal/${image.replace('-min', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img
                                    src={`/Bilder/Urlaub-thumbnail/${image}`}
                                    alt={destination}
                                />
                            </a>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default Destination;
