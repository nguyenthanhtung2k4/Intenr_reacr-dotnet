import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  softDeleteBowler,
  fetchBowlerDetails,
} from '../../services/api.services';

function Delete() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState('');
  const [bowlerName, setBowlerName] = useState('Vận động viên này');

  useEffect(() => {
    if (id) {
      fetchBowlerDetails(id)
        .then((response) => {
          setBowlerName(
            `${response.bowlerFirstName} ${response.bowlerLastName}`,
          );
        })
        .catch(() => {
          setBowlerName('Không tìm thấy tên vận động viên');
        });
    }
  }, [id]);

  const handleDelete = async () => {
    if (!id) {
      setStatusMessage('❌ Lỗi: Không tìm thấy ID vận động viên.');
      return;
    }

    setStatusMessage(`Đang xóa mềm ${bowlerName}...`);

    try {
      await softDeleteBowler(id);

      setStatusMessage(
        `✅ Xóa mềm ${bowlerName} thành công! Đang chuyển hướng...`,
      );

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Lỗi khi xóa mềm:', error);
      setStatusMessage(
        '❌ Lỗi: Không thể xóa mềm vận động viên. Vui lòng kiểm tra API.',
      );
    }
  };

  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '400px',
        margin: 'auto',
        textAlign: 'center',
        border: '1px solid #ff4d4d',
        borderRadius: '8px',
      }}
    >
      <h1>Xác nhận Xóa Mềm</h1>
      <p>
        Bạn có chắc chắn muốn xóa mềm **{bowlerName}** (ID: {id}) không?
      </p>

      <button
        onClick={handleDelete}
        style={{
          padding: '10px 20px',
          marginTop: '20px',
          backgroundColor: '#ff4d4d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
        disabled={statusMessage.includes('Đang xóa')}
      >
        Xác nhận Xóa Mềm
      </button>

      {statusMessage && (
        <p
          style={{
            marginTop: '15px',
            fontWeight: 'bold',
            color: statusMessage.startsWith('❌') ? 'red' : 'green',
          }}
        >
          {statusMessage}
        </p>
      )}
    </div>
  );
}

export default Delete;
