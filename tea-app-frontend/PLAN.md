# Plan: build `tea-app-frontend` (React)

You are building a small React frontend for a tea recommendation app. Follow this plan **step by step, in order**. Every file you need is written out in full below. Copy the code **exactly**. Do not improvise.

---

## 0. Rules (read these first, follow them the whole time)

1. **Only create or change files inside `tea-app-frontend/`.** Never touch `tea-app-api/`, `docker-compose.yml`, the root `.gitignore`, or anything else outside `tea-app-frontend/`. If you think something outside needs to change, STOP and ask the user.
2. **Do not add code comments.** No `//` or `/* */` or `{/* */}` comments in any file. The code in this plan has none; keep it that way.
3. **Do not add libraries** other than the ones in Step 2. No TypeScript, no Tailwind, no axios, no Redux, no UI kits, no test libraries.
4. **Use plain JavaScript (`.js` / `.jsx`)** and **one plain CSS file** (`src/index.css`).
5. **Never run** `db:migrate`, `rails` commands, `docker` commands, or `git commit` / `git push`.
6. If a command fails, **stop and report the exact error**. Do not try random fixes.
7. Keep file names and folder names exactly as written here (case matters).
8. **Never create SVG icons from scratch.** No hand-written `<svg>` / `<path>` markup, no `.svg` icon files.
9. **Only use Font Awesome Free icons** (from `@fortawesome/free-solid-svg-icons`, used through `<FontAwesomeIcon />`). Do not use Pro icons or any other icon library. If you need an icon that is not in this plan, pick one from Font Awesome Free.

---

## 1. Background you need

### 1.1 Project layout

```
tea-app/                     <- repo root (working directory)
├── tea-app-api/             <- Rails API backend. DO NOT EDIT.
├── docker-compose.yml       <- DO NOT EDIT.
└── tea-app-frontend/        <- YOU CREATE THIS. All your work goes here.
```

### 1.2 The backend API (already exists, runs on `http://localhost:3000`)

All paths start with `/api/v1`.

| Method | Path | Needs login? | Request body | Response |
|---|---|---|---|---|
| POST | `/api/v1/login` | no | `{ "user": { "email": "...", "password": "..." } }` | `200` with JSON `{ "user": { "id", "email" } }`. **The JWT token is in the `Authorization` response header**, value looks like `Bearer eyJ...`. Wrong password → `401`. |
| DELETE | `/api/v1/logout` | yes | none | `204` |
| GET | `/api/v1/teas` | no | none | array of Tea objects |
| GET | `/api/v1/teas/:id` | no | none | one Tea object |
| POST | `/api/v1/recommendations` | yes | `{ "preferences": { "caffeine": "moderate", "body": "medium", "flavor": ["sweet", "floral"] } }` | `201` with `{ "id": 7, "user_id": 2, "tea_id": [9, 10, 11], ... }` |
| GET | `/api/v1/recommendations/:id` | yes | none | array of Tea objects |

"Needs login" means send the header `Authorization: Bearer eyJ...` (the exact string from the login response header). If the token is missing or expired the API returns `401`.

**Tea object:**
```json
{
  "id": 1,
  "name_en": "Jasmine Green Tea",
  "category": ["Green Tea"],
  "flavor_primary": "floral,sweet",
  "created_at": "...",
  "updated_at": "..."
}
```
- `category` is an array of strings. Could be `[]`.
- `flavor_primary` is a comma-separated string. Could be `null`.
- There is **no image, no description and no shop data** in the API. The frontend handles that (see 1.4).

**Allowed preference values** (these come from the ML model):
- `caffeine`: `"low"`, `"moderate"`, `"high"`
- `body`: `"light"`, `"light-medium"`, `"medium"`, `"medium-full"`, `"full"`
- `flavor`: array of 1 to 3 lowercase words, e.g. `"sweet"`, `"floral"`, `"honey"`, `"fruity"`, `"nutty"`, `"roasted"`, `"earthy"`, `"creamy"`, `"fresh"`, `"smoky"`, `"citrus"`, `"malty"`

**Dev test user:** email `test@mail.com`, password `secret`.

### 1.3 How the frontend talks to the backend (important)

The backend has **no CORS setup**, and we are not allowed to change it. So the frontend uses the **Vite dev server proxy**: the browser calls `/api/...` on the frontend's own address (`http://localhost:5173`), and Vite forwards it to `http://localhost:3000`. This means:
- In code, always call relative URLs like `/api/v1/teas`. **Never** write `http://localhost:3000` in React code.
- Because it is same-origin, the `Authorization` response header can be read normally.

### 1.4 Changes from the mockup (on purpose)

