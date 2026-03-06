import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { createAccounts, fetchAccountsDetails, fetchAccountUpdate } from '../../../core/api';

function Register() {
  const { id } = useParams<{ id: string }>();
  const isEdit = id !== undefined && id !== 'create-accounts';
  const pageTitle = isEdit ? 'Chỉnh sửa account' : 'Thêm account';

  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy data khi edit
  useEffect(() => {
    const fetchAccountData = async () => {
      if (isEdit && id) {
        try {
          const dataDetail = await fetchAccountsDetails(id);
          // Tùy backend trả camelCase hay PascalCase mà bạn map lại cho đúng
          setEmail(dataDetail.email ?? dataDetail.email ?? '');
          setPassword(dataDetail.password ?? dataDetail.password ?? '');
          setRole(dataDetail.role ?? dataDetail.role ?? '');
        } catch (err) {
          console.error('Lỗi lấy chi tiết account:', err);
          toast.showToast('Không lấy được thông tin tài khoản.', 'error');
        }
      }
    };
    fetchAccountData();
  }, [id, isEdit, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !role) {
      setError('Vui lòng nhập đầy đủ Email, Mật khẩu và Vai trò.');
      return;
    }

    setIsLoading(true);
    setError(null);
    // ================== UPDATE ==================

    if (isEdit && id) {
      try {
        await fetchAccountUpdate(id, {
          Email: email,
          Password: password,
          Role: role,
        });

        toast.showToast('Cập nhật tài khoản thành công!', 'success');
        navigate('/accounts');
      } catch (ex: any) {
        console.error('Lỗi cập nhật tài khoản:', ex);

        const status = ex?.response?.status;
        const apiMessage = ex?.response?.data?.message;

        let message = 'Email tài khoản đã tồn tại !';

        if (status === 400 || status === 409) {
          message = apiMessage || 'Email đã tồn tại!';
        } else if (apiMessage) {
          message = apiMessage;
        }

        setError(message);
        toast.showToast(message, 'error');
      } finally {
        setIsLoading(false);
      }
    }
    // ================== CREATE ==================
    else {
      try {
        await createAccounts({
          Email: email,
          Password: password,
          Role: role,
        });

        toast.showToast('Thêm tài khoản thành công!', 'success');
        navigate('/accounts');
      } catch (ex: any) {
        console.error('Lỗi tạo tài khoản:', ex);

        const status = ex?.response?.status;
        const apiMessage = ex?.response?.data?.message;

        let message = 'Đã xảy ra lỗi trong quá trình tạo tài khoản.';

        if (status === 400 || status === 409) {
          message = apiMessage || 'Email đã tồn tại!';
        } else if (apiMessage) {
          message = apiMessage;
        } else if (ex?.message) {
          message = ex.message;
        }

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
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{pageTitle}</h2>
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
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Mật khẩu"
                disabled={isLoading}
              />
            </div>

            {/* Role Input */}
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
                  Đang load...
                </div>
              ) : isEdit && id ? (
                'Sửa accounts'
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

export default function App() {
  return <Register />;
}
