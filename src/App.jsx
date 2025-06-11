import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Dashboard from "./components/Dashboard";
import MainLayout from "./components/MainLayout";
import NotFound from "./components/NotFound";
import "./index.css";

function ProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    axios
      .get("/api/auth/status", { withCredentials: true })
      .then((res) => {
        setAuth(res.data.isAuthenticated);
        setIsLoading(false);
      })
      .catch(() => {
        setAuth(false);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <div>Loading...</div>;
  return auth ? children : <Navigate to="/" />;
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;