The mockup is a guide. These changes are needed to match the real API:

| Mockup | What we build instead | Why |
|---|---|---|
| "Mood level" slider (Happy–Stressed) | **"Energy" slider** (Calm – Energized) → sends `caffeine` | API needs `caffeine`, not mood |
| "Sweetness level" slider (Sweet–Bitter) | **"Body" slider** (Light – Full) → sends `body`, plus **flavor chips** (pick 1–3) → sends `flavor` | API needs `body` and `flavor` |
| Person avatar photos | A leaf icon | Those were placeholders; the API has no images |
| Tea photo | A leaf icon in a tinted box | No images in the API |
| "Best way to prepare" text | A short brewing guide picked from the tea's category, stored in the frontend | No description in the API |
| Map with shop pins + "Shop A / go to shop" popup | A Google Maps embed searching for the tea, plus an "Open in Google Maps" button | API does not expose shops yet (see section 7) |
| No login screen | A simple **Login page** | Recommendations require a logged-in user |
| Bottom nav: home / search / cup | Home → `/`, Search → `/teas` (list of all teas with a search box), Cup → your last recommendation | Gives each icon a real job |
| "Good morning," always | "Good morning / afternoon / evening" based on time | Small polish |

### 1.5 Pages and routes

| Route | Page file | Login required? | What it shows |
|---|---|---|---|
| `/login` | `pages/Login.jsx` | no | Email + password form |
| `/` | `pages/Home.jsx` | yes | Greeting, Energy slider, Body slider, flavor chips, "Find my tea" button, "Log out" link |
| `/recommendations/:id` | `pages/Recommendation.jsx` | yes | "We recommend these teas for you" + list of tea cards |
| `/teas` | `pages/TeaList.jsx` | no | Search box + all tea cards |
| `/teas/:id` | `pages/TeaDetail.jsx` | no | Tea card (name, flavors, tags, image, how to prepare) + map card |
| anything else | redirect to `/` | | |

The bottom nav is shown on every page **except** `/login`.

---

## 2. Create the project and install packages

Requires Node.js 20 or newer. Check with `node -v`. If it is older, STOP and tell the user.

We create files by hand (not with `npm create vite`) so there are no interactive prompts.

Run from the repo root:

```bash
mkdir -p tea-app-frontend/src/components tea-app-frontend/src/pages
```

Now create `tea-app-frontend/package.json` with exactly this content:

```json
{
  "name": "tea-app-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

Then install packages (run inside `tea-app-frontend/`):

```bash
cd tea-app-frontend
npm install react react-dom react-router-dom @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome
npm install --save-dev vite @vitejs/plugin-react
```

Icons used in this app (all Font Awesome Free, solid style):

| Icon | Import name | Where |
|---|---|---|
| house | `faHouse` | bottom nav: Home |
| magnifying glass | `faMagnifyingGlass` | bottom nav: All teas, "Find my tea" button |
| hot mug | `faMugHot` | bottom nav: last recommendation |
| leaf | `faLeaf` | logo, tea cards, tea image placeholder |

Usage pattern:

```jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeaf } from "@fortawesome/free-solid-svg-icons";

<FontAwesomeIcon icon={faLeaf} size="3x" />
```

After this, `package.json` will have `dependencies` and `devDependencies` added by npm. That is expected. Do not edit them by hand.

---

## 3. Config and root files

### 3.1 `tea-app-frontend/.gitignore`

```
node_modules
dist
.DS_Store
```

### 3.2 `tea-app-frontend/vite.config.js`

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
```

### 3.3 `tea-app-frontend/index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#f6ecdf" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
    <title>Tea App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### 3.4 `tea-app-frontend/README.md`

````markdown
# Tea App Frontend

React frontend for the tea recommendation app.

## Run it

1. Start the Rails API on http://localhost:3000 (and the ML API on port 8000).
2. In this folder:

```bash
npm install
npm run dev
```

3. Open http://localhost:5173 and log in with `test@mail.com` / `secret`.

Requests to `/api` are forwarded to the Rails API by the Vite dev server (see `vite.config.js`).
````

---

## 4. Source files

Create every file below inside `tea-app-frontend/src/`. Final structure:

```
src/
├── main.jsx
├── App.jsx
├── api.js
├── teaHelpers.js
├── index.css
├── components/
│   ├── BottomNav.jsx
│   ├── LevelSlider.jsx
│   ├── RequireLogin.jsx
│   └── TeaCard.jsx
└── pages/
    ├── Home.jsx
    ├── Login.jsx
    ├── Recommendation.jsx
    ├── TeaDetail.jsx
    └── TeaList.jsx
```

