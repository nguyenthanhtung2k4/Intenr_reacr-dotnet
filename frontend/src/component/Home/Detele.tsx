import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

function Delete() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  console.log(id);
  return (
    <div className="Delete">
      <h1>Create Bowler</h1>
    </div>
  );
}
export default Delete;
