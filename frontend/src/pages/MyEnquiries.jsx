import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Layout from '../components/Layout';

export default function MyEnquiries() {
  const { user, logout } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchEnquiries();
  }, [page]);

  const fetchEnquiries = async () => {
    try {
      const response = await api.get(`/enquiries/my-enquiries?page=${page}&limit=20`);
      setEnquiries(response.data.enquiries);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Failed to fetch enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;

    try {
      await api.delete(`/enquiries/${id}`);
      fetchEnquiries();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete enquiry');
    }
  };

  return (
    <Layout user={user} logout={logout}>
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>My Enquiries</h2>
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
          <div className="alert alert-info">No enquiries found.</div>
        ) : (
          <>
            <div className="list-group">
              {enquiries.map((enquiry) => (
                <div key={enquiry.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <h5>{enquiry.title}</h5>
                      <p className="mb-1 text-muted">{enquiry.city}, {enquiry.state}</p>
                      <small className="text-muted">
                        {enquiry.quote_count} quotes • {new Date(enquiry.created_at).toLocaleDateString()}
                      </small>
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                      <span className={`badge ${enquiry.status === 'open' ? 'bg-success' : 'bg-secondary'}`}>
                        {enquiry.status}
                      </span>
                      <Link
                        to={`/dashboard/buyer/enquiries/${enquiry.id}`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        View
                      </Link>
                      {enquiry.status === 'open' && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(enquiry.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination.pages > 1 && (
              <nav className="mt-4">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(page - 1)}>Previous</button>
                  </li>
                  <li className="page-item disabled">
                    <span className="page-link">Page {page} of {pagination.pages}</span>
                  </li>
                  <li className={`page-item ${page >= pagination.pages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(page + 1)}>Next</button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}