### 4.1 `src/main.jsx`

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
```

### 4.2 `src/App.jsx`

```jsx
import { Navigate, Route, Routes } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import RequireLogin from "./components/RequireLogin";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Recommendation from "./pages/Recommendation";
import TeaDetail from "./pages/TeaDetail";
import TeaList from "./pages/TeaList";

export default function App() {
  return (
    <>
      <main className="page">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <RequireLogin>
                <Home />
              </RequireLogin>
            }
          />
          <Route
            path="/recommendations/:id"
            element={
              <RequireLogin>
                <Recommendation />
              </RequireLogin>
            }
          />
          <Route path="/teas" element={<TeaList />} />
          <Route path="/teas/:id" element={<TeaDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </>
  );
}
```

### 4.3 `src/api.js`

All backend calls live here. Pages never call `fetch` directly.

```js
const TOKEN_KEY = "token";
const LAST_RECOMMENDATION_KEY = "lastRecommendationId";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function getLastRecommendationId() {
  return localStorage.getItem(LAST_RECOMMENDATION_KEY);
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const token = getToken();
  if (token) {
    headers.Authorization = token;
  }

  const response = await fetch(`/api/v1${path}`, { ...options, headers });

  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = "/login";
    throw new Error("Please log in again.");
  }
  if (!response.ok) {
    throw new Error("Something went wrong. Please try again.");
  }
  return response.json();
}

export async function login(email, password) {
  const response = await fetch("/api/v1/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ user: { email, password } }),
  });

  if (!response.ok) {
    throw new Error("Wrong email or password.");
  }
  localStorage.setItem(TOKEN_KEY, response.headers.get("Authorization"));
}

export async function logout() {
  const token = getToken();
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LAST_RECOMMENDATION_KEY);
  await fetch("/api/v1/logout", {
    method: "DELETE",
    headers: { Authorization: token },
  }).catch(() => {});
}

export function getTeas() {
  return request("/teas");
}

export function getTea(id) {
  return request(`/teas/${id}`);
}

export async function createRecommendation(preferences) {
  const recommendation = await request("/recommendations", {
    method: "POST",
    body: JSON.stringify({ preferences }),
  });
  localStorage.setItem(LAST_RECOMMENDATION_KEY, recommendation.id);
  return recommendation;
}

export function getRecommendation(id) {
  return request(`/recommendations/${id}`);
}
```

Notes for you (do not put these in the code):
- `logout` returns `204 No Content`, which has no JSON body, so it uses `fetch` directly instead of `request`.
- `login` also uses `fetch` directly, so a wrong password shows an error instead of redirecting.

### 4.4 `src/teaHelpers.js`

```js
const BREW_GUIDES = [
  {
    keyword: "green",
    text: "Use water around 75–80°C, not boiling. Steep 1 teaspoon of leaves per cup for 2–3 minutes. Hotter water or a longer steep makes it bitter.",
  },
  {
    keyword: "white",
    text: "Use water around 80–85°C. Steep 2 teaspoons of leaves per cup for 4–5 minutes. It is gentle, so you can steep it a little longer if you like.",
  },
  {
    keyword: "yellow",
    text: "Use water around 75–80°C. Steep 1 teaspoon of leaves per cup for 2–3 minutes.",
  },
  {
    keyword: "oolong",
    text: "Use water around 85–95°C. Steep 1 teaspoon of leaves per cup for 3–5 minutes. Good oolong can be steeped several times.",
  },
  {
    keyword: "black",
    text: "Use freshly boiled water. Steep 1 teaspoon of leaves per cup for 3–5 minutes. Add milk or sugar if you like.",
  },
  {
    keyword: "dark",
    text: "Rinse the leaves with boiling water first and pour it away. Then steep in boiling water for 2–4 minutes. It can be steeped many times.",
  },
  {
    keyword: "herbal",
    text: "Use freshly boiled water. Steep for 5–7 minutes. Herbal teas do not get bitter, so a longer steep is fine.",
  },
];

const DEFAULT_BREW_GUIDE =
  "Use water around 85°C. Steep 1 teaspoon of leaves per cup for about 3 minutes, then taste and adjust.";

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function flavorText(tea) {
  if (!tea.flavor_primary) {
    return "";
  }
  return tea.flavor_primary
    .split(",")
    .map((word) => word.trim())
    .filter((word) => word !== "")
    .map(capitalize)
    .join(", ");
}

export function brewGuide(tea) {
  const categories = (tea.category || []).join(" ").toLowerCase();
  const guide = BREW_GUIDES.find((item) => categories.includes(item.keyword));
  return guide ? guide.text : DEFAULT_BREW_GUIDE;
}
```

### 4.5 `src/components/RequireLogin.jsx`

```jsx
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../api";

