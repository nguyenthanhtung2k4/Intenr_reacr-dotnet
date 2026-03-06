import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAccounts, fetchdeleteAccount } from '../../../core/api';
import { Acc } from '../../../types/Accounts';
import { useToast } from '../../../context/ToastContext';

// Helper lấy ID
function getId(item: any): number | null {
  const id = Number(item?.id ?? item?.Id);
  return Number.isFinite(id) ? id : null;
}

const Accounts = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [dataAccounts, setDataAccounts] = useState<Acc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ===================== LOAD DANH SÁCH =====================
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setError(null);
        setIsLoading(true);

        const accounts = await fetchAccounts();
        setDataAccounts(accounts || []);
      } catch (ex: any) {
        console.error('Lỗi khi tải danh sách accounts:', ex);
        setError(ex.message || 'Lỗi: Không thể tải danh sách accounts từ API.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAccounts();
  }, []);

  // ===================== SỬA ACCOUNT =====================
  const handleEdit = (acc: any) => {
    const id = getId(acc);
    if (!id) return toast.showToast('ID không hợp lệ!', 'error');
    navigate(`/accounts/${id}/edit`);
  };

  // ===================== XÓA ACCOUNT =====================
  const handleDelete = async (id: number) => {
    try {
      const log = await fetchdeleteAccount(id);
      console.log(log);

      toast.showToast('Xóa tài khoản thành công!', 'success');

      // cập nhật lại danh sách sau khi xóa
      setDataAccounts((prev) => prev.filter((x) => x.id !== id));
    } catch (ex: any) {
      console.error('Lỗi xóa tài khoản:', ex);
      toast.showToast('Lỗi khi xóa tài khoản!', 'error');
    }
  };

  // ========================== UI ==========================
  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen font-inter">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Danh Sách Accounts</h1>

        <div className="space-x-3">
          <button
            onClick={() => navigate('/accounts/new')}
            className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition duration-300"
          >
            + Tạo tài khoản
          </button>

          <button
            onClick={() => navigate('/')}
            className="bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-500 transition duration-300"
          >
            ← Quay lại Trang Chủ
          </button>
        </div>
      </div>

      {error && (
        <div className="text-red-600 p-4 mb-4 bg-red-100 border border-red-400 rounded-lg text-center font-semibold">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center p-10 text-xl font-semibold text-indigo-600">
          Đang tải danh sách accounts...
        </div>
      ) : (
        <div className="overflow-x-auto shadow-xl rounded-xl">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Password
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Role
                </th>
                <th
                  colSpan={2}
                  className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {dataAccounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Không có accounts nào được tìm thấy.
                  </td>
                </tr>
              ) : (
                dataAccounts.map((acc) => (
                  <tr
                    key={acc.id}
                    className="even:bg-gray-50 hover:bg-indigo-50/70 transition duration-150 ease-in-out"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {acc.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {acc.password}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {acc.role}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => handleEdit(acc)}
                        className="text-blue-600 hover:text-indigo-900 transition duration-150 pr-4"
                      >
                        Sửa
                      </button>

                      <button
                        onClick={() => {
                          const confirmDelete = window.confirm(
                            'Bạn chắc chắn muốn xóa tài khoản này?',
                          );
                          if (confirmDelete) handleDelete(acc.id);
                        }}
                        className="text-red-600 hover:text-red-900 transition duration-150"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Accounts;
