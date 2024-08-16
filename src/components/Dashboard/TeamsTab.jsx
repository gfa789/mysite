import React, { useState, useEffect } from 'react';
import { db } from '../../firebase.config';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

function TeamsTab() {
  const [teams, setTeams] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [newTeam, setNewTeam] = useState({ 
    name: '', 
    color: '', 
    wins: 0, 
    losses: 0, 
    draws: 0, 
    goalsFor: 0, 
    goalsAgainst: 0,
    points: 0,
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
    setNewTeam(prev => ({ 
      ...prev, 
      [name]: ['wins', 'losses', 'draws', 'goalsFor', 'goalsAgainst', 'points'].includes(name) 
        ? Number(value) 
        : value 
    }));
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
        wins: 0, 
        losses: 0, 
        draws: 0, 
        goalsFor: 0, 
        goalsAgainst: 0,
        points: 0,
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
        <input
          type="number"
          name="wins"
          value={newTeam.wins}
          onChange={handleInputChange}
          placeholder="Wins"
          required
        />
        <input
          type="number"
          name="losses"
          value={newTeam.losses}
          onChange={handleInputChange}
          placeholder="Losses"
          required
        />
        <input
          type="number"
          name="draws"
          value={newTeam.draws}
          onChange={handleInputChange}
          placeholder="Draws"
          required
        />
        <input
          type="number"
          name="goalsFor"
          value={newTeam.goalsFor}
          onChange={handleInputChange}
          placeholder="Goals For"
          required
        />
        <input
          type="number"
          name="goalsAgainst"
          value={newTeam.goalsAgainst}
          onChange={handleInputChange}
          placeholder="Goals Against"
          required
        />
        <input
          type="number"
          name="points"
          value={newTeam.points}
          onChange={handleInputChange}
          placeholder="Points"
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
            <th>Wins</th>
            <th>Losses</th>
            <th>Draws</th>
            <th>GF</th>
            <th>GA</th>
            <th>Points</th>
            <th>League</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teams.map(team => (
            <tr key={team.id}>
              <td>{team.name}</td>
              <td>{team.color}</td>
              <td>{team.wins}</td>
              <td>{team.losses}</td>
              <td>{team.draws}</td>
              <td>{team.goalsFor}</td>
              <td>{team.goalsAgainst}</td>
              <td>{team.points}</td>
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