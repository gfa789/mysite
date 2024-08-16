import React, { useState, useEffect } from 'react';
import { db } from '../../firebase.config';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

function ResultsTab() {
  const [results, setResults] = useState([]);
  const [newResult, setNewResult] = useState({ 
    homeTeam: '', 
    awayTeam: '', 
    homeGoals: 0, 
    awayGoals: 0, 
    season: '', 
    matchDay: 0,
    date: '',
    goalScorers: ''
  });
  const [editingResult, setEditingResult] = useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    const resultsCollection = collection(db, 'results');
    const resultsSnapshot = await getDocs(resultsCollection);
    const resultsList = resultsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setResults(resultsList);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewResult(prev => ({ 
      ...prev, 
      [name]: ['homeGoals', 'awayGoals', 'matchDay'].includes(name) ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingResult) {
        await updateDoc(doc(db, 'results', editingResult.id), newResult);
        setEditingResult(null);
      } else {
        await addDoc(collection(db, 'results'), newResult);
      }
      setNewResult({ 
        homeTeam: '', 
        awayTeam: '', 
        homeGoals: 0, 
        awayGoals: 0, 
        season: '', 
        matchDay: 0,
        date: '',
        goalScorers: ''
      });
      fetchResults();
    } catch (error) {
      console.error("Error adding/updating result: ", error);
    }
  };

  const handleEdit = (result) => {
    setEditingResult(result);
    setNewResult(result);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'results', id));
      fetchResults();
    } catch (error) {
      console.error("Error deleting result: ", error);
    }
  };

  return (
    <div>
      <h2>Results</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="homeTeam"
          value={newResult.homeTeam}
          onChange={handleInputChange}
          placeholder="Home Team"
          required
        />
        <input
          type="text"
          name="awayTeam"
          value={newResult.awayTeam}
          onChange={handleInputChange}
          placeholder="Away Team"
          required
        />
        <input
          type="number"
          name="homeGoals"
          value={newResult.homeGoals}
          onChange={handleInputChange}
          placeholder="Home Goals"
          required
        />
        <input
          type="number"
          name="awayGoals"
          value={newResult.awayGoals}
          onChange={handleInputChange}
          placeholder="Away Goals"
          required
        />
        <input
          type="text"
          name="season"
          value={newResult.season}
          onChange={handleInputChange}
          placeholder="Season"
          required
        />
        <input
          type="number"
          name="matchDay"
          value={newResult.matchDay}
          onChange={handleInputChange}
          placeholder="Match Day"
          required
        />
        <input
          type="date"
          name="date"
          value={newResult.date}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="goalScorers"
          value={newResult.goalScorers}
          onChange={handleInputChange}
          placeholder="Goal Scorers (comma separated)"
        />
        <button type="submit">{editingResult ? 'Update Result' : 'Add Result'}</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Home Team</th>
            <th>Away Team</th>
            <th>Score</th>
            <th>Season</th>
            <th>Match Day</th>
            <th>Date</th>
            <th>Goal Scorers</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {results.map(result => (
            <tr key={result.id}>
              <td>{result.homeTeam}</td>
              <td>{result.awayTeam}</td>
              <td>{result.homeGoals} - {result.awayGoals}</td>
              <td>{result.season}</td>
              <td>{result.matchDay}</td>
              <td>{result.date}</td>
              <td>{result.goalScorers}</td>
              <td>
                <button onClick={() => handleEdit(result)}>Edit</button>
                <button onClick={() => handleDelete(result.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ResultsTab;