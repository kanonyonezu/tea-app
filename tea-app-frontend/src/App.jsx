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
