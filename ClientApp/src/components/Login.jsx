import React, { useState } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createAPIEndpoint, ENDPOINTS } from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await createAPIEndpoint(ENDPOINTS.LOGIN).create({ username, password });
      if (data?.ok) navigate("/Search");
      else setError("Invalid credentials");
    } catch (err) {
      setError(err?.response?.status === 401 ? "Invalid credentials" : "Login error");
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="row justify-content-md-center">
      <div className="col-md-6">
        
        <div className="card mt-3">
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="alert alert-primary text-center">Log in</div>

            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <label>Username:</label>
                <input className="form-control" value={username}
                  onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
              </div>
              <div className="mb-3">
                <label>Password:</label>
                <input className="form-control" type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
              </div>
              <Button variant="outlined" type="submit" disabled={loading}>
                {loading ? "Signing in…" : "Login"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
