import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import {
  createAccounts,
  fetchBowlerDetails,
} from '../../services/api.services';
import { convertTypeAcquisitionFromJson } from 'typescript';

function Register() {
  const { id } = useParams<{ id: string }>();
  console.log('param la: ', id);
  const isEdit = id !== undefined && id !== 'create-accounts';
  console.log(isEdit);
  const pageTitle = isEdit ? 'Chỉnh sửa account' : 'Thêm account';

  console.log(pageTitle);

  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }
// Thieu  va  sai  o day 
// 
    setIsLoading(true);
    setError(null);
    if (isEdit && id) {
      await fetchBowlerDetails(id);
    } else {
      try {
        await createAccounts({ Email: email, Password: password, Role: role });
        console.log('Add accounts  success !');
        toast.showToast('Them thanh cong!', 'success');
        navigate('/');
      } catch (ex: any) {
        console.error('Lỗi Đăng nhập:', ex);
        const message =
          ex?.message || 'Đã xảy ra lỗi trong quá trình đăng nhập.';
        setError(message);
        toast.showToast(message, 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-md w-full space-y-8 p-8 bg-white shadow-xl rounded-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {pageTitle}
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Email Input */}
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-t-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Địa chỉ Email"
                disabled={isLoading}
              />
            </div>
            {/* Password Input */}
            <div className="mt-px">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                // Removed rounded-b-lg here, applying it to the select element later
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Mật khẩu"
                disabled={isLoading}
              />
            </div>

            {/* Role Input (FIXED: Using a single <select> element) */}
            <div className="mt-px">
              <label htmlFor="user-role" className="sr-only">
                Chọn Vai Trò (Role)
              </label>
              <select
                id="user-role"
                name="user-role"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="appearance-none rounded-b-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                disabled={isLoading}
              >
                <option value="" disabled>
                  -- Lựa chọn Vai trò --
                </option>
                <option value="Admin">Admin</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 p-3 bg-red-100 border border-red-400 rounded-md text-center text-sm font-medium">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transform hover:scale-[1.01] transition-transform'
              } transition duration-300 ease-in-out`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang thêm...
                </div>
              ) : (
                'Thêm accounts'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main App component to host Register
export default function App() {
  return <Register />;
}
