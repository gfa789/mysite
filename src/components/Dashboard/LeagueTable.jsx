import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase.config';

const LeagueTable = ({ leagueId, teams }) => {
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (leagueId) {
      fetchMatchesAndCalculateTable();
    }
  }, [leagueId]);

  const fetchMatchesAndCalculateTable = async () => {
    try {
      setError(null);
      const matchesCollection = collection(db, 'matches');
      const matchesQuery = query(matchesCollection, where('leagueId', '==', leagueId), where('status', '==', 'played'));
      const matchesSnapshot = await getDocs(matchesQuery);
      
      const leagueTeams = teams.filter(team => team.leagueId === leagueId);
      
      if (leagueTeams.length === 0) {
        setError("No teams found for the selected league.");
        return;
      }

      let tableData = leagueTeams.map(team => ({
        id: team.id,
        name: team.name,
        primaryColor: team.primaryColor,
        secondaryColor: team.secondaryColor,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      }));

      const teamMap = new Map(tableData.map(team => [team.id, team]));

      matchesSnapshot.forEach(doc => {
        const match = doc.data();
        const homeTeam = teamMap.get(match.homeTeamId);
        const awayTeam = teamMap.get(match.awayTeamId);

        if (homeTeam && awayTeam) {
          homeTeam.played++;
          awayTeam.played++;
          homeTeam.goalsFor += match.homeScore;
          homeTeam.goalsAgainst += match.awayScore;
          awayTeam.goalsFor += match.awayScore;
          awayTeam.goalsAgainst += match.homeScore;

          if (match.homeScore > match.awayScore) {
            homeTeam.won++;
            homeTeam.points += 3;
            awayTeam.lost++;
          } else if (match.homeScore < match.awayScore) {
            awayTeam.won++;
            awayTeam.points += 3;
            homeTeam.lost++;
          } else {
            homeTeam.drawn++;
            awayTeam.drawn++;
            homeTeam.points++;
            awayTeam.points++;
          }
        }
      });

      tableData = Array.from(teamMap.values());

      tableData.forEach(team => {
        team.goalDifference = team.goalsFor - team.goalsAgainst;
      });

      tableData.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.name.localeCompare(b.name); // Sort alphabetically if all else is tied
      });

      setTableData(tableData);
    } catch (err) {
      console.error("Error in fetchMatchesAndCalculateTable:", err);
      setError("An error occurred while fetching the league table data.");
    }
  };

  const getRowClassName = (index, totalTeams) => {
    let className = index % 2 === 0 ? 'row-even' : 'row-odd';
    if (index < 4) {
      className += ' row-top';
    } else if (index >= totalTeams - 3) {
      className += ' row-bottom';
    }
    return className;
  };

  if (!Array.isArray(teams)) {
    return <div>Error: Invalid team data</div>;
  }

  return (
    <div className="league-table">
      <h2>League Table</h2>
      {error && <div className="error-message">{error}</div>}
      {tableData.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Pos</th>
              <th>Team</th>
              <th>P</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GF</th>
              <th>GA</th>
              <th>GD</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((team, index) => (
              <tr key={team.id} className={getRowClassName(index, tableData.length)}>
                <td>{index + 1}</td>
                <td>
                  <div className="team-name-with-colors">
                    <div className="team-colors">
                      <div 
                        className="color-circle" 
                        style={{
                          background: `linear-gradient(to right, ${team.primaryColor} 50%, ${team.secondaryColor} 50%)`
                        }}
                      ></div>
                    </div>
                    {team.name}
                  </div>
                </td>
                <td>{team.played}</td>
                <td>{team.won}</td>
                <td>{team.drawn}</td>
                <td>{team.lost}</td>
                <td>{team.goalsFor}</td>
                <td>{team.goalsAgainst}</td>
                <td>{team.goalDifference}</td>
                <td>{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="table-legend">
        <div className="legend-item legend-top">Top 4</div>
        <div className="legend-item legend-bottom">Bottom 3</div>
      </div>
    </div>
  );
};

export default LeagueTable;