import { useNavigate } from 'react-router-dom';

import { useState } from 'react';
// import { Bowler } from '../../types/Bowler';
function Create() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    phone: '',
    team: {
      teamName: '',
    },
    // Thêm các trường khác cần chỉnh sửa
  });
  const navi = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleGoBack = () => {
    navi(-1);
  };

  const handleSaveChanges = () => {
    console.log('');
  };

  console.log(formData);

  return (
    <div>
      <div className="Create">
        <h1>Create Bowler</h1>
      </div>
      <form action="" style={{ textAlign: 'center' }}>
        {/* name */}
        <div className="row mb-3">
          <label className="col-sm-2 col-form-label">First Name:</label>
          <div className="col-sm-7">
            <input
              type="text"
              className="form-control"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="firsName"
            />
          </div>
        </div>
        {/* name */}
        <div className="row mb-3">
          <label className="col-sm-2 col-form-label">Last Name:</label>
          <div className="col-sm-7">
            <input
              type="text"
              className="form-control"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="lastName"
            />
          </div>
        </div>
        {/* name */}
        <div className="row mb-3">
          <label className="col-sm-2 col-form-label">Phone:</label>
          <div className="col-sm-7">
            <input
              type="text"
              className="form-control"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="phone"
            />
          </div>
        </div>
        {/* name */}
        <div className="row mb-3">
          <label className="col-sm-2 col-form-label">Address: </label>
          <div className="col-sm-7">
            <input
              type="text"
              className="form-control"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="address"
            />
          </div>
        </div>
        {/* name */}
        <div className="row mb-3">
          <label className="col-sm-2 col-form-label">Team :</label>
          <div className="col-sm-7">
            <input
              type="text"
              className="form-control"
              name="team"
              value={formData.team.teamName}
              onChange={handleInputChange}
              placeholder="team"
            />
          </div>
        </div>
        <button
          type="button"
          className="btn btn-secondary me-2"
          onClick={handleGoBack}
        >
          Quay lại
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSaveChanges}
        >
          Lưu Thay Đổi
        </button>
      </form>
    </div>
  );
}
export default Create;
