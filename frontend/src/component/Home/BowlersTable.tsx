/* eslint-disable react/style-prop-object */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bowler } from '../../types/Bowler';

function BowlersTable(props: any) {
  const navigate = useNavigate();
  const [bowlerData, setBowlerData] = useState<Bowler[]>([]);
  const [search, setSearch] = useState('');

  // HandleEdit
  var handleEdit = (ID: number) => {
    console.log('EDIT', ID);
    navigate(`edit/${ID}`);
  };

  // HandleDelete
  var handleDelete = (ID: number) => {
    console.log('DELETE', ID);
    navigate(`delete/${ID}`);
  };
  // handleCreate
  var handleCreate = () => {
    navigate(`create/`);
  };

  // Updated to handle errors thrown when the backend isn't running (generated w/ help from ChatGPT)
  useEffect(() => {
    const fetchBowlerData = async () => {
      try {
        const rsp = await fetch('http://localhost:5231/api/BowlingLeague');
        if (!rsp.ok) {
          throw new Error('Failed to fetch data');
        }
        const b = await rsp.json();
        setBowlerData(b || []); // Set empty array if response is falsy
      } catch (error) {
        console.error('Error fetching data:', error);
        setBowlerData([]); // Set empty array in case of error
      }
    };

    fetchBowlerData();
  }, []);

  let filteredBowlers = bowlerData;

  // Lọc theo Teams được truyền từ props
  if (props.displayTeams && props.displayTeams.length > 0) {
    filteredBowlers = filteredBowlers.filter((b) =>
      props.displayTeams.includes(b.team?.teamName || ''),
    );
  }

  // Lọc theo ô tìm kiếm (search input)
  if (search) {
    const lowerCaseSearch = search.toLowerCase();
    filteredBowlers = filteredBowlers.filter(
      (b) =>
        b.bowlerLastName.toLowerCase().includes(lowerCaseSearch) ||
        b.team?.teamName.toLowerCase().includes(lowerCaseSearch) ||
        b.bowlerFirstName.toLowerCase().includes(lowerCaseSearch),
    );
  }

  return (
    <div>
      <div className="display" style={{ display: 'flex' }}>
        <div className="create">
          <button type="button" onClick={handleCreate}>
            Create
          </button>
        </div>
        <div
          className="search"
          style={{ marginLeft: 'auto', marginRight: 'auto', width: 350 }}
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Name"
          />
        </div>
      </div>
      <div className="row">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Last Name</th>
              <th>First Names</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Team</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filteredBowlers.map((b) => (
              <tr key={b.bowlerId}>
                <td>{b.bowlerLastName}</td>
                <td>
                  {b.bowlerFirstName}{' '}
                  {b.bowlerMiddleInit ? b.bowlerMiddleInit + '.' : ''}
                </td>
                <td>
                  {b.bowlerAddress}, {b.bowlerCity}, {b.bowlerState}{' '}
                  {b.bowlerZip}
                </td>
                <td>{b.bowlerPhoneNumber}</td>
                <td>{b.team?.teamName}</td>
                <td>
                  <button type="button" onClick={() => handleEdit(b.bowlerId)}>
                    Edit
                  </button>
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleDelete(b.bowlerId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BowlersTable;
