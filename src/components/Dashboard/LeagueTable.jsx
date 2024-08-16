import React, { useState, useEffect } from 'react';
import { db } from '../../firebase.config';
import { collection, query, where, getDocs } from 'firebase/firestore';

function LeagueTable({ leagueId, seasonId }) {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    if (leagueId && seasonId) {
      fetchTeamsAndResults();
    }
  }, [leagueId, seasonId]);

  const fetchTeamsAndResults = async () => {
    // Fetch teams
    const teamsRef = collection(db, 'teams');
    const teamsQuery = query(teamsRef, where("leagueId", "==", leagueId));
    const teamsSnapshot = await getDocs(teamsQuery);
    let fetchedTeams = teamsSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
      headToHead: {}
    }));
    
    // Fetch results for the specific season and league
    const resultsRef = collection(db, 'results');
    const resultsQuery = query(resultsRef, 
      where("leagueId", "==", leagueId),
      where("season", "==", seasonId)
    );
    const resultsSnapshot = await getDocs(resultsQuery);
    const results = resultsSnapshot.docs.map(doc => doc.data());

    // Calculate statistics based on results
    results.forEach(result => {
      const homeTeam = fetchedTeams.find(team => team.id === result.homeTeam);
      const awayTeam = fetchedTeams.find(team => team.id === result.awayTeam);

      if (homeTeam && awayTeam) {
        // Update home team stats
        homeTeam.goalsFor += result.homeGoals;
        homeTeam.goalsAgainst += result.awayGoals;
        // Update away team stats
        awayTeam.goalsFor += result.awayGoals;
        awayTeam.goalsAgainst += result.homeGoals;

        if (result.homeGoals > result.awayGoals) {
          homeTeam.wins++;
          homeTeam.points += 3;
          awayTeam.losses++;
        } else if (result.homeGoals < result.awayGoals) {
          awayTeam.wins++;
          awayTeam.points += 3;
          homeTeam.losses++;
        } else {
          homeTeam.draws++;
          awayTeam.draws++;
          homeTeam.points++;
          awayTeam.points++;
        }

        // Update head-to-head
        if (!homeTeam.headToHead[awayTeam.id]) homeTeam.headToHead[awayTeam.id] = { points: 0, goalDifference: 0, awayGoals: 0 };
        if (!awayTeam.headToHead[homeTeam.id]) awayTeam.headToHead[homeTeam.id] = { points: 0, goalDifference: 0, awayGoals: 0 };

        homeTeam.headToHead[awayTeam.id].points += result.homeGoals > result.awayGoals ? 3 : (result.homeGoals === result.awayGoals ? 1 : 0);
        homeTeam.headToHead[awayTeam.id].goalDifference += result.homeGoals - result.awayGoals;
        awayTeam.headToHead[homeTeam.id].points += result.awayGoals > result.homeGoals ? 3 : (result.awayGoals === result.homeGoals ? 1 : 0);
        awayTeam.headToHead[homeTeam.id].goalDifference += result.awayGoals - result.homeGoals;
        awayTeam.headToHead[homeTeam.id].awayGoals += result.awayGoals;
      }
    });

    // Sort teams
    fetchedTeams.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      
      const goalDiffA = a.goalsFor - a.goalsAgainst;
      const goalDiffB = b.goalsFor - b.goalsAgainst;
      if (goalDiffB !== goalDiffA) return goalDiffB - goalDiffA;
      
      // Head-to-head comparison
      const headToHeadA = a.headToHead[b.id];
      const headToHeadB = b.headToHead[a.id];
      if (headToHeadA && headToHeadB) {
        if (headToHeadA.points !== headToHeadB.points) return headToHeadB.points - headToHeadA.points;
        if (headToHeadA.goalDifference !== headToHeadB.goalDifference) return headToHeadB.goalDifference - headToHeadA.goalDifference;
        if (headToHeadB.awayGoals !== headToHeadA.awayGoals) return headToHeadB.awayGoals - headToHeadA.awayGoals;
      }
      
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      
      // Alphabetical order as final tiebreaker
      return a.name.localeCompare(b.name);
    });

    setTeams(fetchedTeams);
  };

  return (
    <div className="league-table">
      <h3>League Table - {seasonId} Season</h3>
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