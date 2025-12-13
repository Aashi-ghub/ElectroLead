import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Layout from '../components/Layout';

export default function CreateEnquiry() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: '',
    state: '',
    budget_min: '',
    budget_max: '',
    quote_deadline: '',
    project_start_date: '',
    delivery_date: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : undefined,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : undefined,
      };
      await api.post('/enquiries', payload);
      navigate('/dashboard/buyer/enquiries');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create enquiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout user={user} logout={logout}>
      <div className="container-fluid">
        <h2 className="mb-4">Create Enquiry</h2>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="title" className="form-label">Enquiry Title *</label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  className="form-control"
                  id="description"
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="city" className="form-label">City *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="state" className="form-label">State</label>
                  <input
                    type="text"
                    className="form-control"
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="budget_min" className="form-label">Budget Min (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="budget_min"
                    value={formData.budget_min}
                    onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="budget_max" className="form-label">Budget Max (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="budget_max"
                    value={formData.budget_max}
                    onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label htmlFor="quote_deadline" className="form-label">Quote Deadline</label>
                  <input
                    type="date"
                    className="form-control"
                    id="quote_deadline"
                    value={formData.quote_deadline}
                    onChange={(e) => setFormData({ ...formData, quote_deadline: e.target.value })}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="project_start_date" className="form-label">Project Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    id="project_start_date"
                    value={formData.project_start_date}
                    onChange={(e) => setFormData({ ...formData, project_start_date: e.target.value })}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="delivery_date" className="form-label">Delivery Date</label>
                  <input
                    type="date"
                    className="form-control"
                    id="delivery_date"
                    value={formData.delivery_date}
                    onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="loading-spinner"></span> : 'Create Enquiry'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/dashboard/buyer')}
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
