import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';
import { LogIn } from 'lucide-react';
import { validateFields, hasErrors } from '../../utils/formValidation';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = validateFields({ email, password }, {
      email: [
        { rule: 'required', message: 'Email is required' },
        { rule: 'email', message: 'Enter a valid email address' },
      ],
      password: [
        { rule: 'required', message: 'Password is required' },
        { rule: 'password', message: 'Password must be at least 6 characters', param: 6 },
      ],
    });
    setFieldErrors(errors);
    if (hasErrors(errors)) return;

    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Login failed');
        setIsLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-app" data-dark="0">
      <div className="login-wrapper">
        <div className="login-box">
          <div className="login-header">
            <div className="login-logo">
              <LogIn size={24} />
            </div>
            <h2 className="ph-title" style={{ marginBottom: '5px' }}>Admin Portal</h2>
            <p className="ph-sub">Sign in to manage Jai Varahi Peedam</p>
          </div>
          
          {error && <div className="alert a-er" role="alert">⚠ {error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <input 
                id="login-email"
                type="email" 
                className="form-control" 
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })); }}
                required 
                autoFocus
                placeholder="admin@example.com"
              />
              {fieldErrors.email && <div style={{ color: 'var(--er)', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.email}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input 
                id="login-password"
                type="password" 
                className="form-control" 
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })); }}
                required 
                placeholder="••••••••"
              />
              {fieldErrors.password && <div style={{ color: 'var(--er)', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.password}</div>}
            </div>
            
            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
