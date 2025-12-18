import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AddExpenseModal from "../components/AddExpenseModal";
import "../styles/dashboard.css";

export default function GroupDetails() {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const fetchExpenses = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/groups/${id}/expenses`,
      { headers }
    );
    setExpenses(res.data);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        Group Expenses
        <button className="create-btn" onClick={() => setShowModal(true)}>
          + Add Expense
        </button>
      </div>

      <div className="card">
        {expenses.length === 0 && <p>No expenses yet</p>}
        {expenses.map((e) => (
          <div key={e._id} className="group-item">
            {e.description} — ₹{e.amount}
          </div>
        ))}
      </div>

      {showModal && (
        <AddExpenseModal
          groupId={id}
          onClose={() => setShowModal(false)}
          onAdded={fetchExpenses}
        />
      )}
    </div>
  );
}
