import { useState } from "react";
import axios from "axios";

export default function AddExpenseModal({ groupId, onClose, onAdded }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const addExpense = async () => {
    if (!description || !amount) return;

    await axios.post(
      "http://localhost:5000/api/expenses",
      {
        groupId,
        description,
        amount: Number(amount),
        splitType: "EQUAL",
      },
      { headers }
    );

    onClose();
    onAdded();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Add Expense</h3>

        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button className="primary" onClick={addExpense}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
