import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';

const InputScores = () => {
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [matchdays, setMatchdays] = useState([]);
  const [selectedMatchday, setSelectedMatchday] = useState(null);
  const [fixtures, setFixtures] = useState([]);
  const [scores, setScores] = useState({});
  const [teams, setTeams] = useState({});

  useEffect(() => {
    fetchLeagues();
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      fetchMatchdays();
      fetchTeams();
    }
  }, [selectedLeague]);

  useEffect(() => {
    if (selectedLeague && selectedMatchday) {
      fetchFixtures();
    }
  }, [selectedLeague, selectedMatchday]);

  const fetchLeagues = async () => {
    const leaguesCollection = collection(db, 'leagues');
    const leaguesSnapshot = await getDocs(leaguesCollection);
    const leaguesList = leaguesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setLeagues(leaguesList);
  };

  const fetchTeams = async () => {
    const teamsCollection = collection(db, 'teams');
    const teamsQuery = query(teamsCollection, where('leagueId', '==', selectedLeague));
    const teamsSnapshot = await getDocs(teamsQuery);
    const teamsData = {};
    teamsSnapshot.docs.forEach(doc => {
      teamsData[doc.id] = doc.data();
    });
    setTeams(teamsData);
  };

  const fetchMatchdays = async () => {
    const fixturesCollection = collection(db, 'matches');
    const fixturesQuery = query(fixturesCollection, where('leagueId', '==', selectedLeague));
    const fixturesSnapshot = await getDocs(fixturesQuery);
    const matchdaySet = new Set(fixturesSnapshot.docs.map(doc => doc.data().matchday));
    const matchdayList = Array.from(matchdaySet).sort((a, b) => a - b);
    setMatchdays(matchdayList);

    // Set default matchday (lowest one without all games played)
    const defaultMatchday = matchdayList.find(matchday => {
      const matchdayFixtures = fixturesSnapshot.docs.filter(doc => doc.data().matchday === matchday);
      return matchdayFixtures.some(fixture => fixture.data().status !== 'played');
    });
    setSelectedMatchday(defaultMatchday || matchdayList[0]);
  };

  const fetchFixtures = async () => {
    const fixturesCollection = collection(db, 'matches');
    const fixturesQuery = query(
      fixturesCollection,
      where('leagueId', '==', selectedLeague),
      where('matchday', '==', selectedMatchday)
    );
    const fixturesSnapshot = await getDocs(fixturesQuery);
    const fixturesList = fixturesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setFixtures(fixturesList);

    // Initialize scores state
    const initialScores = {};
    fixturesList.forEach(fixture => {
      initialScores[fixture.id] = {
        homeScore: fixture.homeScore ?? 0,
        awayScore: fixture.awayScore ?? 0
      };
    });
    setScores(initialScores);
  };

  const handleScoreChange = (fixtureId, team, value) => {
    const numericValue = value === '' ? 0 : parseInt(value, 10);
    setScores(prevScores => ({
      ...prevScores,
      [fixtureId]: {
        ...prevScores[fixtureId],
        [team]: isNaN(numericValue) ? 0 : numericValue
      }
    }));
  };

  const handleScoreSubmit = async (fixtureId) => {
    const fixtureRef = doc(db, 'matches', fixtureId);
    await updateDoc(fixtureRef, {
      homeScore: scores[fixtureId].homeScore,
      awayScore: scores[fixtureId].awayScore,
      status: 'played'
    });
    fetchFixtures(); // Refresh fixtures after update
  };

  const handleClearFixture = async (fixtureId) => {
    const fixtureRef = doc(db, 'matches', fixtureId);
    await updateDoc(fixtureRef, {
      homeScore: 0,
      awayScore: 0,
      status: 'unplayed'
    });
    fetchFixtures(); // Refresh fixtures after update
  };

  const handleDeleteFixture = async (fixtureId) => {
    if (window.confirm('Are you sure you want to delete this fixture?')) {
      const fixtureRef = doc(db, 'matches', fixtureId);
      await deleteDoc(fixtureRef);
      fetchFixtures(); // Refresh fixtures after deletion
    }
  };

  const getScoreStyle = (homeScore, awayScore) => {
    if (homeScore === awayScore) return {};
    const isHomeWinning = homeScore > awayScore;
    return {
      backgroundColor: isHomeWinning ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)'
    };
  };

  return (
    <div className="input-scores">
      <h3>Input Scores</h3>
      <div className="score-filters">
        <select
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          className="league-selector"
        >
          <option value="">Select League</option>
          {leagues.map(league => (
            <option key={league.id} value={league.id}>{league.name}</option>
          ))}
        </select>
        {selectedLeague && (
          <select
            value={selectedMatchday || ''}
            onChange={(e) => setSelectedMatchday(Number(e.target.value))}
            className="matchday-selector"
          >
            {matchdays.map(matchday => (
              <option key={matchday} value={matchday}>Matchday {matchday}</option>
            ))}
          </select>
        )}
      </div>
      {fixtures.length > 0 && (
        <div className="fixtures-list">
          {fixtures.map(fixture => (
            <div key={fixture.id} className="fixture-item">
              <div className="team-info">
                <div className="team-color">
                  <div className="color-circle" style={{
                    background: `linear-gradient(to right, ${teams[fixture.homeTeamId]?.primaryColor} 50%, ${teams[fixture.homeTeamId]?.secondaryColor} 50%)`,
                    border: '1px solid black'
                  }}></div>
                </div>
                <span>{teams[fixture.homeTeamId]?.name || 'Home Team'}</span>
              </div>
              <div className="score-container">
                <input
                  type="number"
                  value={scores[fixture.id].homeScore}
                  onChange={(e) => handleScoreChange(fixture.id, 'homeScore', e.target.value)}
                  disabled={fixture.status === 'played'}
                  min="0"
                  style={getScoreStyle(scores[fixture.id].homeScore, scores[fixture.id].awayScore)}
                />
                <span>-</span>
                <input
                  type="number"
                  value={scores[fixture.id].awayScore}
                  onChange={(e) => handleScoreChange(fixture.id, 'awayScore', e.target.value)}
                  disabled={fixture.status === 'played'}
                  min="0"
                  style={getScoreStyle(scores[fixture.id].awayScore, scores[fixture.id].homeScore)}
                />
              </div>
              <div className="team-info">
                <span>{teams[fixture.awayTeamId]?.name || 'Away Team'}</span>
                <div className="team-color">
                  <div className="color-circle" style={{
                    background: `linear-gradient(to right, ${teams[fixture.awayTeamId]?.primaryColor} 50%, ${teams[fixture.awayTeamId]?.secondaryColor} 50%)`,
                    border: '1px solid black'
                  }}></div>
                </div>
              </div>
              <div className="fixture-actions">
                {fixture.status !== 'played' ? (
                  <button onClick={() => handleScoreSubmit(fixture.id)} className="submit-button">Submit</button>
                ) : (
                  <button onClick={() => handleClearFixture(fixture.id)} className="clear-button">Clear</button>
                )}
                <button onClick={() => handleDeleteFixture(fixture.id)} className="delete-button">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


export default InputScores;