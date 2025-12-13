import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Layout from '../components/Layout';

export default function SellerDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ leads: 0, quotes: 0, accepted: 0 });
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (user?.city) {
        const response = await api.get(`/enquiries?city=${user.city}&limit=5`);
        setEnquiries(response.data.enquiries);
        setStats({ leads: response.data.pagination.total, quotes: 0, accepted: 0 });
      }

      const quotesResponse = await api.get('/my-quotations?limit=5');
      setStats((prev) => ({
        ...prev,
        quotes: quotesResponse.data.pagination.total,
        accepted: quotesResponse.data.quotations.filter((q) => q.status === 'accepted').length,
      }));
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout user={user} logout={logout}>
      <div className="container-fluid">
        <h2 className="mb-4">Seller Dashboard</h2>

        <div className="row mb-4">
          <div className="col-md-4 mb-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Available Leads</h5>
                <h2>{stats.leads}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Quotes Submitted</h5>
                <h2>{stats.quotes}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Accepted</h5>
                <h2>{stats.accepted}</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Available Enquiries</h4>
          <Link to="/dashboard/seller/enquiries" className="btn btn-primary">
            View All
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="alert alert-info">
            {user?.city ? 'No enquiries available in your city.' : 'Please update your city in profile to see enquiries.'}
          </div>
        ) : (
          <div className="list-group">
            {enquiries.map((enquiry) => (
              <div key={enquiry.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5>{enquiry.title}</h5>
                    <p className="mb-1 text-muted">{enquiry.city}, {enquiry.state}</p>
                    <small className="text-muted">
                      {enquiry.quote_count} quotes • {new Date(enquiry.created_at).toLocaleDateString()}
                    </small>
                  </div>
                  <div>
                    <Link
                      to={`/dashboard/seller/enquiries/${enquiry.id}/quote`}
                      className="btn btn-sm btn-primary"
                    >
                      Submit Quote
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
