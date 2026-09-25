import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeaf, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import LevelSlider from "../components/LevelSlider";
import { createRecommendation, logout } from "../api";

const CAFFEINE_LEVELS = ["low", "moderate", "high"];
const BODY_LEVELS = ["light", "light-medium", "medium", "medium-full", "full"];
const FLAVORS = [
  "sweet",
  "floral",
  "honey",
  "fruity",
  "nutty",
  "roasted",
  "earthy",
  "creamy",
  "fresh",
  "smoky",
  "citrus",
  "malty",
];
const MAX_FLAVORS = 3;

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 18) {
    return "Good afternoon";
  }
  return "Good evening";
}

export default function Home() {
  const navigate = useNavigate();
  const [caffeine, setCaffeine] = useState(1);
  const [body, setBody] = useState(2);
  const [flavors, setFlavors] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleFlavor(flavor) {
    if (flavors.includes(flavor)) {
      setFlavors(flavors.filter((item) => item !== flavor));
    } else if (flavors.length < MAX_FLAVORS) {
      setFlavors([...flavors, flavor]);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (flavors.length === 0) {
      setError("Pick at least one flavor.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const recommendation = await createRecommendation({
        caffeine: CAFFEINE_LEVELS[caffeine],
        body: BODY_LEVELS[body],
        flavor: flavors,
      });
      navigate(`/recommendations/${recommendation.id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <form className="narrow stack" onSubmit={handleSubmit}>
      <button type="button" className="link-button logout" onClick={handleLogout}>
        Log out
      </button>
      <FontAwesomeIcon icon={faLeaf} className="logo" size="3x" />
      <div>
        <h1>{greeting()},</h1>
        <p className="lead">What do you feel like drinking today?</p>
      </div>
      <LevelSlider
        label="Energy"
        leftLabel="Calm"
        rightLabel="Energized"
        max={CAFFEINE_LEVELS.length - 1}
        value={caffeine}
        onChange={setCaffeine}
      />
      <LevelSlider
        label="Body"
        leftLabel="Light"
        rightLabel="Full"
        max={BODY_LEVELS.length - 1}
        value={body}
        onChange={setBody}
      />
      <fieldset className="flavors">
        <legend>Flavors (pick up to {MAX_FLAVORS})</legend>
        <div className="chips">
          {FLAVORS.map((flavor) => (
            <button
              type="button"
              key={flavor}
              className={flavors.includes(flavor) ? "chip chip-selected" : "chip"}
              onClick={() => toggleFlavor(flavor)}
            >
              {flavor}
            </button>
          ))}
        </div>
      </fieldset>
      {error && <p className="error">{error}</p>}
      <button className="button find-button" type="submit" disabled={loading}>
        {loading ? "Finding your tea..." : "Find my tea"}
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </button>
    </form>
  );
}
