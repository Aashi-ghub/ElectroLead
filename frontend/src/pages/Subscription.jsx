import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Layout from '../components/Layout';

export default function Subscription() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [planType, setPlanType] = useState('local');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const plans = {
    local: { name: 'Local', price: 999, description: 'One City' },
    state: { name: 'State', price: 999, description: 'Full State' },
    national: { name: 'National', price: 999, description: 'All India' },
  };

  const handleSubscribe = async () => {
    setError('');
    setLoading(true);

    try {
      // Create Razorpay order
      const orderResponse = await api.post('/subscriptions/create-order', { plan_type: planType });
      const { order_id } = orderResponse.data;

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: orderResponse.data.amount,
          currency: orderResponse.data.currency,
          order_id: order_id,
          name: 'VoltSupply',
          description: `Subscription - ${plans[planType].name}`,
          handler: async (response) => {
            try {
              await api.post('/subscriptions/verify', {
                order_id,
                payment_id: response.razorpay_payment_id,
                plan_type: planType,
              });
              navigate('/profile');
            } catch (err) {
              setError(err.response?.data?.error || 'Payment verification failed');
            }
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
        setLoading(false);
      };
      document.body.appendChild(script);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create subscription');
      setLoading(false);
    }
  };

  return (
    <Layout user={user} logout={logout}>
      <div className="container-fluid">
        <h2 className="mb-4">Subscription Plans</h2>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="row">
          {Object.entries(plans).map(([key, plan]) => (
            <div key={key} className="col-md-4 mb-4">
              <div className={`card ${planType === key ? 'border-primary' : ''}`}>
                <div className="card-body text-center">
                  <h5 className="card-title">{plan.name}</h5>
                  <h3 className="mb-3">₹{plan.price}/month</h3>
                  <p className="text-muted">{plan.description}</p>
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="plan"
                      id={key}
                      checked={planType === key}
                      onChange={() => setPlanType(key)}
                    />
                    <label className="form-check-label" htmlFor={key}>
                      Select Plan
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            className="btn btn-primary btn-lg"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? <span className="loading-spinner"></span> : 'Subscribe Now'}
          </button>
        </div>
      </div>
    </Layout>
  );
}



