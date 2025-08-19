import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import Search from "./components/Search";
import Details from "./components/Details";
import Edit from "./components/Edit";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* default -> /Login */}
        <Route index element={<Navigate to="/Login" replace />} />

        {/* pages */}
        <Route path="/Login" element={<Login />} />
        <Route path="/Search" element={<Search />} />
        <Route path="/Details/:id" element={<Details />} />
        <Route path="/Edit/:id" element={<Edit />} />

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/Login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
