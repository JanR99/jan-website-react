import { Link } from "react-router-dom";
import { Images } from "lucide-react";
import TravelController from "../../controller/TravelController";
import { TravelFolder } from "../../types/Travel";
import { folderSubtitle, travelFolderPath } from "../../utils/travel";
import "../../styles/Destination.css";

/** A small tile that leads to a trip: its cover photo, its name and below it country and time. */
export default function TravelFolderLink({ folder }: { folder: TravelFolder }) {
    const subtitle = folderSubtitle(folder);
    return (
        <Link to={travelFolderPath(folder)} className="other-destination">
            {folder.coverPhotoId !== null ? (
                <img src={TravelController.photoUrl(folder.coverPhotoId)} alt="" loading="lazy" />
            ) : (
                <span className="other-destination-empty" aria-hidden="true"><Images size={22} /></span>
            )}
            <span>
                <strong>{folder.name}</strong>
                {subtitle && <small>{subtitle}</small>}
            </span>
        </Link>
    );
}
