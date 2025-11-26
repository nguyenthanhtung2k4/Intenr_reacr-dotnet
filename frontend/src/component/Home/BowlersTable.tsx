import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bowler } from '../../types/Bowler';
import { fetchAllBowlers } from '../../services/api.services';

function BowlersTable(props: any) {
  const navigate = useNavigate();
  const [bowlerData, setBowlerData] = useState<Bowler[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('props : ', props);
  var handleTeam = (ID: number) => {
    navigate(`team/${ID}`);
  };
  var handleEdit = (ID: number) => {
    navigate(`bowler/${ID}`);
  };
  var handleDelete = (ID: number) => {
    navigate(`delete/${ID}`);
  };
  var handleCreate = (type: string) => {
    if (type === 'create') {
      navigate(`bowler/new`);
    } else {
      navigate(`view-teams`);
    }
  };

  useEffect(() => {
    const fetchBowlerData = async () => {
      try {
        setError(null);
        setIsLoading(true);

        // Gọi API Service
        const b = await fetchAllBowlers();
        setBowlerData(b || []);
      } catch (ex: any) {
        console.error('Error fetching data:', ex);
        // Hiển thị thông báo lỗi từ hàm service (hoặc lỗi chung)
        setError(ex.message || 'Lỗi: Không thể tải dữ liệu VĐV từ API.');
        setBowlerData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBowlerData();
  }, []);

  // --- LOGIC LỌC VÀ TÌM KIẾM HOÀN CHỈNH ---
  let filteredBowlers = bowlerData.filter((e) => !e.isDelete); // Lọc VĐV chưa bị xóa

  if (search) {
    const lowerCaseSearch = search.toLowerCase();
    filteredBowlers = filteredBowlers.filter(
      (bowler) =>
        bowler.bowlerFirstName.toLowerCase().includes(lowerCaseSearch) ||
        bowler.bowlerLastName.toLowerCase().includes(lowerCaseSearch) ||
        bowler.team.teamName.toLowerCase().includes(lowerCaseSearch) ||
        bowler.bowlerCity.toLowerCase().includes(lowerCaseSearch),
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen font-inter">
      {/* Control Panel */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Tìm kiếm theo Tên hoặc Đội..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg shadow-sm w-full sm:w-80 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {props.isAuth && (
          <div className="flex space-x-3">
            <button
              onClick={() => handleCreate('create')}
              className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition duration-300"
            >
              + Tạo VĐV Mới
            </button>
            <button
              onClick={() => handleCreate('view-teams')}
              className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition duration-300"
            >
              Quản lý Teams
            </button>
            <button
              onClick={() => navigate('view-accounts')}
              className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-700 transition duration-300"
            >
              Accounts
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-600 p-4 mb-4 bg-red-100 border border-red-400 rounded-lg text-center font-semibold">
          {error}
        </div>
      )}

      {/* Hiển thị Loading */}
      {isLoading && !error ? (
        <div className="text-center p-10 text-xl font-semibold text-indigo-600">
          Đang tải danh sách vận động viên...
        </div>
      ) : (
        // Datat
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
                  className="px-6 py-3 text-xs font-medium text-white uppercase tracking-wider text-center"
                >
                  Team
                </th>
                {props.isAuth && (
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider"
                    colSpan={2}
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBowlers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    {search
                      ? `Không tìm thấy VĐV nào với từ khóa "${search}".`
                      : 'Không có dữ liệu vận động viên (hoặc server chưa chạy).'}
                  </td>
                </tr>
              ) : (
                filteredBowlers.map((b) => (
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
                    <td className="px-2 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => handleTeam(b.teamId)}
                        className="text-yellow-600 hover:text-indigo-900 transition duration-150"
                      >
                        {b?.team?.teamName || 'N/A'}
                      </button>
                    </td>
                    {props.isAuth && (
                      <>
                        <td className="px-2 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => handleEdit(b.bowlerId)}
                            className="text-indigo-600 hover:text-indigo-900 transition duration-150"
                          >
                            Edit
                          </button>
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => handleDelete(b.bowlerId)}
                            className="text-red-600 hover:text-red-900 transition duration-150"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
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

export default BowlersTable;
