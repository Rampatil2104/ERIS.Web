// ClientApp/src/components/Search.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Search() {
  const [q, setQ] = useState({ district: '', route: '', status: '' });
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: replace with real API call.
    setRows([
      { id:'P-1001', district:'Sacramento', route:'I-80', postMile:1.2, status:'Working', createdOn:'2022-05-09T12:00:00Z' },
      { id:'P-1002', district:'Fresno', route:'SR-99', postMile:8.5, status:'Submitted', createdOn:'2022-06-01T12:00:00Z' }
    ]);
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    // TODO: call backend with 'q' filters
  };

  return (
    <div className="container py-4">
      <div className="header-yellow mb-3">Search</div>

      <div className="card card-soft mb-3">
        <div className="card-body">
          <form className="row g-3" onSubmit={onSearch}>
            <div className="col-sm-4">
              <label className="form-label">District</label>
              <input className="form-control"
                     value={q.district}
                     onChange={e=>setQ({...q, district: e.target.value})}/>
            </div>
            <div className="col-sm-4">
              <label className="form-label">Route</label>
              <input className="form-control"
                     value={q.route}
                     onChange={e=>setQ({...q, route: e.target.value})}/>
            </div>
            <div className="col-sm-4">
              <label className="form-label">Status</label>
              <select className="form-select"
                      value={q.status}
                      onChange={e=>setQ({...q, status: e.target.value})}>
                <option value="">Any</option>
                <option>Submitted</option>
                <option>Working</option>
                <option>Completed</option>
              </select>
            </div>

            <div className="col-12 d-flex gap-2">
              <button type="submit" className="btn btn-primary">Search</button>
              <button type="button" className="btn btn-outline-secondary"
                      onClick={()=>setQ({ district:'', route:'', status:'' })}>
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
                  <th>Project ID</th>
                  <th>District</th>
                  <th>Route</th>
                  <th>Post Mile</th>
                  <th>Status</th>
                  <th>Created On</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} role="button" onClick={()=>navigate(`/details/${r.id}`)}>
                    <td>{r.id}</td>
                    <td>{r.district}</td>
                    <td>{r.route}</td>
                    <td>{r.postMile}</td>
                    <td>{r.status}</td>
                    <td>{new Date(r.createdOn).toLocaleDateString()}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
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
