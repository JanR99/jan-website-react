import { Link } from "react-router-dom";
import { ArrowRight, Images } from "lucide-react";
import TravelController from "../../controller/TravelController";
import { TravelFolder } from "../../types/Travel";
import { folderCountry, photoCountLabel, travelFolderPath } from "../../utils/travel";
import "../../styles/Travel.css";

/** A folder of the travel diary as a card with its cover photo, used on the home page and in the diary. */
export default function TravelFolderCard({ folder }: { folder: TravelFolder }) {
    const country = folderCountry(folder);

    return (
        <Link to={travelFolderPath(folder)} className="destination-card">
            {folder.coverPhotoId !== null ? (
                <img src={TravelController.photoUrl(folder.coverPhotoId)} alt={folder.name} loading="lazy" />
            ) : (
                <span className="destination-card-empty" aria-hidden="true">
                    <Images size={40} />
                </span>
            )}
            <div className="destination-card-body">
                {country && <span className="destination-card-country">{country}</span>}
                <h3>{folder.name}</h3>
                <span className="destination-card-cta">
                    {photoCountLabel(folder.photoIds.length)} <ArrowRight size={16} />
                </span>
            </div>
        </Link>
    );
}
