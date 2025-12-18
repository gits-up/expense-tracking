import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [balances, setBalances] = useState({ youOwe: [], youAreOwed: [] });
  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const fetchData = async () => {
    const g = await axios.get("http://localhost:5000/api/groups", { headers });
    setGroups(g.data);

    const b = await axios.get("http://localhost:5000/api/balances", { headers });
    setBalances(b.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createGroup = async () => {
    if (!groupName.trim()) return;

    await axios.post(
      "http://localhost:5000/api/groups",
      { name: groupName, members: [] },
      { headers }
    );

    setGroupName("");
    setShowModal(false);
    fetchData();
  };

  const settleBalance = async (from, to) => {
    await axios.post(
      "http://localhost:5000/api/balances/settle",
      { from, to },
      { headers }
    );
    fetchData();
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        Dashboard
        <button className="create-btn" onClick={() => setShowModal(true)}>
          + Create Group
        </button>
      </div>

      <div className="dashboard-grid">
        {/* GROUPS */}
        <div className="card">
          <div className="card-title">Your Groups</div>
          {groups.length === 0 && <p>No groups yet</p>}
          {groups.map((g) => (
            <div
              key={g._id}
              className="group-item"
              onClick={() => navigate(`/group/${g._id}`)}
            >
              {g.name}
            </div>
          ))}
        </div>

        {/* BALANCES */}
        <div className="card">
          <div className="card-title">Balances</div>

          <div className="balance-section">
            <div className="balance-owe">You Owe</div>
            {balances.youOwe.length === 0 && <p>Nothing owed</p>}
            {balances.youOwe.map((b) => (
              <div key={b._id} className="balance-item-row">
                <span>
                  ₹{b.amount} to {b.to.name}
                </span>
                <button
                  className="settle-btn"
                  onClick={() => settleBalance(b.from, b.to._id)}
                >
                  Settle
                </button>
              </div>
            ))}
          </div>

          <div className="balance-section">
            <div className="balance-get">You Are Owed</div>
            {balances.youAreOwed.length === 0 && <p>No dues</p>}
            {balances.youAreOwed.map((b) => (
              <div key={b._id} className="balance-item">
                ₹{b.amount} from {b.from.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create Group</h3>
            <input
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button className="primary" onClick={createGroup}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
