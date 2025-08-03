import { useEffect, useState } from "react";
import axios from "axios";
import { Trash } from 'lucide-react';
import '../styles/agent.css';

const MembersPage = ({ userId }) => {
  const [members, setMembers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({ fullName: ""});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`/api/members`)
      .then(res => setMembers(res.data || []))
      .catch(err => {
        console.error("Error fetching members", err);
        setMembers([]);
      });
  }, [userId]);

  const handleAddClick = () => setShowAddForm(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMember(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`/api/members`, {
        MEMBER_NAME: newMember.fullName,
      });
      setMembers(prev => [...prev, res.data]);
      setNewMember({ fullName: ""});
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to add member", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this member?")) return;
    try {
      await axios.delete(`/api/members/${id}`);
      setMembers(prev => prev.filter(m => m.USER_ID !== id));
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const toggleAdmin = async (id, makeAdmin) => {
    const action = makeAdmin ? "make this member an admin" : "remove this member as admin";
    if (!window.confirm(`Are you sure you want to ${action}?`)) return;

    try {
      await axios.post(`/api/members/${id}/${makeAdmin ? "make_admin" : "remove_admin"}`);
      setMembers(prev =>
        prev.map(m => m.USER_ID === id ? { ...m, ADMIN: makeAdmin } : m)
      );
    } catch (err) {
      console.error("Failed to toggle admin", err);
    }
  };

  return (
    <div className="agents-container">
      <h2>Members</h2>
      

      <div className="spacer" />

      {members.length > 0 ? (
        members.map((member, index) => (
          <div key={index} className="agent-card">
            <div className="agent-info">
              <p className="agent-name">{member.MEMBER_NAME}</p>
            </div>
            <div className="button-container">
              
             
              {!member.ADMIN && (
                <button className="make-admin-button" onClick={() => toggleAdmin(member.USER_ID, true)}>Make Admin</button>
              )}
              {member.ADMIN && (
                <button className="remove-admin-button" onClick={() => toggleAdmin(member.USER_ID, false)}>Remove Admin</button>
              )}
              <button
                className="delete-button"
                onClick={() => handleDelete(member.USER_ID)}
                title="Remove member"
              >
                <Trash size={20} className="trash-icon"/>
                 </button>
            </div>
          </div>
        ))
      ) : (
        <p>No members found.</p>
      )}
      <button className="add-agent-button" onClick={handleAddClick}>Add New Member</button>

      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="add-agent-form" style={{ marginTop: "1rem" }}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={newMember.fullName}
            onChange={handleInputChange}
            required
          />
          
          <button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Member"}
          </button>
          <button type="button" onClick={() => setShowAddForm(false)} disabled={loading} style={{ marginLeft: '0.5rem' }}>
            Cancel
          </button>
        </form>
      )}
    </div>
    
  );
};

export default MembersPage;