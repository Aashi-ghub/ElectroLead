import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children, user, logout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const buyerMenu = [
    { path: '/dashboard/buyer', label: 'Dashboard', icon: 'bi-house' },
    { path: '/dashboard/buyer/enquiries', label: 'My Enquiries', icon: 'bi-file-text' },
    { path: '/dashboard/buyer/create-enquiry', label: 'Create Enquiry', icon: 'bi-plus-circle' },
  ];

  const sellerMenu = [
    { path: '/dashboard/seller', label: 'Dashboard', icon: 'bi-house' },
    { path: '/dashboard/seller/enquiries', label: 'Available Leads', icon: 'bi-inbox' },
    { path: '/dashboard/seller/quotations', label: 'My Quotes', icon: 'bi-send' },
    { path: '/subscription', label: 'Subscription', icon: 'bi-credit-card' },
  ];

  const adminMenu = [
    { path: '/dashboard/admin', label: 'Admin Dashboard', icon: 'bi-shield-check' },
  ];

  const menu =
    user?.role === 'buyer'
      ? buyerMenu
      : user?.role === 'seller'
        ? sellerMenu
        : user?.role === 'admin'
          ? adminMenu
          : [];

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <nav className="bg-primary text-white" style={{ width: '250px', minHeight: '100vh' }}>
        <div className="p-3">
          <h4 className="text-white mb-4">ElectroLead</h4>
          <ul className="nav flex-column">
            {menu.map((item) => (
              <li key={item.path} className="nav-item mb-2">
                <Link
                  to={item.path}
                  className="nav-link text-white d-flex align-items-center"
                  style={{ borderRadius: '5px' }}
                >
                  <i className={`${item.icon} me-2`}></i>
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="nav-item mb-2">
              <Link
                to="/profile"
                className="nav-link text-white d-flex align-items-center"
                style={{ borderRadius: '5px' }}
              >
                <i className="bi-person me-2"></i>
                Profile
              </Link>
            </li>
            {user?.role === 'admin' && (
              <li className="nav-item mb-2">
                <Link
                  to="/dashboard/admin"
                  className="nav-link text-white d-flex align-items-center"
                  style={{ borderRadius: '5px' }}
                >
                  <i className="bi-shield-check me-2"></i>
                  Admin
                </Link>
              </li>
            )}
          </ul>
        </div>
        <div className="p-3 border-top border-white border-opacity-25">
          <div className="d-flex align-items-center mb-3">
            <i className="bi-person-circle me-2" style={{ fontSize: '1.5rem' }}></i>
            <div>
              <div className="small">{user?.name}</div>
              <div className="small text-white-50">{user?.email}</div>
            </div>
          </div>
          <button className="btn btn-outline-light btn-sm w-100" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="flex-grow-1 p-4" style={{ backgroundColor: '#f8f9fa' }}>
        {children}
      </main>
    </div>
  );
}
