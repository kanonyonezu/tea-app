import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import TeaCard from "../components/TeaCard";
import { getRecommendation } from "../api";

export default function Recommendation() {
  const { id } = useParams();
  const [teas, setTeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getRecommendation(id)
      .then(setTeas)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="muted">Loading...</p>;
  }
  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div>
      <h1>We recommend these teas for you</h1>
      {teas.length === 0 ? (
        <p>We couldn't find a match this time.</p>
      ) : (
        <div className="card-list">
          {teas.map((tea) => (
            <TeaCard key={tea.id} tea={tea} />
          ))}
        </div>
      )}
      <Link to="/" className="button button-outline">
        Try different choices
      </Link>
    </div>
  );
}
