import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface Teams {
  teamId: number;
  teamName: string;
  captainId: number;
}

interface BowlerPostDto {
  bowlerFirstName: string;
  bowlerLastName: string;
  bowlerAddress: string;
  bowlerPhoneNumber: string;
  teamId: number | null;
}

function Create() {
  const navi = useNavigate();

  const [teams, setTeams] = useState<Teams[]>([]);
  const [formData, setFormData] = useState<BowlerPostDto>({
    bowlerFirstName: '',
    bowlerLastName: '',
    bowlerAddress: '',
    bowlerPhoneNumber: '',
    teamId: null,
  });

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const rsp = await fetch(
          'http://localhost:5231/api/BowlingLeague/teams',
        );
        if (!rsp.ok) throw new Error('Failed to fetch teams');

        const teamList: Teams[] = await rsp.json();
        console.log('✅ Teams fetched:', teamList);
        setTeams(teamList);

        if (teamList.length > 0) {
          setFormData((prev) => ({
            ...prev,
            teamId: teamList[0].teamId,
          }));
        }
      } catch (error) {
        console.error('❌ Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'teamId' ? (value ? parseInt(value) : null) : value,
    }));
  };

  const handleCreateBowler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.teamId) {
      alert('Vui lòng chọn đội!');
      return;
    }

    try {
      const rsp = await fetch('http://localhost:5231/api/BowlingLeague', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!rsp.ok) {
        const errorText = await rsp.text();
        throw new Error(
          `Tạo bowler thất bại. Status: ${rsp.status}. Details: ${errorText}`,
        );
      }

      alert('Tạo vận động viên thành công!');
      navi('/');
    } catch (error) {
      console.error('❌ Error creating bowler:', error);
      alert('Tạo vận động viên thất bại: ' + (error as Error).message);
    }
  };

  const handleGoBack = () => {
    navi(-1);
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Create Bowler</h1>

      <form onSubmit={handleCreateBowler} style={{ textAlign: 'center' }}>
        {/* First Name */}
        <div className="row mb-3">
          <label className="col-sm-2 col-form-label">First Name:</label>
          <div className="col-sm-7">
            <input
              type="text"
              className="form-control"
              name="bowlerFirstName"
              value={formData.bowlerFirstName}
              onChange={handleInputChange}
              placeholder="First Name"
              required
            />
          </div>
        </div>

        {/* Last Name */}
        <div className="row mb-3">
          <label className="col-sm-2 col-form-label">Last Name:</label>
          <div className="col-sm-7">
            <input
              type="text"
              className="form-control"
              name="bowlerLastName"
              value={formData.bowlerLastName}
              onChange={handleInputChange}
              placeholder="Last Name"
              required
            />
          </div>
        </div>

        {/* Phone */}
        <div className="row mb-3">
          <label className="col-sm-2 col-form-label">Phone:</label>
          <div className="col-sm-7">
            <input
              type="text"
              className="form-control"
              name="bowlerPhoneNumber"
              value={formData.bowlerPhoneNumber}
              onChange={handleInputChange}
              placeholder="Phone Number"
            />
          </div>
        </div>

        {/* Address */}
        <div className="row mb-3">
          <label className="col-sm-2 col-form-label">Address:</label>
          <div className="col-sm-7">
            <input
              type="text"
              className="form-control"
              name="bowlerAddress"
              value={formData.bowlerAddress}
              onChange={handleInputChange}
              placeholder="Address"
            />
          </div>
        </div>

        <div className="row mb-3">
          <label className="col-sm-2 col-form-label">Team:</label>
          <div className="col-sm-7">
            <select
              className="form-control"
              name="teamId"
              value={formData.teamId ? String(formData.teamId) : ''}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Chọn đội --</option>
              {teams.map((team) => (
                <option key={team.teamId} value={String(team.teamId)}>
                  {team.teamName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="mb-4">
          <button
            type="button"
            className="btn btn-secondary me-2"
            onClick={handleGoBack}
          >
            Quay lại
          </button>

          <button type="submit" className="btn btn-primary">
            Tạo Vận Động Viên
          </button>
        </div>

        <div>
          {/* <h5>Danh sách ID đội:</h5>
          {teams.length > 0 ? (
            teams.map((e) => (
              <p key={e.teamId}>
                ID: {e.teamId} | Tên: {e.teamName}
              </p>
            ))
          ) : (
            <p>⏳ Đang tải danh sách đội...</p>
          )} */}
        </div>
      </form>
    </div>
  );
}

export default Create;
