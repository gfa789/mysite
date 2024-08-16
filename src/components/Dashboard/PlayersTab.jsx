import React, { useState, useEffect } from 'react';
import { db } from '../../firebase.config';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

function PlayersTab() {
  const [players, setPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState({ 
    name: '', 
    age: 0, 
    team: '', 
    goals: 0, 
    assists: 0
  });
  const [editingPlayer, setEditingPlayer] = useState(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    const playersCollection = collection(db, 'players');
    const playersSnapshot = await getDocs(playersCollection);
    const playersList = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPlayers(playersList);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPlayer(prev => ({ ...prev, [name]: name === 'name' || name === 'team' ? value : Number(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlayer) {
        await updateDoc(doc(db, 'players', editingPlayer.id), newPlayer);
        setEditingPlayer(null);
      } else {
        await addDoc(collection(db, 'players'), newPlayer);
      }
      setNewPlayer({ name: '', age: 0, team: '', goals: 0, assists: 0 });
      fetchPlayers();
    } catch (error) {
      console.error("Error adding/updating player: ", error);
    }
  };

  const handleEdit = (player) => {
    setEditingPlayer(player);
    setNewPlayer(player);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'players', id));
      fetchPlayers();
    } catch (error) {
      console.error("Error deleting player: ", error);
    }
  };

  return (
    <div>
      <h2>Players</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={newPlayer.name}
          onChange={handleInputChange}
          placeholder="Player Name"
          required
        />
        <input
          type="number"
          name="age"
          value={newPlayer.age}
          onChange={handleInputChange}
          placeholder="Age"
          required
        />
        <input
          type="text"
          name="team"
          value={newPlayer.team}
          onChange={handleInputChange}
          placeholder="Team"
          required
        />
        <input
          type="number"
          name="goals"
          value={newPlayer.goals}
          onChange={handleInputChange}
          placeholder="Goals"
          required
        />
        <input
          type="number"
          name="assists"
          value={newPlayer.assists}
          onChange={handleInputChange}
          placeholder="Assists"
          required
        />
        <button type="submit">{editingPlayer ? 'Update Player' : 'Add Player'}</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Team</th>
            <th>Goals</th>
            <th>Assists</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {players.map(player => (
            <tr key={player.id}>
              <td>{player.name}</td>
              <td>{player.age}</td>
              <td>{player.team}</td>
              <td>{player.goals}</td>
              <td>{player.assists}</td>
              <td>
                <button onClick={() => handleEdit(player)}>Edit</button>
                <button onClick={() => handleDelete(player.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PlayersTab;