import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase.config';
import LeagueTable from '../Dashboard/LeagueTable';
import './Home.css'

const Home = () => {
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [currentFixtures, setCurrentFixtures] = useState({});

  useEffect(() => {
    fetchLeaguesAndTeams();
  }, []);

  useEffect(() => {
    if (leagues.length > 0 && !selectedLeague) {
      const premierLeague = leagues.find(league => league.name === "Premier League");
      if (premierLeague) {
        setSelectedLeague(premierLeague.id);
      } else {
        setSelectedLeague(leagues[0].id);
      }
    }
  }, [leagues]);

  useEffect(() => {
    if (selectedLeague) {
      console.log("Selected League ID:", selectedLeague);
      fetchCurrentFixtures();
    }
  }, [selectedLeague, teams]);

  const fetchLeaguesAndTeams = async () => {
    try {
      const leaguesCollection = collection(db, 'leagues');
      const leaguesSnapshot = await getDocs(leaguesCollection);
      const leaguesList = leaguesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeagues(leaguesList);
      console.log("Fetched Leagues:", leaguesList);

      const teamsCollection = collection(db, 'teams');
      const teamsSnapshot = await getDocs(teamsCollection);
      const teamsList = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeams(teamsList);
      console.log("Fetched Teams:", teamsList);
    } catch (error) {
      console.error("Error fetching leagues and teams:", error);
    }
  };

  const fetchCurrentFixtures = async () => {
    try {
      console.log("Fetching fixtures for league ID:", selectedLeague);
      const matchesCollection = collection(db, 'matches');
      const currentMatchdayQuery = query(
        matchesCollection,
        where('leagueId', '==', selectedLeague),
        orderBy('date'),
        orderBy('time')
      );
      const matchesSnapshot = await getDocs(currentMatchdayQuery);
      
      console.log("Fixtures found:", matchesSnapshot.size);

      if (!matchesSnapshot.empty) {
        const fixturesData = matchesSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log("Fixture data:", data);
          return {
            id: doc.id,
            ...data,
            homeTeam: teams.find(team => team.id === data.homeTeamId)?.name || 'Unknown Team',
            awayTeam: teams.find(team => team.id === data.awayTeamId)?.name || 'Unknown Team'
          };
        });

        // Group fixtures by date
        const groupedFixtures = fixturesData.reduce((acc, fixture) => {
          const date = new Date(fixture.date.toDate()).toLocaleDateString();
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(fixture);
          return acc;
        }, {});

        console.log("Grouped fixtures:", groupedFixtures);
        setCurrentFixtures(groupedFixtures);
      } else {
        console.log("No fixtures found");
        setCurrentFixtures({});
      }
    } catch (error) {
      console.error("Error fetching current fixtures:", error);
    }
  };

  return (
    <div className="home">
      <h1>Football League Dashboard</h1>
      <select
        value={selectedLeague}
        onChange={(e) => setSelectedLeague(e.target.value)}
        className="league-selector"
      >
        {leagues.map(league => (
          <option key={league.id} value={league.id}>{league.name}</option>
        ))}
      </select>

      <div className="dashboard-content">
        <div className="fixtures-column">
          <h2>Fixtures and Results</h2>
          {Object.keys(currentFixtures).length > 0 ? (
            Object.entries(currentFixtures).map(([date, fixtures]) => (
              <div key={date} className="fixture-group">
                <h3 className="fixture-date">{date}</h3>
                <ul className="fixtures-list">
                  {fixtures.map(fixture => (
                    <li key={fixture.id} className="fixture-item">
                      <span className="team home-team">{fixture.homeTeam}</span>
                      <span className="score">
                        {fixture.status === 'played' 
                          ? `${fixture.homeScore} - ${fixture.awayScore}`
                          : 'vs'}
                      </span>
                      <span className="team away-team">{fixture.awayTeam}</span>
                      <span className="fixture-time">
                        {new Date(fixture.date.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p>No fixtures found.</p>
          )}
        </div>

        <div className="table-column">
          {selectedLeague && teams.length > 0 && (
            <LeagueTable leagueId={selectedLeague} teams={teams} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;