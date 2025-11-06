import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTeam } from '../../services/api.services';

interface TeamData {
  TeamId: string;
  TeamName: string;
  CaptainId: string;
}

const CreateTeams: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TeamData>({
    TeamId: '',
    TeamName: '',
    CaptainId: '',
  });

  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.TeamName) {
      setStatusMessage('❌ Tên đội không được để trống.');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Đang tạo đội...');

    const payload = {
      TeamName: formData.TeamName,
      CaptainId: formData.CaptainId ? parseInt(formData.CaptainId) : null,
    };

    try {
      await createTeam(payload);

      setStatusMessage('✅ Tạo đội thành công! Đang chuyển hướng...');

      setFormData({ TeamId: '', TeamName: '', CaptainId: '' });

      setTimeout(() => {
        navigate('/view-teams');
      }, 1500);
    } catch (error: any) {
      console.error('Lỗi khi tạo đội:', error);
      setStatusMessage(
        error.message || '❌ Lỗi: Không thể tạo đội. Vui lòng kiểm tra API.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  var handleCreate = (type: string) => {
    navigate(`/${type}`);
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white shadow-xl rounded-lg my-8">
      <h1 className="text-2xl font-bold mb-6 text-center text-indigo-700">
        Tạo Đội Mới
      </h1>

      {statusMessage && (
        <p
          className={`p-3 rounded-md mb-4 text-center ${statusMessage.startsWith('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
        >
          {statusMessage}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        {/* Input TeamName */}
        <div className="mb-4">
          <label
            htmlFor="TeamName"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Tên Đội:
          </label>
          <input
            id="TeamName"
            type="text"
            name="TeamName"
            value={formData.TeamName}
            onChange={handleChange}
            placeholder="Nhập tên đội"
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="CaptainId"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            ID Đội Trưởng (Tùy chọn):
          </label>
          <input
            id="CaptainId"
            type="text"
            name="CaptainId"
            value={formData.CaptainId}
            onChange={handleChange}
            placeholder="Nhập ID đội trưởng"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !formData.TeamName}
          className={`w-full font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ${isLoading || !formData.TeamName ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
        >
          {isLoading ? 'Đang Tạo...' : 'Tạo Đội'}
        </button>
      </form>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => handleCreate('view-teams')}
          className="w-full bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-700 transition duration-300"
        >
          Xem Danh Sách Đội
        </button>
      </div>
    </div>
  );
};

export default CreateTeams;
