import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAccounts, fetchTeams } from '../../services/api.services';
import { Acc } from '../../types/Accounts';
import { useAuth } from '../../context/AuthContext';

function getTeamId(t: any): number | null {
  const raw = t?.TeamId ?? t?.teamId ?? t?.id;
  if (raw === undefined || raw === null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
const Accounts = () => {
  const navigate = useNavigate();
  const [dataAccounts, setDataAccounts] = useState<Acc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setError(null);
        setIsLoading(true);
        const accounts = await fetchAccounts();
        setDataAccounts(accounts || []);
      } catch (ex: any) {
        console.error('Lỗi khi tải danh sách đội:', ex);
        setError(ex.message || 'Lỗi: Không thể tải danh sách đội từ API.');
        setDataAccounts([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadAccounts();
  }, []);

  const handleViewBowlers = (teamId: any) => {
    const idTeam = getTeamId(teamId);
    console.log('idTeam : ', idTeam);
    navigate(`/team/${idTeam}`);
  };
  const handleTeamBowlers = (id: any, type: String) => {
    const idAcc = getTeamId(id);
    if (type === 'edit') {
      navigate(`/edit-account/${idAcc}`);
    }
    if (type === 'delete') {
      navigate(`/delete-account/${idAcc}`);
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen font-inter">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Danh Sách Các Đội</h1>
        <div className="space-x-3">
          <button
            onClick={() => navigate('/create-account')}
            className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition duration-300"
          >
            + Tạo tài khoản
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-500 transition duration-300"
          >
            &larr; Quay lại Trang Chủ
          </button>
        </div>
      </div>

      {error && (
        <div className="text-red-600 p-4 mb-4 bg-red-100 border border-red-400 rounded-lg text-center font-semibold">
          {error}
        </div>
      )}

      {isLoading && !error ? (
        <div className="text-center p-10 text-xl font-semibold text-indigo-600">
          Đang tải danh accounts...
        </div>
      ) : (
        <div className="overflow-x-auto shadow-xl rounded-xl">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-800">
              <tr>
                {/* <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium text-white uppercase tracking-wider rounded-tl-xl text-center"
                >
                  ID Đội
                </th> */}
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider "
                >
                  Password
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider "
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider"
                  colSpan={2}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dataAccounts.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Không có accounts nào được tìm thấy.
                  </td>
                </tr>
              ) : (
                dataAccounts.map((acc) => (
                  <tr
                    key={acc.id}
                    className="even:bg-gray-50 hover:bg-indigo-50/70 transition duration-150 ease-in-out"
                  >
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                      {team.TeamId}
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {acc.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {acc.password}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {acc.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        type="button"
                        id={`${acc.id}`}
                        onClick={() => handleTeamBowlers(acc, 'edit')}
                        className="text-blue-600 hover:text-indigo-900 transition duration-150 pr-4"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        id={`${acc.id}`}
                        onClick={() => handleTeamBowlers(acc, 'delete')}
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
