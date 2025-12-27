import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Layout from '../components/Layout';

export default function SubmitQuote() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [enquiry, setEnquiry] = useState(null);
  const [formData, setFormData] = useState({
    total_price: '',
    delivery_days: '',
    warranty_period: '',
    payment_terms: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch enquiry details if needed
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        total_price: parseFloat(formData.total_price),
        delivery_days: formData.delivery_days ? parseInt(formData.delivery_days) : undefined,
      };
      await api.post(`/enquiries/${id}/quote`, payload);
      navigate('/dashboard/seller/quotations');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit quotation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout user={user} logout={logout}>
      <div className="container-fluid">
        <Link to="/dashboard/seller/enquiries" className="btn btn-outline-secondary mb-3">
          <i className="bi bi-arrow-left"></i> Back
        </Link>

        <h2 className="mb-4">Submit Quotation</h2>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="total_price" className="form-label">Total Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  id="total_price"
                  value={formData.total_price}
                  onChange={(e) => setFormData({ ...formData, total_price: e.target.value })}
                  required
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="delivery_days" className="form-label">Delivery Days</label>
                  <input
                    type="number"
                    className="form-control"
                    id="delivery_days"
                    value={formData.delivery_days}
                    onChange={(e) => setFormData({ ...formData, delivery_days: e.target.value })}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="warranty_period" className="form-label">Warranty Period</label>
                  <input
                    type="text"
                    className="form-control"
                    id="warranty_period"
                    value={formData.warranty_period}
                    onChange={(e) => setFormData({ ...formData, warranty_period: e.target.value })}
                    placeholder="e.g., 2 years"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="payment_terms" className="form-label">Payment Terms</label>
                <input
                  type="text"
                  className="form-control"
                  id="payment_terms"
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  placeholder="e.g., 30% advance, 70% on delivery"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="notes" className="form-label">Additional Notes</label>
                <textarea
                  className="form-control"
                  id="notes"
                  rows="4"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="loading-spinner"></span> : 'Submit Quotation'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/dashboard/seller/enquiries')}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}



