// src/component/Home/BowlerForm.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchTeams,
  fetchBowlerDetails,
  saveBowler,
} from '../../services/api.services';

type UiTeam = { id: string; name: string };

const initialFormData = {
  bowlerId: 0,
  bowlerFirstName: '',
  bowlerLastName: '',
  bowlerMiddleInit: '',
  bowlerAddress: '',
  bowlerCity: '',
  bowlerState: '',
  bowlerZip: '',
  bowlerPhoneNumber: '',
  teamId: '',
  isDeleted: false,
};

const BowlerForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const isEditMode = id !== undefined && id !== 'new';
  const pageTitle = isEditMode
    ? 'Chỉnh Sửa Vận Động Viên'
    : 'Tạo Vận Động Viên Mới';

  const [teamsRaw, setTeamsRaw] = useState<any[]>([]);
  const [teams, setTeams] = useState<UiTeam[]>([]);
  const [formData, setFormData] = useState<any>(initialFormData);
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ------- Helpers -------
  const normalizeTeams = (list: any[]): UiTeam[] => {
    if (!Array.isArray(list)) return [];
    return list
      .map((t) => {
        const idVal = t?.TeamId ?? t?.teamId ?? t?.id ?? t?.TeamID;
        const nameVal =
          t?.teamName ??
          t?.TeamName ??
          t?.name ??
          (idVal != null ? `Team #${idVal}` : undefined);
        if (idVal == null || nameVal == null) return null;
        return { id: String(idVal), name: String(nameVal) } as UiTeam;
      })
      .filter(Boolean) as UiTeam[];
  };

  useEffect(() => {
    setTeams(normalizeTeams(teamsRaw));
  }, [teamsRaw]);

  //  data -------
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        // 1) Teams
        const t = await fetchTeams();
        if (!cancelled) setTeamsRaw(Array.isArray(t) ? t : []);

        // 2) Bowler when editing
        if (isEditMode && id) {
          const b = await fetchBowlerDetails(id);
          if (!cancelled) {
            setFormData({
              ...initialFormData,
              ...b,
              teamId: (b?.teamId ?? b?.teamId ?? b?.teamId ?? '').toString(),
              bowlerZip: (b?.bowlerZip ?? '').toString(),
              bowlerMiddleInit: b?.bowlerMiddleInit ?? '',
              bowlerId: b?.bowlerId ?? b?.bowlerId ?? 0,
            });
          }
        }
      } catch (e: any) {
        if (!cancelled) setStatus(`❌ Lỗi tải dữ liệu: ${e?.message ?? e}`);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id, isEditMode]);

  const selectedTeamId = formData?.teamId ? String(formData.teamId) : '';
  const hasTeams = teams.length > 0;

  // ------- Handlers -------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  // ------- Handlers -------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(isEditMode ? 'Đang cập nhật...' : 'Đang tạo mới...');

    const payload = {
      ...formData,
      teamId: selectedTeamId ? parseInt(selectedTeamId, 10) : null,
      bowlerId: isEditMode ? (formData?.bowlerId ?? 0) : 0,
      isDeleted: false,
      bowlerMiddleInit: formData?.bowlerMiddleInit || null,
    };

    try {
      await saveBowler(payload, id);
      setStatus(
        `✅ ${pageTitle} thành công! Đang chuyển hướng về trang chủ...`,
      );
      setTimeout(() => navigate('/'), 1200);
    } catch (e: any) {
      setStatus(
        `❌ Lỗi ${isEditMode ? 'cập nhật' : 'tạo mới'}: ${e?.message ?? e}`,
      );
    }
  };

  // ------- UI -------
  if (isLoading) {
    return (
      <div className="text-center p-10 text-xl font-semibold text-indigo-600">
        Đang tải form...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-8 bg-white shadow-xl rounded-lg my-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">
        {pageTitle}
      </h1>

      {status && (
        <p
          className={`p-3 rounded-md text-center ${status.startsWith('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
        >
          {status}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Họ Tên */}
        <input
          type="text"
          name="bowlerFirstName"
          value={formData.bowlerFirstName}
          onChange={handleChange}
          placeholder="Tên (First Name)"
          required
          className="border p-2 rounded-md w-full"
        />

        <input
          type="text"
          name="bowlerMiddleInit"
          value={formData.bowlerMiddleInit || ''}
          onChange={handleChange}
          placeholder="Chữ lót (Middle Init - Tùy chọn)"
          className="border p-2 rounded-md w-full"
        />

        <input
          type="text"
          name="bowlerLastName"
          value={formData.bowlerLastName}
          onChange={handleChange}
          placeholder="Họ (Last Name)"
          required
          className="border p-2 rounded-md w-full"
        />

        {/* Địa chỉ */}
        <input
          type="text"
          name="bowlerAddress"
          value={formData.bowlerAddress}
          onChange={handleChange}
          placeholder="Địa chỉ (Address)"
          required
          className="border p-2 rounded-md w-full"
        />

        <input
          type="text"
          name="bowlerCity"
          value={formData.bowlerCity}
          onChange={handleChange}
          placeholder="Thành phố (City)"
          required
          className="border p-2 rounded-md w-full"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="bowlerState"
            value={formData.bowlerState}
            onChange={handleChange}
            placeholder="Bang/Tỉnh (State)"
            required
            className="border p-2 rounded-md w-full"
          />
          <input
            type="text"
            name="bowlerZip"
            value={formData.bowlerZip}
            onChange={handleChange}
            placeholder="Mã bưu điện (Zip)"
            required
            className="border p-2 rounded-md w-full"
          />
        </div>

        {/* Điện thoại */}
        <input
          type="text"
          name="bowlerPhoneNumber"
          value={formData.bowlerPhoneNumber}
          onChange={handleChange}
          placeholder="Số điện thoại (Phone)"
          required
          className="border p-2 rounded-md w-full"
        />

        {/* Team Select (robust) */}
        <div>
          <label className="block mb-1 font-medium">Đội</label>
          <select
            name="teamId"
            value={selectedTeamId}
            onChange={handleChange}
            required
            className="border p-2 rounded-md w-full"
          >
            <option value="">-- Chọn đội --</option>
            {hasTeams ? (
              teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))
            ) : (
              <option value="" disabled>
                (Không có đội nào — kiểm tra API fetchTeams)
              </option>
            )}
          </select>
          {!hasTeams && (
            <div className="text-sm text-amber-700 mt-1">
              Không thấy danh sách đội. Hãy kiểm tra API hoặc cấu hình CORS, sau
              đó tải lại trang.
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-700 transition duration-300"
        >
          {isEditMode ? 'Lưu Thay Đổi' : 'Tạo Mới'}
        </button>
      </form>

      <button
        onClick={() => navigate('/')}
        className="mt-4 w-full bg-gray-400 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-gray-500 transition duration-300"
      >
        Quay lại
      </button>
    </div>
  );
};

export default BowlerForm;
