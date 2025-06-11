import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Dashboard from "./components/Dashboard";
import MainLayout from "./components/MainLayout";
import NotFound from "./components/NotFound";
import "./index.css";

function ProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [auth, setAuth] = useState({ checked: false, isAuthenticated: false });

  useEffect(() => {
    axios
      .get("/api/auth/status", { withCredentials: true })
      .then((res) =>
        setAuth({ checked: true, isAuthenticated: res.data.isAuthenticated })
      )
      .catch(() => setAuth({ checked: true, isAuthenticated: false }));
  }, []);
  if (!auth.checked) return <div>Loading...</div>;
  return auth.isAuthenticated ? children : <Navigate to="/" />;
}

const App = () => {
  const [auth, setAuth] = useState(null);
  useEffect(() => {
    axios
      .get("/api/auth/status", { withCredentials: true })
      .then((res) => {setAuth(res.data.isAuthenticated)})
      .catch(() => setAuth(false));
      
  }, []);

  if (auth === null) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            auth ? <Navigate to="/dashboard" /> : <MainLayout />
          }
        />
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
