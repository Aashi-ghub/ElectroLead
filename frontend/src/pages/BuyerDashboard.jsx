import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Layout from '../components/Layout';

export default function BuyerDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ active: 0, total: 0, quotes: 0 });
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/enquiries/my-enquiries?limit=5');
      setEnquiries(response.data.enquiries);
      setStats({
        active: response.data.enquiries.filter((e) => e.status === 'open').length,
        total: response.data.pagination.total,
        quotes: response.data.enquiries.reduce((sum, e) => sum + parseInt(e.quote_count || 0), 0),
      });
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout user={user} logout={logout}>
      <div className="container-fluid">
        <h2 className="mb-4">Buyer Dashboard</h2>

        <div className="row mb-4">
          <div className="col-md-4 mb-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Active Enquiries</h5>
                <h2>{stats.active}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Total Enquiries</h5>
                <h2>{stats.total}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Quotes Received</h5>
                <h2>{stats.quotes}</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Recent Enquiries</h4>
          <Link to="/dashboard/buyer/create-enquiry" className="btn btn-primary">
            <i className="bi bi-plus-circle"></i> Create Enquiry
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="alert alert-info">No enquiries yet. Create your first enquiry!</div>
        ) : (
          <div className="list-group">
            {enquiries.map((enquiry) => (
              <div key={enquiry.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5>{enquiry.title}</h5>
                    <p className="mb-1 text-muted">{enquiry.city}, {enquiry.state}</p>
                    <small className="text-muted">
                      {enquiry.quote_count} quotes • Created {new Date(enquiry.created_at).toLocaleDateString()}
                    </small>
                  </div>
                  <div>
                    <span className={`badge ${enquiry.status === 'open' ? 'bg-success' : 'bg-secondary'}`}>
                      {enquiry.status}
                    </span>
                    <Link
                      to={`/dashboard/buyer/enquiries/${enquiry.id}`}
                      className="btn btn-sm btn-outline-primary ms-2"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3">
          <Link to="/dashboard/buyer/enquiries" className="btn btn-outline-primary">
            View All Enquiries
          </Link>
        </div>
      </div>
    </Layout>
  );
}



