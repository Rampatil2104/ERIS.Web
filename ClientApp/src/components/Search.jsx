// ClientApp/src/components/Search.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAPIEndpoint, ENDPOINTS } from '../api';

export default function Search() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [district, setDistrict] = useState('');
  const [route, setRoute] = useState('');
  const [status, setStatus] = useState('Any');
  const navigate = useNavigate();

  useEffect(() => {
    createAPIEndpoint(ENDPOINTS.ASSESSMENTPROFILE).fetchAll()
      .then(res => setRows(res.data))
      .catch(e => setErr(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = rows.filter(r => {
    if (district && r.District !== district) return false;
    if (route && r.Route !== route) return false;
    if (status !== 'Any' && r.AssessmentStatus !== status) return false;
    return true;
  });

  if (loading) return <div className="p-3">Loading…</div>;
  if (err) return <div className="p-3 text-danger">Error: {err}</div>;

  return (
    <div className="container py-4">
      <div className="header-yellow mb-3">Search</div>

      <div className="card card-soft mb-3">
        <div className="card-body">
          <form className="row g-3" onSubmit={e=>e.preventDefault()}>
            <div className="col-sm-4">
              <label className="form-label">District</label>
              <input className="form-control" value={district} onChange={e=>setDistrict(e.target.value)} />
            </div>
            <div className="col-sm-4">
              <label className="form-label">Route</label>
              <input className="form-control" value={route} onChange={e=>setRoute(e.target.value)} />
            </div>
            <div className="col-sm-4">
              <label className="form-label">Status</label>
              <select className="form-select" value={status} onChange={e=>setStatus(e.target.value)}>
                <option value="Any">Any</option>
                <option>Not started</option>
                <option>Working</option>
                <option>Completed</option>
              </select>
            </div>
            <div className="col-12 d-flex gap-2">
              <button type="submit" className="btn btn-primary">Search</button>
              <button type="button" className="btn btn-outline-secondary"
                      onClick={()=>{ setDistrict(''); setRoute(''); setStatus('Any'); }}>
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card card-soft">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover table-sm mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>District</th>
                  <th>Route</th>
                  <th>Post Mile</th>
                  <th>Status</th>
                  <th>Created On</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.AssessmentID}
                      role="button"
                      onClick={()=>navigate(`/Details/${r.AssessmentID}`)}>
                    <td>{r.AssessmentID}</td>
                    <td>{r.District}</td>
                    <td>{r.Route}</td>
                    <td>{r.PostMile}</td>
                    <td>{r.AssessmentStatus}</td>
                    <td>{new Date(r.Date).toLocaleDateString()}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-muted text-center py-4">No results</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
