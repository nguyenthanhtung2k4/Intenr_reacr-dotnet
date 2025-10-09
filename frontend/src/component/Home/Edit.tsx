import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Bowler } from '../../types/Bowler';

function Edit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [bowler, setBowler] = useState<Bowler | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    phone: '',
    // Thêm các trường khác cần chỉnh sửa
  });

  // 1. Tải dữ liệu Bowler
  useEffect(() => {
    if (!id) return;

    const fetchBowlerDetails = async () => {
      try {
        const rsp = await fetch(
          `http://localhost:5231/api/BowlingLeague/${id}`,
        );
        if (!rsp.ok) {
          throw new Error('Failed to fetch bowler details from API');
        }
        const bowlerDetails: Bowler = await rsp.json();

        setBowler(bowlerDetails);

        // Khởi tạo giá trị form với dữ liệu lấy được
        setFormData({
          firstName: bowlerDetails.bowlerFirstName || '',
          lastName: bowlerDetails.bowlerLastName || '',
          address: bowlerDetails.bowlerAddress || '',
          phone: bowlerDetails.bowlerPhoneNumber || '',
        });
      } catch (error) {
        console.error(`Error fetching bowler with ID ${id}:`, error);
        setBowler(null);
      }
    };

    fetchBowlerDetails();
  }, [id]);

  console.log('Data:', formData);

  // Xử lý thay đổi trong input form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // 2. Hàm xử lý PATCH (Cập nhật một phần)
  const handleSaveChanges = async () => {
    if (!bowler || !id) {
      alert('Lỗi: Không tìm thấy dữ liệu gốc hoặc ID để cập nhật.');
      return;
    }

    // Patch gui di
    const patchData: any = {};

    if (formData.firstName !== bowler.bowlerFirstName) {
      patchData.BowlerFirstName = formData.firstName;
    }
    if (formData.lastName !== bowler.bowlerLastName) {
      patchData.BowlerLastName = formData.lastName;
    }
    if (formData.address !== bowler.bowlerAddress) {
      patchData.BowlerAddress = formData.address;
    }
    if (formData.phone !== bowler.bowlerPhoneNumber) {
      patchData.bowlerPhoneNumber = formData.phone;
    }

    if (Object.keys(patchData).length === 0) {
      alert('Không có thay đổi nào được thực hiện.');
      navigate('/');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5231/api/BowlingLeague/${id}`,
        {
          method: 'PATCH', // Sử dụng PATCH
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(patchData),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch. Chi tiết: ${response.statusText || errorText}`,
        );
      }

      alert('Cập nhật thành công!');
      navigate('/');
    } catch (error) {
      console.error('Lỗi khi lưu thay đổi:', error);
      alert(
        `Lỗi khi cập nhật dữ liệu: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
      );
    }
  };

  if (!bowler && id) {
    return (
      <div className="container">Đang tải thông tin Bowler ID: {id}...</div>
    );
  }

  if (!bowler && !id) {
    return <div className="container">Không tìm thấy ID để chỉnh sửa.</div>;
  }

  // Form hiển thị dữ liệu
  return (
    <div className="container">
      <h2>
        Chỉnh Sửa Bowler: {bowler?.bowlerFirstName} {bowler?.bowlerLastName}{' '}
        (ID: {id})
      </h2>

      <form>
        {/* Input First Name */}
        <div className="row mb-3">
          <label className="col-sm-2 col-form-label">First Name:</label>
          <div className="col-sm-10">
            <input
              type="text"
              className="form-control"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
            />
          </div>
        </div>
        {/* Input Last Name */}
        <div className="row mb-3">
          <label className="col-sm-2 col-form-label">Last Name:</label>
          <div className="col-sm-10">
            <input
              type="text"
              className="form-control"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
            />
          </div>
        </div>
        {/* Input Address */}
        <div className="row mb-3">
          <label className="col-sm-2 col-form-label">Address:</label>
          <div className="col-sm-10">
            <input
              type="text"
              className="form-control"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>
        </div>
        {/* Input Phone */}
        <div className="row mb-3">
          <label className="col-sm-2 col-form-label">Phone:</label>
          <div className="col-sm-10">
            <input
              type="text"
              className="form-control"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <br />

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

export default Edit;
