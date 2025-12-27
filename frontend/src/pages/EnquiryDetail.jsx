import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Layout from '../components/Layout';

export default function EnquiryDetail() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [enquiry, setEnquiry] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [enquiryRes, quotesRes] = await Promise.all([
        api.get(`/enquiries/my-enquiries`).then((res) => {
          const found = res.data.enquiries.find((e) => e.id === id);
          return found ? { data: found } : null;
        }),
        api.get(`/enquiries/${id}/quotations`),
      ]);

      if (enquiryRes?.data) {
        setEnquiry(enquiryRes.data);
      }
      setQuotations(quotesRes.data.quotations);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout user={user} logout={logout}>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (!enquiry) {
    return (
      <Layout user={user} logout={logout}>
        <div className="alert alert-danger">Enquiry not found</div>
      </Layout>
    );
  }

  return (
    <Layout user={user} logout={logout}>
      <div className="container-fluid">
        <Link to="/dashboard/buyer/enquiries" className="btn btn-outline-secondary mb-3">
          <i className="bi bi-arrow-left"></i> Back
        </Link>

        <div className="card mb-4">
          <div className="card-body">
            <h3>{enquiry.title}</h3>
            <p className="text-muted">{enquiry.city}, {enquiry.state}</p>
            <p>{enquiry.description || 'No description provided'}</p>
            <div className="row mt-3">
              <div className="col-md-4">
                <strong>Budget:</strong> ₹{enquiry.budget_min || 'N/A'} - ₹{enquiry.budget_max || 'N/A'}
              </div>
              <div className="col-md-4">
                <strong>Status:</strong>{' '}
                <span className={`badge ${enquiry.status === 'open' ? 'bg-success' : 'bg-secondary'}`}>
                  {enquiry.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <h4 className="mb-3">Quotations Received ({quotations.length})</h4>

        {quotations.length === 0 ? (
          <div className="alert alert-info">No quotations received yet.</div>
        ) : (
          <div className="list-group">
            {quotations.map((quote) => (
              <div key={quote.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5>{quote.seller_name}</h5>
                    {quote.company_name && <p className="text-muted">{quote.company_name}</p>}
                    <p className="mb-1">
                      <strong>Price:</strong> ₹{quote.total_price}
                    </p>
                    <p className="mb-1">
                      <strong>Delivery:</strong> {quote.delivery_days || 'N/A'} days
                    </p>
                    {quote.warranty_period && (
                      <p className="mb-1">
                        <strong>Warranty:</strong> {quote.warranty_period}
                      </p>
                    )}
                    {quote.notes && <p className="text-muted">{quote.notes}</p>}
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



