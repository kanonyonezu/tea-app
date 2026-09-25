import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeaf } from "@fortawesome/free-solid-svg-icons";
import { flavorText } from "../teaHelpers";

export default function TeaCard({ tea }) {
  return (
    <Link to={`/teas/${tea.id}`} className="card tea-card">
      <div>
        <h2>{tea.name_en}</h2>
        <p className="muted">{flavorText(tea)}</p>
      </div>
      <FontAwesomeIcon icon={faLeaf} className="tea-card-icon" size="2x" />
    </Link>
  );
}
