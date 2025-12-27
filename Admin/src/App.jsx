import React, { useState, useEffect } from 'react';
import NavBar from "./components/NavBar";
import ListUsers from "./pages/ListUsers";
import Tax from "./pages/Tax";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

// eslint-disable-next-line react-refresh/only-export-components
export const backendUrl = import.meta.env.VITE_BACKEND_URL;

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token")); // Use state for token
  const navigate = useNavigate(); // Hook for navigating programmatically

  useEffect(() => {
    if (token === null) {
      navigate("/login"); // Redirect to login page when the token is cleared
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen">
      <ToastContainer />
      {token === null ? ( // Token check is done through state
        <Login setToken={setToken} />
      ) : (
        <>
          <NavBar setToken={setToken} />
          <hr />
          <div className="flex w-full">
            <Sidebar />
            <div className="w-[70%] mx-auto ml-[max(5vw, 25px)] my-8 text-gray-600 text-base">
              <Routes>
                <Route path="/list" element={<ListUsers />} />
                <Route path="/tax" element={<Tax />} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
