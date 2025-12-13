import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Layout from '../components/Layout';

export default function Profile() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      setProfile(response.data);
      setFormData({
        name: response.data.user.name || '',
        phone: response.data.user.phone || '',
        city: response.data.user.city || '',
        state: response.data.user.state || '',
        company_name: response.data.user.company_name || '',
      });
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await api.put('/profile', formData);
      setSuccess('Profile updated successfully');
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('document', file);
    formData.append('document_type', 'kyc');

    try {
      await api.post('/profile/upload-kyc', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Document uploaded successfully');
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload document');
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

  return (
    <Layout user={user} logout={logout}>
      <div className="container-fluid">
        <h2 className="mb-4">Profile</h2>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success" role="alert">
            {success}
          </div>
        )}

        <div className="row">
          <div className="col-md-8">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Personal Information</h5>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={profile.user.email} disabled />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      />
                    </div>
                  </div>

                  {user.role === 'seller' && (
                    <div className="mb-3">
                      <label className="form-label">Company Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      />
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <span className="loading-spinner"></span> : 'Update Profile'}
                  </button>
                </form>
              </div>
            </div>

            {user.role === 'seller' && (
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">KYC Documents</h5>
                  <div className="mb-3">
                    <label className="form-label">Upload Document (PDF, JPG, PNG - Max 5MB)</label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                    />
                  </div>

                  {profile.documents && profile.documents.length > 0 && (
                    <div className="list-group">
                      {profile.documents.map((doc) => (
                        <div key={doc.id} className="list-group-item">
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            {doc.document_type} - {new Date(doc.uploaded_at).toLocaleDateString()}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3">
                    <strong>KYC Status:</strong>{' '}
                    <span className={`badge ${
                      profile.user.kyc_status === 'approved' ? 'bg-success' :
                      profile.user.kyc_status === 'rejected' ? 'bg-danger' : 'bg-warning'
                    }`}>
                      {profile.user.kyc_status}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="col-md-4">
            {user.role === 'seller' && profile.subscription && (
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Subscription</h5>
                  <p>
                    <strong>Plan:</strong> {profile.subscription.plan_type}
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className={`badge ${profile.subscription.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                      {profile.subscription.status}
                    </span>
                  </p>
                  <p>
                    <strong>Valid Until:</strong> {new Date(profile.subscription.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
