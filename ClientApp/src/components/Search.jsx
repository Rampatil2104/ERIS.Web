import React, { useEffect, useState } from "react";
import { createAPIEndpoint, ENDPOINTS } from "../api";

export default function Search() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    createAPIEndpoint(ENDPOINTS.ASSESSMENTPROFILE)
      .fetchAll()
      .then(({ data }) => setRows(Array.isArray(data) ? data : []))
      .catch((e) => setErr(e?.response?.status ? `Error ${e.response.status}` : "Network error"));
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Search</h2>
      {err && <div className="alert alert-danger">{err}</div>}
      <pre>{JSON.stringify(rows, null, 2)}</pre>
    </div>
  );
}
