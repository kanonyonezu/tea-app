import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeaf } from "@fortawesome/free-solid-svg-icons";
import { getTea } from "../api";
import { brewGuide, flavorText } from "../teaHelpers";

export default function TeaDetail() {
  const { id } = useParams();
  const [tea, setTea] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getTea(id)
      .then(setTea)
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return <p className="error">{error}</p>;
  }
  if (!tea) {
    return <p className="muted">Loading...</p>;
  }

  const mapQuery = encodeURIComponent(`${tea.name_en} tea shop`);

  return (
    <div className="tea-detail">
      <section className="card">
        <h1>{tea.name_en}</h1>
        <p className="muted">{flavorText(tea)}</p>
        <div className="tags">
          {(tea.category || []).map((category) => (
            <span key={category} className="tag">
              {category}
            </span>
          ))}
        </div>
        <div className="tea-image">
          <FontAwesomeIcon icon={faLeaf} size="4x" />
        </div>
        <h2>Best way to prepare</h2>
        <p>{brewGuide(tea)}</p>
      </section>

      <section className="card">
        <h2>Get {tea.name_en} near you</h2>
        <iframe
          className="map"
          title={`Map of shops for ${tea.name_en}`}
          src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
          loading="lazy"
        />
        <a
          className="button"
          href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
          target="_blank"
          rel="noreferrer"
        >
          Open in Google Maps
        </a>
      </section>
    </div>
  );
}
