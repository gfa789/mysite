import React, { useState, useEffect } from 'react';
import { db } from '../../firebase.config';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import './ResultsTab.css';

function ResultsTab() {
  const [results, setResults] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [newResult, setNewResult] = useState({ 
    leagueId: '',
    homeTeam: '',
    awayTeam: '',
    homeGoals: 0,
    awayGoals: 0,
    matchDay: 1,
    season: '',
    goalScorers: []
  });
  const [editingResult, setEditingResult] = useState(null);
  const [selectedLeague, setSelectedLeague] = useState('');

  const seasons = [
    '2018/19', '2019/20', '2020/21', '2021/22', '2022/23', '2023/24', '2024/25'
  ];

  useEffect(() => {
    fetchLeagues();
    fetchResults();
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      fetchTeams(selectedLeague);
    }
  }, [selectedLeague]);

  useEffect(() => {
    if (newResult.homeTeam || newResult.awayTeam) {
      fetchPlayers(newResult.homeTeam, newResult.awayTeam);
    }
  }, [newResult.homeTeam, newResult.awayTeam]);

  const fetchLeagues = async () => {
    const leaguesCollection = collection(db, 'leagues');
    const leaguesSnapshot = await getDocs(leaguesCollection);
    const leaguesList = leaguesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setLeagues(leaguesList);
  };

  const fetchResults = async () => {
    const resultsCollection = collection(db, 'results');
    const resultsSnapshot = await getDocs(resultsCollection);
    const resultsList = resultsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setResults(resultsList);
  };

  const fetchTeams = async (leagueId) => {
    const teamsQuery = query(collection(db, 'teams'), where("leagueId", "==", leagueId));
    const teamsSnapshot = await getDocs(teamsQuery);
    const teamsList = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTeams(teamsList);
  };

  const fetchPlayers = async (homeTeamId, awayTeamId) => {
    const playersQuery = query(collection(db, 'players'), where("teamId", "in", [homeTeamId, awayTeamId]));
    const playersSnapshot = await getDocs(playersQuery);
    const playersList = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPlayers(playersList);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewResult(prev => ({ 
      ...prev, 
      [name]: ['homeGoals', 'awayGoals', 'matchDay'].includes(name) ? Number(value) : value 
    }));
  };

  const handleLeagueChange = (e) => {
    const leagueId = e.target.value;
    setSelectedLeague(leagueId);
    setNewResult(prev => ({ ...prev, leagueId, homeTeam: '', awayTeam: '' }));
  };

  const handleGoalScorerChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setNewResult(prev => ({ ...prev, goalScorers: selectedOptions }));
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
        leagueId: '',
        homeTeam: '',
        awayTeam: '',
        homeGoals: 0,
        awayGoals: 0,
        matchDay: 1,
        season: '',
        goalScorers: []
      });
      fetchResults();
    } catch (error) {
      console.error("Error adding/updating result: ", error);
    }
  };

  const handleEdit = (result) => {
    setEditingResult(result);
    setNewResult(result);
    setSelectedLeague(result.leagueId);
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
    <div className="results-container">
      <h2>Results</h2>
      <form className="results-form" onSubmit={handleSubmit}>
        <select
          name="leagueId"
          value={newResult.leagueId}
          onChange={handleLeagueChange}
          required
        >
          <option value="">Select a League</option>
          {leagues.map(league => (
            <option key={league.id} value={league.id}>{league.name}</option>
          ))}
        </select>
        <select
          name="homeTeam"
          value={newResult.homeTeam}
          onChange={handleInputChange}
          required
        >
          <option value="">Select Home Team</option>
          {teams.map(team => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
        <select
          name="awayTeam"
          value={newResult.awayTeam}
          onChange={handleInputChange}
          required
        >
          <option value="">Select Away Team</option>
          {teams.filter(team => team.id !== newResult.homeTeam).map(team => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
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
          type="number"
          name="matchDay"
          value={newResult.matchDay}
          onChange={handleInputChange}
          min="1"
          max={teams.length - 1}
          required
        />
        <select
          name="season"
          value={newResult.season}
          onChange={handleInputChange}
          required
        >
          <option value="">Select Season</option>
          {seasons.map(season => (
            <option key={season} value={season}>{season}</option>
          ))}
        </select>
        <select
          multiple
          name="goalScorers"
          value={newResult.goalScorers}
          onChange={handleGoalScorerChange}
        >
          {players.map(player => (
            <option key={player.id} value={player.id}>{player.name}</option>
          ))}
        </select>
        <button type="submit">{editingResult ? 'Update Result' : 'Add Result'}</button>
      </form>
      <table className="results-table">
        <thead>
          <tr>
            <th>League</th>
            <th>Home Team</th>
            <th>Away Team</th>
            <th>Score</th>
            <th>Match Day</th>
            <th>Season</th>
            <th>Goal Scorers</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {results.map(result => (
            <tr key={result.id}>
              <td>{leagues.find(league => league.id === result.leagueId)?.name}</td>
              <td>{teams.find(team => team.id === result.homeTeam)?.name}</td>
              <td>{teams.find(team => team.id === result.awayTeam)?.name}</td>
              <td>{result.homeGoals} - {result.awayGoals}</td>
              <td>{result.matchDay}</td>
              <td>{result.season}</td>
              <td>{result.goalScorers.map(scorer => players.find(player => player.id === scorer)?.name).join(', ')}</td>
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