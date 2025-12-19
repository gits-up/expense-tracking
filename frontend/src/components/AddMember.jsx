import { useState } from "react";
import axios from "axios";

export default function AddMember({ groupId, onAdded }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const addMember = async () => {
    if (!email.trim()) return;

    try {
      await axios.post(
        `http://localhost:5000/api/groups/${groupId}/add-member`,
        { email },
        { headers }
      );
      setMsg("Member added");
      setEmail("");
      onAdded();
    } catch (err) {
      setMsg(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="add-member">
      <input
        placeholder="Add member by email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={addMember}>Add</button>
      {msg && <p>{msg}</p>}
    </div>
  );
}
