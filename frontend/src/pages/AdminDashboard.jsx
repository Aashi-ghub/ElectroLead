import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Layout from '../components/Layout';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'users') {
        const response = await api.get('/admin/users?limit=20');
        setUsers(response.data.users);
      } else if (activeTab === 'enquiries') {
        const response = await api.get('/admin/enquiries?limit=20');
        setEnquiries(response.data.enquiries);
      } else if (activeTab === 'subscriptions') {
        const response = await api.get('/admin/subscriptions?limit=20');
        setSubscriptions(response.data.subscriptions);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleKycAction = async (userId, action) => {
    try {
      await api.post(`/admin/users/${userId}/approve-kyc`, { action });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update KYC status');
    }
  };

  const handleSuspend = async (userId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      await api.post(`/admin/users/${userId}/suspend`, { action });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user status');
    }
  };

  return (
    <Layout user={user} logout={logout}>
      <div className="container-fluid">
        <h2 className="mb-4">Admin Dashboard</h2>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Users
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'enquiries' ? 'active' : ''}`}
              onClick={() => setActiveTab('enquiries')}
            >
              Enquiries
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'subscriptions' ? 'active' : ''}`}
              onClick={() => setActiveTab('subscriptions')}
            >
              Subscriptions
            </button>
          </li>
        </ul>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : activeTab === 'users' ? (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>City</th>
                  <th>KYC Status</th>
                  <th>Account Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">No users found</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'buyer' ? 'bg-primary' : 'bg-success'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.city || 'N/A'}</td>
                      <td>
                        <span
                          className={`badge ${
                            u.kyc_status === 'approved'
                              ? 'bg-success'
                              : u.kyc_status === 'rejected'
                              ? 'bg-danger'
                              : 'bg-warning'
                          }`}
                        >
                          {u.kyc_status}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.is_active ? 'bg-success' : 'bg-danger'}`}>
                          {u.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          {u.kyc_status === 'pending' && (
                            <>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleKycAction(u.id, 'approve')}
                                title="Approve KYC"
                              >
                                <i className="bi bi-check-circle"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleKycAction(u.id, 'reject')}
                                title="Reject KYC"
                              >
                                <i className="bi bi-x-circle"></i>
                              </button>
                            </>
                          )}
                          <button
                            className={`btn btn-sm ${u.is_active ? 'btn-warning' : 'btn-success'}`}
                            onClick={() => handleSuspend(u.id, u.is_active ? 'suspend' : 'activate')}
                            title={u.is_active ? 'Suspend User' : 'Activate User'}
                          >
                            <i className={`bi ${u.is_active ? 'bi-pause-circle' : 'bi-play-circle'}`}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'enquiries' ? (
          <div className="list-group">
            {enquiries.length === 0 ? (
              <div className="alert alert-info">No enquiries found</div>
            ) : (
              enquiries.map((enquiry) => (
                <div key={enquiry.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <h5>{enquiry.title}</h5>
                      <p className="mb-1 text-muted">
                        <strong>Buyer:</strong> {enquiry.buyer_name} ({enquiry.buyer_email})
                      </p>
                      <p className="mb-1">
                        <strong>Location:</strong> {enquiry.city}, {enquiry.state}
                      </p>
                      <small className="text-muted">
                        {enquiry.quote_count} quotes • Created {new Date(enquiry.created_at).toLocaleDateString()}
                      </small>
                    </div>
                    <div>
                      <span
                        className={`badge ${
                          enquiry.status === 'open'
                            ? 'bg-success'
                            : enquiry.status === 'awarded'
                            ? 'bg-primary'
                            : 'bg-secondary'
                        }`}
                      >
                        {enquiry.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Plan Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">No subscriptions found</td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => (
                    <tr key={sub.id}>
                      <td>{sub.user_name}</td>
                      <td>{sub.email}</td>
                      <td>
                        <span
                          className={`badge ${
                            sub.plan_type === 'national'
                              ? 'bg-primary'
                              : sub.plan_type === 'state'
                              ? 'bg-info'
                              : 'bg-secondary'
                          }`}
                        >
                          {sub.plan_type}
                        </span>
                      </td>
                      <td>₹{sub.amount_paid}</td>
                      <td>
                        <span
                          className={`badge ${
                            sub.status === 'active'
                              ? 'bg-success'
                              : sub.status === 'expired'
                              ? 'bg-warning'
                              : 'bg-secondary'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td>{new Date(sub.start_date).toLocaleDateString()}</td>
                      <td>{new Date(sub.end_date).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}



