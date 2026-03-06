import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

function Login() {
  const toast = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await login(email.trim(), password);
      console.log('Đăng nhập thành công!');
      toast.showToast('Đăng nhập thành công!', 'success');
      navigate('/league/live');
    } catch (ex: any) {
      console.error('Lỗi Đăng nhập:', ex);
      const message = ex?.message || 'Đã xảy ra lỗi trong quá trình đăng nhập.';
      setError(message);
      toast.showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-[100px]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-indigo-100/50 blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Brand Section */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center justify-center mb-4 w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 text-white">
            <span className="text-3xl">🎳</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Bowling League</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            Welcome back! Please sign in to continue.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden animate-fade-in-up delay-100">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium group-hover:bg-white"
                  placeholder="name@example.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative group">
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium group-hover:bg-white"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-600 text-sm font-medium flex items-center gap-2 animate-shake">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white/90" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing In ...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Quick Access */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="bg-blue-50/50 rounded-xl p-4 text-center border border-blue-100/50">
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">
                Demo Credentials
              </p>
              <div className="flex justify-center flex-wrap gap-2 text-sm font-medium text-slate-700">
                <span className="bg-white px-2 py-0.5 rounded border border-blue-100">
                  t@gmail.com
                </span>
                <span className="text-slate-300 mx-1">/</span>
                <span className="bg-white px-2 py-0.5 rounded border border-blue-100">
                  tungtung
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              New to the league?{' '}
              <Link
                to="/accounts/new"
                className="text-blue-600 hover:text-blue-700 font-bold transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-slate-400 text-xs">
          &copy; 2026 Bowling League System. All rights reserved.
        </div>
      </div>
    </div>
  );
}

export default Login;
