import { useEffect, useState } from 'react';
import { Bowler } from '../../types/Bowler';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchTeamBowlers } from '../../services/api.services';

function Team() {
  const [bowlerData, setBowlerData] = useState<Bowler[]>([]);
  const [nameTeam, setNameTeam] = useState('Đang tải...');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!id) {
      setError('Lỗi: Không tìm thấy ID đội.');
      setIsLoading(false);
      return;
    }

    const fetchBowler = async () => {
      try {
        setError(null);
        setIsLoading(true);

        const data = await fetchTeamBowlers(id);

        if (data && data.length > 0) {
          setNameTeam(data[0].team.teamName);
        } else {
          setNameTeam('Đội không có vận động viên nào');
        }
        setBowlerData(data || []);
      } catch (ex: any) {
        console.error(ex);
        setError(ex.message || 'Lỗi khi tải dữ liệu đội.');
        setBowlerData([]);
        setNameTeam('Lỗi tải tên đội');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBowler();
  }, [id]);

  // HandleEdit
  var handleEdit = (ID: number) => {
    navigate(`/bowler/${ID}`);
  };

  // HandleDelete
  var handleDelete = (ID: number) => {
    navigate(`/delete/${ID}`);
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen font-inter">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">
          Danh Sách Vận Động Viên: {nameTeam}
        </h1>
        <button
          onClick={() => navigate('/')}
          className="bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-500 transition duration-300"
        >
          &larr; Quay lại Trang Chủ
        </button>
      </div>

      {error && (
        <div className="text-red-600 p-4 mb-4 bg-red-100 border border-red-400 rounded-lg text-center font-semibold">
          {error}
        </div>
      )}

      {isLoading && !error ? (
        <div className="text-center p-10 text-xl font-semibold text-indigo-600">
          Đang tải danh sách vận động viên của đội...
        </div>
      ) : (
        <div className="overflow-x-auto shadow-xl rounded-xl">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-800">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium text-white uppercase tracking-wider rounded-tl-xl text-center"
                >
                  Last Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium text-white uppercase tracking-wider text-center"
                >
                  First Names
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium text-white uppercase tracking-wider text-center"
                >
                  Address
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium text-white uppercase tracking-wider text-center"
                >
                  Phone
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
              {bowlerData.length === 0 && !error ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Đội này hiện không có vận động viên nào.
                  </td>
                </tr>
              ) : (
                bowlerData.map((b) => (
                  <tr
                    key={b.bowlerId}
                    className="even:bg-gray-50 hover:bg-indigo-50/70 transition duration-150 ease-in-out"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {b.bowlerLastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {b.bowlerFirstName}{' '}
                      {b.bowlerMiddleInit ? b.bowlerMiddleInit + '.' : ''}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {b.bowlerAddress}, {b.bowlerCity}, {b.bowlerState}{' '}
                      {b.bowlerZip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {b.bowlerPhoneNumber}
                    </td>

                    {/* Edit Button */}
                    <td className="px-2 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => handleEdit(b.bowlerId)}
                        className="text-indigo-600 hover:text-indigo-900 transition duration-150"
                      >
                        Edit
                      </button>
                    </td>

                    {/* Delete Button */}
                    <td className="px-2 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => handleDelete(b.bowlerId)}
                        className="text-red-600 hover:text-red-900 transition duration-150"
                      >
                        Delete
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
export default Team;
