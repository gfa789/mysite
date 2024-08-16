import React, { useState, useEffect } from 'react';
import { db } from '../../firebase.config';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import LeagueTable from './LeagueTable';

function LeaguesTab() {
  const [leagues, setLeagues] = useState([]);
  const [newLeague, setNewLeague] = useState({ name: '', country: '' });
  const [editingLeague, setEditingLeague] = useState(null);
  const [viewingLeagueId, setViewingLeagueId] = useState(null);

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    const leaguesCollection = collection(db, 'leagues');
    const leaguesSnapshot = await getDocs(leaguesCollection);
    const leaguesList = leaguesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setLeagues(leaguesList);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLeague(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLeague) {
        await updateDoc(doc(db, 'leagues', editingLeague.id), newLeague);
        setEditingLeague(null);
      } else {
        await addDoc(collection(db, 'leagues'), newLeague);
      }
      setNewLeague({ name: '', country: '' });
      fetchLeagues();
    } catch (error) {
      console.error("Error adding/updating league: ", error);
    }
  };

  const handleEdit = (league) => {
    setEditingLeague(league);
    setNewLeague(league);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'leagues', id));
      fetchLeagues();
    } catch (error) {
      console.error("Error deleting league: ", error);
    }
  };

  const handleViewTable = (id) => {
    setViewingLeagueId(id);
  };

  return (
    <div>
      <h2>Leagues</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={newLeague.name}
          onChange={handleInputChange}
          placeholder="League Name"
          required
        />
        <input
          type="text"
          name="country"
          value={newLeague.country}
          onChange={handleInputChange}
          placeholder="Country"
          required
        />
        <button type="submit">{editingLeague ? 'Update League' : 'Add League'}</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Country</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leagues.map(league => (
            <tr key={league.id}>
              <td>{league.name}</td>
              <td>{league.country}</td>
              <td>
                <button onClick={() => handleEdit(league)}>Edit</button>
                <button onClick={() => handleDelete(league.id)}>Delete</button>
                <button onClick={() => handleViewTable(league.id)}>View Table</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {viewingLeagueId && <LeagueTable leagueId={viewingLeagueId} />}
    </div>
  );
}

export default LeaguesTab;