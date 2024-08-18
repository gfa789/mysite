import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase.config';
import LeagueTable from '../Dashboard/LeagueTable';
import './Home.css'

const Home = () => {
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [allMatches, setAllMatches] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [results, setResults] = useState([]);
  const [currentMatchday, setCurrentMatchday] = useState(1);
  const [maxMatchday, setMaxMatchday] = useState(1);

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
    if (selectedLeague && teams.length > 0) {
      fetchFixturesAndResults();
    }
  }, [selectedLeague, teams]);

  const fetchLeaguesAndTeams = async () => {
    try {
      const leaguesCollection = collection(db, 'leagues');
      const leaguesSnapshot = await getDocs(leaguesCollection);
      const leaguesList = leaguesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeagues(leaguesList);

      const teamsCollection = collection(db, 'teams');
      const teamsSnapshot = await getDocs(teamsCollection);
      const teamsList = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeams(teamsList);
    } catch (error) {
      console.error("Error fetching leagues and teams:", error);
    }
  };

  const fetchFixturesAndResults = async () => {
    try {
      const matchesCollection = collection(db, 'matches');
      const matchesQuery = query(
        matchesCollection,
        where('leagueId', '==', selectedLeague),
        orderBy('matchday'),
        orderBy('date'),
        orderBy('time')
      );
      const matchesSnapshot = await getDocs(matchesQuery);
      
      const matches = matchesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        homeTeam: teams.find(team => team.id === doc.data().homeTeamId)?.name || 'Unknown Team',
        awayTeam: teams.find(team => team.id === doc.data().awayTeamId)?.name || 'Unknown Team'
      }));

      setAllMatches(matches);

      const maxDay = Math.max(...matches.map(m => m.matchday));
      setMaxMatchday(maxDay);

      const defaultMatchday = matches
        .filter(m => m.status !== 'played')
        .reduce((min, match) => Math.min(min, match.matchday), maxDay);
      
      setCurrentMatchday(defaultMatchday);
      updateFixturesAndResults(matches, defaultMatchday);
    } catch (error) {
      console.error("Error fetching fixtures and results:", error);
    }
  };

  const changeMatchday = (delta) => {
    const newMatchday = Math.min(Math.max(1, currentMatchday + delta), maxMatchday);
    setCurrentMatchday(newMatchday);
    updateFixturesAndResults(allMatches, newMatchday);
  };

  const updateFixturesAndResults = (matches, matchday) => {
    const currentFixtures = matches.filter(m => m.matchday === matchday && m.status !== 'played');
    const currentResults = matches.filter(m => m.matchday === matchday && m.status === 'played');
    
    setFixtures(groupMatchesByDate(currentFixtures));
    setResults(groupMatchesByDate(currentResults));
  };

  const groupMatchesByDate = (matches) => {
    return matches.reduce((acc, match) => {
      const date = formatDate(match.date);
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(match);
      return acc;
    }, {});
  };

  const formatDate = (dateInput) => {
    let date;
    
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'object' && dateInput.toDate instanceof Function) {
      // Firestore Timestamp
      date = dateInput.toDate();
    } else if (typeof dateInput === 'string') {
      // Try parsing the string
      date = new Date(dateInput);
    } else {
      console.error('Unsupported date format:', dateInput);
      return 'Invalid Date';
    }
  
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateInput);
      return 'Invalid Date';
    }
  
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString; // Already in HH:MM format
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

      <div className="matchday-navigation">
        <button onClick={() => changeMatchday(-1)} disabled={currentMatchday === 1}>Previous</button>
        <span>Matchday {currentMatchday}</span>
        <button onClick={() => changeMatchday(1)} disabled={currentMatchday === maxMatchday}>Next</button>
      </div>

      <div className="dashboard-content">
        <div className="results-column">
          <h2>Results</h2>
          {Object.entries(results).length > 0 ? (
            Object.entries(results).map(([date, matches]) => (
              <div key={date} className="date-group">
                <h3>{date}</h3>
                <ul className="results-list">
                  {matches.map(result => (
                    <li key={result.id} className="result-item">
                      <span className="team home-team">{result.homeTeam}</span>
                      <span className="score">{result.homeScore} - {result.awayScore}</span>
                      <span className="team away-team">{result.awayTeam}</span>
                      <span className="match-time">{formatTime(result.time)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p>No results for this matchday yet.</p>
          )}
        </div>

        <div className="fixtures-column">
          <h2>Fixtures</h2>
          {Object.entries(fixtures).length > 0 ? (
            Object.entries(fixtures).map(([date, matches]) => (
              <div key={date} className="date-group">
                <h3>{date}</h3>
                <ul className="fixtures-list">
                  {matches.map(fixture => (
                    <li key={fixture.id} className="fixture-item">
                      <span className="team home-team">{fixture.homeTeam}</span>
                      <span className="vs">vs</span>
                      <span className="team away-team">{fixture.awayTeam}</span>
                      <span className="match-time">{formatTime(fixture.time)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p>No upcoming fixtures for this matchday.</p>
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