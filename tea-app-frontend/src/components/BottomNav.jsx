import { NavLink, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faMagnifyingGlass, faMugHot } from "@fortawesome/free-solid-svg-icons";
import { getLastRecommendationId } from "../api";

export default function BottomNav() {
  const location = useLocation();

  if (location.pathname === "/login") {
    return null;
  }

  const lastId = getLastRecommendationId();

  return (
    <nav className="bottom-nav">
      <NavLink to="/" end aria-label="Home">
        <FontAwesomeIcon icon={faHouse} size="lg" />
      </NavLink>
      <NavLink to="/teas" end aria-label="All teas">
        <FontAwesomeIcon icon={faMagnifyingGlass} size="lg" />
      </NavLink>
      {lastId && (
        <NavLink to={`/recommendations/${lastId}`} aria-label="My last recommendation">
          <FontAwesomeIcon icon={faMugHot} size="lg" />
        </NavLink>
      )}
    </nav>
  );
}
