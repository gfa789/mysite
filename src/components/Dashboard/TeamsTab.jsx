import React, { useState, useEffect } from 'react';
import { db } from '../../firebase.config';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

function TeamsTab() {
  const [teams, setTeams] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [newTeam, setNewTeam] = useState({ 
    name: '', 
    color: '', 
    leagueId: ''
  });
  const [editingTeam, setEditingTeam] = useState(null);

  useEffect(() => {
    fetchTeams();
    fetchLeagues();
  }, []);

  const fetchTeams = async () => {
    const teamsCollection = collection(db, 'teams');
    const teamsSnapshot = await getDocs(teamsCollection);
    const teamsList = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTeams(teamsList);
  };

  const fetchLeagues = async () => {
    const leaguesCollection = collection(db, 'leagues');
    const leaguesSnapshot = await getDocs(leaguesCollection);
    const leaguesList = leaguesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setLeagues(leaguesList);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTeam(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        await updateDoc(doc(db, 'teams', editingTeam.id), newTeam);
        setEditingTeam(null);
      } else {
        await addDoc(collection(db, 'teams'), newTeam);
      }
      setNewTeam({ 
        name: '', 
        color: '', 
        leagueId: ''
      });
      fetchTeams();
    } catch (error) {
      console.error("Error adding/updating team: ", error);
    }
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setNewTeam(team);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'teams', id));
      fetchTeams();
    } catch (error) {
      console.error("Error deleting team: ", error);
    }
  };

  return (
    <div>
      <h2>Teams</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={newTeam.name}
          onChange={handleInputChange}
          placeholder="Team Name"
          required
        />
        <input
          type="text"
          name="color"
          value={newTeam.color}
          onChange={handleInputChange}
          placeholder="Team Color"
          required
        />
        <select
          name="leagueId"
          value={newTeam.leagueId}
          onChange={handleInputChange}
          required
        >
          <option value="">Select a League</option>
          {leagues.map(league => (
            <option key={league.id} value={league.id}>{league.name}</option>
          ))}
        </select>
        <button type="submit">{editingTeam ? 'Update Team' : 'Add Team'}</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Color</th>
            <th>League</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teams.map(team => (
            <tr key={team.id}>
              <td>{team.name}</td>
              <td>{team.color}</td>
              <td>{leagues.find(league => league.id === team.leagueId)?.name || 'N/A'}</td>
              <td>
                <button onClick={() => handleEdit(team)}>Edit</button>
                <button onClick={() => handleDelete(team.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TeamsTab;