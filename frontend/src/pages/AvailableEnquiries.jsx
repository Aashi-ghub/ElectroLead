import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Layout from '../components/Layout';

export default function AvailableEnquiries() {
  const { user, logout } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.city) {
      fetchEnquiries();
    } else {
      setError('Please update your city in profile to see enquiries.');
      setLoading(false);
    }
  }, [user]);

  const fetchEnquiries = async () => {
    try {
      const response = await api.get(`/enquiries?city=${user.city}&limit=20`);
      setEnquiries(response.data.enquiries);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch enquiries');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout user={user} logout={logout}>
      <div className="container-fluid">
        <h2 className="mb-4">Available Enquiries</h2>

        {error && (
          <div className="alert alert-warning" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="alert alert-info">No enquiries available in your city.</div>
        ) : (
          <div className="list-group">
            {enquiries.map((enquiry) => (
              <div key={enquiry.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5>{enquiry.title}</h5>
                    <p className="mb-1 text-muted">{enquiry.city}, {enquiry.state}</p>
                    <p className="mb-1">
                      <strong>Buyer:</strong> {enquiry.buyer_name}
                      {enquiry.buyer_company && ` (${enquiry.buyer_company})`}
                    </p>
                    <small className="text-muted">
                      {enquiry.quote_count} quotes • {new Date(enquiry.created_at).toLocaleDateString()}
                    </small>
                  </div>
                  <div>
                    {enquiry.my_quote_count > 0 ? (
                      <span className="badge bg-info">Quote Submitted</span>
                    ) : (
                      <Link
                        to={`/dashboard/seller/enquiries/${enquiry.id}/quote`}
                        className="btn btn-sm btn-primary"
                      >
                        Submit Quote
                      </Link>
                    )}
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