export default function RequireLogin({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
```

### 4.6 `src/components/BottomNav.jsx`

`useLocation()` is called so the nav re-renders when the page changes (this keeps the "last recommendation" link up to date).

```jsx
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
```

### 4.7 `src/components/LevelSlider.jsx`

```jsx
export default function LevelSlider({ label, leftLabel, rightLabel, max, value, onChange }) {
  return (
    <label className="slider">
      <span>{label}</span>
      <input
        type="range"
        min={0}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="slider-ends">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </span>
    </label>
  );
}
```

### 4.8 `src/components/TeaCard.jsx`

The whole card is a link to the tea's page.

```jsx
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
```

### 4.9 `src/pages/Login.jsx`

```jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeaf } from "@fortawesome/free-solid-svg-icons";
import { login } from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="narrow">
      <FontAwesomeIcon icon={faLeaf} className="logo" size="3x" />
      <h1 className="center">Welcome</h1>
      <p className="muted center">Log in to find your tea.</p>
      <form className="stack" onSubmit={handleSubmit}>
        <label className="field">
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className="field">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
    </div>
  );
}
```

### 4.10 `src/pages/Home.jsx`

```jsx
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
```

### 4.11 `src/pages/Recommendation.jsx`

```jsx
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
```

### 4.12 `src/pages/TeaList.jsx`

```jsx
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
```

### 4.13 `src/pages/TeaDetail.jsx`

```jsx
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
```

### 4.14 `src/index.css`

Mobile-first: the base styles are for phones. `@media (min-width: ...)` blocks add tablet and desktop layouts.

Colors are taken from the mockup: cream background, slightly lighter cards, thin beige borders, dark text, white bottom nav, and the soft green from the "Shop A" popup as the accent.

```css
:root {
  --bg: #f6ecdf;
  --card: #faf4ec;
  --border: #e4d6c3;
  --text: #1f1f1f;
  --muted: #6b6b6b;
  --accent: #c5d9a0;
  --accent-dark: #4f6b2a;
  --white: #ffffff;
  --error: #b3261e;
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  color: var(--text);
  background: var(--bg);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
}

h1 {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.25;
  margin: 0 0 16px;
}

h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 8px;
}

p {
  line-height: 1.5;
  margin: 0 0 12px;
}

a {
  color: inherit;
}

.page {
  max-width: 480px;
  margin: 0 auto;
  padding: 32px 20px 112px;
}

.narrow {
  max-width: 400px;
  margin: 0 auto;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.center {
  text-align: center;
}

.muted {
  color: var(--muted);
}

.error {
  color: var(--error);
  margin: 0;
}

.lead {
  font-size: 1.125rem;
  margin: 0;
}

.logo {
  display: block;
  margin: 0 auto 16px;
  color: var(--accent-dark);
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: 1px solid var(--text);
  border-radius: 999px;
  background: var(--text);
  color: var(--white);
  font: inherit;
  text-decoration: none;
  cursor: pointer;
}

.button:disabled {
  opacity: 0.6;
  cursor: default;
}

.button-outline {
  background: transparent;
  color: var(--text);
}

.link-button {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: var(--muted);
  text-decoration: underline;
  cursor: pointer;
}

.logout {
  align-self: flex-end;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field input,
.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--white);
  font: inherit;
}

.search-input {
  margin-bottom: 20px;
}

.slider {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slider input {
  width: 100%;
  accent-color: var(--text);
}

.slider-ends {
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  font-size: 0.875rem;
}

.flavors {
  border: none;
  padding: 0;
  margin: 0;
}

.flavors legend {
  padding: 0;
  margin-bottom: 8px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  padding: 8px 14px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--white);
  font: inherit;
  font-size: 0.875rem;
  text-transform: capitalize;
  cursor: pointer;
}

.chip-selected {
  background: var(--accent);
  border-color: var(--accent-dark);
}

.find-button {
  align-self: center;
}

.card {
  display: block;
  padding: 20px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  text-decoration: none;
}

.card-list {
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
}

.tea-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.tea-card:hover {
  border-color: var(--text);
}

.tea-card p {
  margin: 0;
}

.tea-card-icon {
  flex-shrink: 0;
  color: var(--accent-dark);
}

.tea-detail {
  display: grid;
  gap: 20px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.tag {
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--accent);
  font-size: 0.8rem;
}

.tea-image {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 160px;
  margin-bottom: 20px;
  border-radius: 12px;
  background: var(--bg);
  color: var(--accent-dark);
}

