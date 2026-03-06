// src/component/Home/BowlerForm.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchTeams, fetchBowlerDetails, saveBowler } from '../../../core/api';

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
  const pageTitle = isEditMode ? 'Chỉnh Sửa Vận Động Viên' : 'Tạo Vận Động Viên Mới';

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
          t?.teamName ?? t?.TeamName ?? t?.name ?? (idVal != null ? `Team #${idVal}` : undefined);
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
            const bAny = b as any;
            setFormData({
              ...initialFormData,
              ...b,
              teamId: (bAny.teamId ?? bAny.TeamId ?? bAny.teamID ?? '').toString(),
              bowlerZip: (bAny.bowlerZip ?? bAny.BowlerZip ?? bAny.ZipCode ?? '').toString(),
              bowlerMiddleInit: bAny.bowlerMiddleInit ?? bAny.BowlerMiddleInit ?? '',
              bowlerId: bAny.BowlerId ?? bAny.bowlerId ?? 0,
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      setStatus(`✅ ${pageTitle} thành công! Đang chuyển hướng về trang chủ...`);
      setTimeout(() => navigate('/bowlers'), 1200);
    } catch (e: any) {
      setStatus(`❌ Lỗi ${isEditMode ? 'cập nhật' : 'tạo mới'}: ${e?.message ?? e}`);
    }
  };

  // ------- UI -------
  if (isLoading) {
    return (
      <div className="text-center p-20 pt-32">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00f3ff] mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-12 bg-slate-50 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="inline-block px-4 py-1.5 mb-4 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest">
            Athlete Management
          </div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">
            {isEditMode ? 'Edit' : 'Register'} <span className="text-blue-600">Player</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Please fill in the details below to save the athlete profile
          </p>
        </div>

        {/* Status Message */}
        {status && (
          <div
            className={`p-4 rounded-2xl mb-8 flex items-center gap-3 animate-fade-in border-l-4 ${
              status.startsWith('❌')
                ? 'bg-red-50 border-red-500 text-red-700'
                : 'bg-blue-50 border-blue-600 text-blue-700'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                status.startsWith('❌') ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
              }`}
            >
              {status.startsWith('❌') ? '!' : '✓'}
            </div>
            <p className="font-bold text-sm tracking-tight">{status}</p>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
            {/* Identity Section */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <span className="w-6 h-px bg-slate-200"></span> Personal Identity
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="bowlerFirstName"
                    value={formData.bowlerFirstName}
                    onChange={handleChange}
                    placeholder="e.g. John"
                    required
                    className="w-full px-2 py-2 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="bowlerLastName"
                    value={formData.bowlerLastName}
                    onChange={handleChange}
                    placeholder="e.g. Doe"
                    required
                    className="w-full px-2 py-2 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <span className="w-6 h-px bg-slate-200"></span> Contact & Location
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    Home Address
                  </label>
                  <input
                    type="text"
                    name="bowlerAddress"
                    value={formData.bowlerAddress}
                    onChange={handleChange}
                    placeholder="Enter street address"
                    required
                    className="w-full px-2 py-2 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="bowlerCity"
                      value={formData.bowlerCity}
                      onChange={handleChange}
                      placeholder="City"
                      required
                      className="w-full px-2 py-2 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="bowlerState"
                      value={formData.bowlerState}
                      onChange={handleChange}
                      placeholder="State"
                      required
                      className="w-full px-2 py-2 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      name="bowlerZip"
                      value={formData.bowlerZip}
                      onChange={handleChange}
                      placeholder="Zip"
                      required
                      className="w-full px-2 py-2 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      ☏
                    </span>
                    <input
                      type="text"
                      name="bowlerPhoneNumber"
                      value={formData.bowlerPhoneNumber}
                      onChange={handleChange}
                      placeholder="000-000-0000"
                      required
                      className="w-full pl-10 pr-2 py-2 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Roster Assignment */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <span className="w-6 h-px bg-slate-200"></span> League Placement
              </h3>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                  Team Assignment
                </label>
                <div className="relative">
                  <select
                    name="teamId"
                    value={selectedTeamId}
                    onChange={handleChange}
                    required
                    className="w-full px-2 py-2 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 outline-none appearance-none transition-all font-bold text-slate-800"
                  >
                    <option value="">-- Select Team --</option>
                    {hasTeams ? (
                      teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        (No teams available)
                      </option>
                    )}
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest shadow-xl shadow-blue-200"
              >
                {isEditMode ? 'Update Athlete' : 'Create Athlete'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/bowlers')}
                className="w-full py-4 rounded-2xl border-2 border-slate-100 text-slate-400 font-black hover:bg-slate-50 hover:text-slate-600 transition-all uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BowlerForm;
