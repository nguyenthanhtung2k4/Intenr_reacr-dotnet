import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTeams } from '../../services/api.services';
import { Team } from '../../types/Team';

function getTeamId(t: any): number | null {
  const raw = t?.TeamId ?? t?.teamId ?? t?.id;
  if (raw === undefined || raw === null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
function ViewTeams() {
  const navigate = useNavigate();
  const [dataTeams, setDataTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        setError(null);
        setIsLoading(true);
        const teams = await fetchTeams();
        setDataTeams(teams || []);
      } catch (ex: any) {
        console.error('Lỗi khi tải danh sách đội:', ex);
        setError(ex.message || 'Lỗi: Không thể tải danh sách đội từ API.');
        setDataTeams([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadTeams();
  }, []);

  const handleViewBowlers = (teamId: any) => {
    const idTeam = getTeamId(teamId);
    console.log('idTeam : ', idTeam);
    navigate(`/team/${idTeam}`);
  };
  const handleTeamBowlers = (teamId: any, type: String) => {
    const idTeam = getTeamId(teamId);
    if (type === 'edit') {
      navigate(`/edit-team/${idTeam}`);
    }
    if (type === 'delete') {
      navigate(`/delete-team/${idTeam}`);
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen font-inter">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Danh Sách Các Đội</h1>
        <div className="space-x-3">
          <button
            onClick={() => navigate('/create-team')}
            className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition duration-300"
          >
            + Tạo Đội Mới
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
          Đang tải danh sách đội...
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
                  Tên Đội
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider "
                >
                  Xem chi tiết
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider rounded-tr-xl"
                >
                  Hành Động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dataTeams.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Không có đội nào được tìm thấy.
                  </td>
                </tr>
              ) : (
                dataTeams.map((team) => (
                  <tr
                    key={team.TeamId}
                    className="even:bg-gray-50 hover:bg-indigo-50/70 transition duration-150 ease-in-out"
                  >
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                      {team.TeamId}
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {team.teamName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        type="button"
                        id={`${team.TeamId}`}
                        onClick={() => handleViewBowlers(team)}
                        className="text-indigo-600 hover:text-nowrap-900 transition duration-150"
                      >
                        Xem VĐV
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        type="button"
                        id={`${team.TeamId}`}
                        onClick={() => handleTeamBowlers(team, 'edit')}
                        className="text-blue-600 hover:text-indigo-900 transition duration-150 pr-4"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        id={`${team.TeamId}`}
                        onClick={() => handleTeamBowlers(team, 'delete')}
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
}

export default ViewTeams;