.map {
  display: block;
  width: 100%;
  height: 240px;
  margin-bottom: 16px;
  border: 0;
  border-radius: 12px;
}

.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-around;
  padding: 12px 0 calc(12px + env(safe-area-inset-bottom));
  background: var(--white);
  border-top: 1px solid var(--border);
}

.bottom-nav a {
  display: flex;
  padding: 8px 20px;
  border-radius: 999px;
  color: var(--muted);
}

.bottom-nav a.active {
  color: var(--text);
  background: var(--bg);
}

@media (min-width: 768px) {
  .page {
    max-width: 720px;
    padding-top: 48px;
  }

  h1 {
    font-size: 2rem;
  }

  .card-list {
    grid-template-columns: repeat(2, 1fr);
  }

  .bottom-nav {
    justify-content: center;
    gap: 64px;
  }
}

@media (min-width: 1024px) {
  .page {
    max-width: 960px;
  }

  .card-list {
    grid-template-columns: repeat(3, 1fr);
  }

  .tea-detail {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }

  .map {
    height: 320px;
  }
}
```

---

## 5. Check your work

### 5.1 Build check (must pass)

Inside `tea-app-frontend/`:

```bash
npm run build
```

It must finish with no errors. If it fails, read the error, fix the file it names (usually a typo or wrong import path), and run it again. Then delete the build output with `rm -rf dist` (it is git-ignored anyway).

### 5.2 Comment check (must pass)

```bash
grep -rn -E '//|/\*|\{/\*' src
```

The only allowed hits are URLs containing `https://`. If there are any real comments, remove them.

### 5.3 Run it

```bash
npm run dev
```

Open `http://localhost:5173`. The Rails API must be running on port 3000 for data to load. If it is not running, pages will show "Something went wrong" — that is OK for a quick visual check, but tell the user.

### 5.4 Manual test checklist

Do each step and confirm the result:

1. Go to `http://localhost:5173/` while logged out → you are sent to `/login`. No bottom nav on this page.
2. Log in with a wrong password → red "Wrong email or password." message.
3. Log in with `test@mail.com` / `secret` → you land on Home. Bottom nav shows the home and search icons.
4. Home: greeting matches the time of day. Energy slider has 3 stops. Body slider has 5 stops.
5. Click "Find my tea" without choosing a flavor → "Pick at least one flavor."
6. Select 4 flavor chips → only 3 get selected. Click a selected chip → it unselects.
7. Pick flavors and click "Find my tea" → button says "Finding your tea...", then you land on `/recommendations/<id>` with tea cards. A cup icon now appears in the bottom nav.
8. Click a tea card → tea page with name, flavors, category tags, leaf image box, "Best way to prepare", and a map.
9. Click the search icon → `/teas` shows all teas. Type in the search box → list filters by name.
10. Click the cup icon → back to your last recommendation.
11. Click "Log out" on Home → you go to `/login`. Going to `/` sends you back to `/login`.
12. **Responsive check** in browser dev tools (toggle device toolbar):
    - 375px wide (phone): one column of cards, nothing overflows sideways, bottom nav doesn't cover content.
    - 768px (tablet): cards in 2 columns.
    - 1280px (desktop): cards in 3 columns; tea page shows the two cards side by side.

### 5.5 Report back

Tell the user:
- which checks passed,
- anything that failed, with the exact error text,
- confirm you did not change any files outside `tea-app-frontend/`.

---

## 6. Known backend issues (DO NOT FIX — just mention them to the user)

These are outside the frontend. Only the user can decide whether to change them.

1. **ML API must be running:** the Rails API calls the ML API at `http://host.docker.internal:8000`. If "Find my tea" shows "Something went wrong", check that the ML API is running on port 8000.
2. **ML API down → 500 error:** if the ML call fails, the backend crashes instead of returning a clean error. The frontend already shows a generic error message in this case.
3. **Recommendations are not owner-checked:** any logged-in user can view any `/recommendations/:id`.

---

## 7. Future work (needs backend changes — ask the user first, do not do now)

- **Real shops on the map** (mockup "Tea Show Page - 2", the "Shop A / go to shop" popup): needs a new API endpoint such as `GET /api/v1/teas/:id/shops` returning shops with `name`, `address`, `latitude`, `longitude`. Then the frontend can use a map library (e.g. Leaflet) to show pins with popups.
- **Tea images and descriptions:** needs new columns on `teas`.
- **Sign up page:** needs a JSON registrations endpoint.
- **Production deploy / Docker service for the frontend:** needs a change to `docker-compose.yml` and CORS (or a reverse proxy) on the backend.
