import React, { useState, useEffect } from 'react';
import { db } from '../../firebase.config';
import { collection, query, where, getDocs } from 'firebase/firestore';

function LeagueTable({ leagueId }) {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetchTeams();
  }, [leagueId]);

  const fetchTeams = async () => {
    const teamsRef = collection(db, 'teams');
    const q = query(teamsRef, where("leagueId", "==", leagueId));
    const querySnapshot = await getDocs(q);
    let fetchedTeams = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Fetch head-to-head results
    const resultsRef = collection(db, 'results');
    const resultsQuery = query(resultsRef, where("leagueId", "==", leagueId));
    const resultsSnapshot = await getDocs(resultsQuery);
    const results = resultsSnapshot.docs.map(doc => doc.data());

    // Calculate head-to-head statistics
    fetchedTeams = fetchedTeams.map(team => {
      const headToHead = {};
      results.forEach(result => {
        if (result.homeTeam === team.id || result.awayTeam === team.id) {
          const opposingTeam = result.homeTeam === team.id ? result.awayTeam : result.homeTeam;
          if (!headToHead[opposingTeam]) {
            headToHead[opposingTeam] = { points: 0, goalDifference: 0, awayGoals: 0 };
          }
          if (result.homeTeam === team.id) {
            headToHead[opposingTeam].points += result.homeGoals > result.awayGoals ? 3 : (result.homeGoals === result.awayGoals ? 1 : 0);
            headToHead[opposingTeam].goalDifference += result.homeGoals - result.awayGoals;
          } else {
            headToHead[opposingTeam].points += result.awayGoals > result.homeGoals ? 3 : (result.awayGoals === result.homeGoals ? 1 : 0);
            headToHead[opposingTeam].goalDifference += result.awayGoals - result.homeGoals;
            headToHead[opposingTeam].awayGoals += result.awayGoals;
          }
        }
      });
      return { ...team, headToHead };
    });

    // Sort teams
    fetchedTeams.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      
      // Head-to-head comparison
      const headToHeadA = a.headToHead[b.id];
      const headToHeadB = b.headToHead[a.id];
      if (headToHeadA && headToHeadB) {
        if (headToHeadA.points !== headToHeadB.points) return headToHeadA.points - headToHeadB.points;
        if (headToHeadA.goalDifference !== headToHeadB.goalDifference) return headToHeadA.goalDifference - headToHeadB.goalDifference;
        return headToHeadA.awayGoals - headToHeadB.awayGoals;
      }
      
      return 0;
    });

    setTeams(fetchedTeams);
  };

  return (
    <div className="league-table">
      <h3>League Table</h3>
      <table>
        <thead>
          <tr>
            <th>Position</th>
            <th>Team</th>
            <th>Played</th>
            <th>Won</th>
            <th>Drawn</th>
            <th>Lost</th>
            <th>GF</th>
            <th>GA</th>
            <th>GD</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, index) => (
            <tr key={team.id}>
              <td>{index + 1}</td>
              <td>{team.name}</td>
              <td>{team.wins + team.draws + team.losses}</td>
              <td>{team.wins}</td>
              <td>{team.draws}</td>
              <td>{team.losses}</td>
              <td>{team.goalsFor}</td>
              <td>{team.goalsAgainst}</td>
              <td>{team.goalsFor - team.goalsAgainst}</td>
              <td>{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeagueTable;