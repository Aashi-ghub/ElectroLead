import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Layout from '../components/Layout';

export default function MyQuotations() {
  const { user, logout } = useAuth();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchQuotations();
  }, [page]);

  const fetchQuotations = async () => {
    try {
      const response = await api.get(`/my-quotations?page=${page}&limit=20`);
      setQuotations(response.data.quotations);
    } catch (err) {
      console.error('Failed to fetch quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout user={user} logout={logout}>
      <div className="container-fluid">
        <h2 className="mb-4">My Quotations</h2>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : quotations.length === 0 ? (
          <div className="alert alert-info">No quotations submitted yet.</div>
        ) : (
          <div className="list-group">
            {quotations.map((quote) => (
              <div key={quote.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5>{quote.enquiry_title}</h5>
                    <p className="mb-1 text-muted">
                      Buyer: {quote.buyer_name}
                      {quote.buyer_company && ` (${quote.buyer_company})`}
                    </p>
                    <p className="mb-1">
                      <strong>Price:</strong> ₹{quote.total_price}
                    </p>
                    <p className="mb-1">
                      <strong>Delivery:</strong> {quote.delivery_days || 'N/A'} days
                    </p>
                    <small className="text-muted">
                      Submitted {new Date(quote.created_at).toLocaleDateString()}
                    </small>
                  </div>
                  <div>
                    <span className={`badge ${quote.status === 'accepted' ? 'bg-success' : 'bg-secondary'}`}>
                      {quote.status}
                    </span>
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



