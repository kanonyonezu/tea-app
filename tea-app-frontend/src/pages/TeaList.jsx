import { useEffect, useState } from "react";
import TeaCard from "../components/TeaCard";
import { getTeas } from "../api";

export default function TeaList() {
  const [teas, setTeas] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTeas()
      .then(setTeas)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredTeas = teas.filter((tea) =>
    tea.name_en.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1>All teas</h1>
      <input
        className="search-input"
        type="search"
        placeholder="Search teas"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && filteredTeas.length === 0 && <p className="muted">No teas found.</p>}
      <div className="card-list">
        {filteredTeas.map((tea) => (
          <TeaCard key={tea.id} tea={tea} />
        ))}
      </div>
    </div>
  );
}
