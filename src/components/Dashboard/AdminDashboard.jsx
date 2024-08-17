import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase.config';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './AdminDashboard.css';
import InputScores from './InputScores';
import LeagueTable from './LeagueTable';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [leagues, setLeagues] = useState([]);
  const [newLeague, setNewLeague] = useState({ name: '', country: '', division: 1 });
  const [editingLeague, setEditingLeague] = useState(null);
  const [currentSeason, setCurrentSeason] = useState(new Date().getFullYear());

  const [teams, setTeams] = useState([]);
  const [newTeam, setNewTeam] = useState({ name: '', leagueId: '', primaryColor: '#000000', secondaryColor: '#FFFFFF' });
  const [selectedLeagueForTeams, setSelectedLeagueForTeams] = useState('');
  const [matches, setMatches] = useState([]);
  const [activeMatchesTab, setActiveMatchesTab] = useState(0);
  const [editingTeam, setEditingTeam] = useState(null);

  const [newFixture, setNewFixture] = useState({
    leagueId: '',
    homeTeamId: '',
    awayTeamId: '',
    date: new Date(),
    time: '15:00',
    matchday: 1,
    status: 'unplayed'
  });

  useEffect(() => {
    fetchLeagues();
    fetchTeams();
    fetchMatches();
  }, []);

  const fetchLeagues = async () => {
    const leaguesCollection = collection(db, 'leagues');
    const leaguesSnapshot = await getDocs(leaguesCollection);
    const leaguesList = leaguesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setLeagues(leaguesList);
  };

  const handleCreateLeague = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'leagues'), newLeague);
      setNewLeague({ name: '', country: '', division: 1 });
      fetchLeagues();
    } catch (error) {
      console.error("Error adding league: ", error);
    }
  };

  const handleUpdateLeague = async (e) => {
    e.preventDefault();
    if (!editingLeague) return;
    try {
      const leagueRef = doc(db, 'leagues', editingLeague.id);
      await updateDoc(leagueRef, editingLeague);
      setEditingLeague(null);
      fetchLeagues();
    } catch (error) {
      console.error("Error updating league: ", error);
    }
  };

  

  const handleDeleteLeague = async (leagueId) => {
    try {
      await deleteDoc(doc(db, 'leagues', leagueId));
      fetchLeagues();
    } catch (error) {
      console.error("Error deleting league: ", error);
    }
  };

  const fetchTeams = async () => {
    const teamsCollection = collection(db, 'teams');
    const teamsSnapshot = await getDocs(teamsCollection);
    const teamsList = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTeams(teamsList);
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'teams'), newTeam);
      setNewTeam({ name: '', leagueId: '', primaryColor: '#000000', secondaryColor: '#FFFFFF' });
      fetchTeams();
    } catch (error) {
      console.error("Error adding team: ", error);
    }
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    if (!editingTeam) return;
    try {
      const teamRef = doc(db, 'teams', editingTeam.id);
      await updateDoc(teamRef, editingTeam);
      setEditingTeam(null);
      fetchTeams();
    } catch (error) {
      console.error("Error updating team: ", error);
    }
  };


  

  const handleDeleteTeam = async (teamId) => {
    try {
      await deleteDoc(doc(db, 'teams', teamId));
      fetchTeams();
    } catch (error) {
      console.error("Error deleting team: ", error);
    }
  };

  const fetchMatches = async () => {
    const matchesCollection = collection(db, 'matches');
    const matchesSnapshot = await getDocs(matchesCollection);
    const matchesList = matchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setMatches(matchesList);
  };

  const handleCreateFixture = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'matches'), newFixture);
      setNewFixture({
        leagueId: '',
        homeTeamId: '',
        awayTeamId: '',
        date: new Date(),
        time: '15:00',
        matchday: 1,
        status: 'unplayed'
      });
      fetchMatches();
    } catch (error) {
      console.error("Error adding fixture: ", error);
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(<option key={timeString} value={timeString}>{timeString}</option>);
      }
    }
    return options;
  };

  const getMaxMatchday = (leagueId) => {
    const leagueTeams = teams.filter(team => team.leagueId === leagueId);
    return (leagueTeams.length * 2) - 2;
  };

  const generateMatchdayOptions = (maxMatchday) => {
    const options = [];
    for (let i = 1; i <= maxMatchday; i++) {
      options.push(<option key={i} value={i}>{i}</option>);
    }
    return options;
  };

//   const LeagueTable = ({ league }) => {
//     return (
//       <div>
//         <h3>{league.name} Table</h3>
//         <p>League table will be implemented here</p>
//       </div>
//     );
//   };

  
  const sortAlphabetically = (a, b) => a.name.localeCompare(b.name);

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <Tabs selectedIndex={activeTab} onSelect={index => setActiveTab(index)}>
        <TabList>
          <Tab>Leagues</Tab>
          <Tab>Teams</Tab>
          <Tab>Matches</Tab>
          <Tab>League Tables</Tab>
        </TabList>

        <TabPanel>
          <h2>Leagues</h2>
          <form onSubmit={handleCreateLeague} className="create-form">
            <input
              type="text"
              placeholder="League Name"
              value={newLeague.name}
              onChange={(e) => setNewLeague({ ...newLeague, name: e.target.value })}
              required
            />
            <select
              value={newLeague.country}
              onChange={(e) => setNewLeague({ ...newLeague, country: e.target.value })}
              required
            >
              <option value="">Select Country</option>
              <option value="England">England</option>
              <option value="Spain">Spain</option>
              <option value="Germany">Germany</option>
              {/* Add more countries as needed */}
            </select>
            <select
              value={newLeague.division}
              onChange={(e) => setNewLeague({ ...newLeague, division: parseInt(e.target.value) })}
              required
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
            <button type="submit" className="create-button">Create League</button>
          </form>

          <div className="view-section">
            <h3>View Leagues</h3>
            <div className="grid-layout">
              {leagues.sort(sortAlphabetically).map(league => (
                <div key={league.id} className="grid-item">
                  <div className="item-info">
                    <span className="item-name">{league.name}</span>
                    <span className="item-detail">{league.country}, Division {league.division}</span>
                  </div>
                  <div className="item-actions">
                    <button onClick={() => setEditingLeague(league)} className="edit-button">Edit</button>
                    <button onClick={() => handleDeleteLeague(league.id)} className="delete-button">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {editingLeague && (
            <form onSubmit={handleUpdateLeague} className="edit-form">
              <input
                type="text"
                value={editingLeague.name}
                onChange={(e) => setEditingLeague({ ...editingLeague, name: e.target.value })}
                required
              />
              <select
                value={editingLeague.country}
                onChange={(e) => setEditingLeague({ ...editingLeague, country: e.target.value })}
                required
              >
                <option value="">Select Country</option>
                <option value="England">England</option>
                <option value="Spain">Spain</option>
                <option value="Germany">Germany</option>
                {/* Add more countries as needed */}
              </select>
              <select
                value={editingLeague.division}
                onChange={(e) => setEditingLeague({ ...editingLeague, division: parseInt(e.target.value) })}
                required
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
              <button type="submit" className="update-button">Update League</button>
              <button onClick={() => setEditingLeague(null)} className="cancel-button">Cancel</button>
            </form>
          )}
        </TabPanel>

        <TabPanel>
          <h2>Teams</h2>
          <form onSubmit={handleCreateTeam} className="create-form">
            <select
              value={newTeam.leagueId}
              onChange={(e) => setNewTeam({ ...newTeam, leagueId: e.target.value })}
              required
            >
              <option value="">Select League</option>
              {leagues.sort(sortAlphabetically).map(league => (
                <option key={league.id} value={league.id}>{league.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Team Name"
              value={newTeam.name}
              onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
              required
            />
            <div className="color-inputs">
              <label>
                Primary Color:
                <input
                  type="color"
                  value={newTeam.primaryColor}
                  onChange={(e) => setNewTeam({ ...newTeam, primaryColor: e.target.value })}
                />
              </label>
              <label>
                Secondary Color:
                <input
                  type="color"
                  value={newTeam.secondaryColor}
                  onChange={(e) => setNewTeam({ ...newTeam, secondaryColor: e.target.value })}
                />
              </label>
            </div>
            <button type="submit" className="create-button">Create Team</button>
          </form>

          <div className="view-section">
            <h3>View Teams</h3>
            <select
              value={selectedLeagueForTeams}
              onChange={(e) => setSelectedLeagueForTeams(e.target.value)}
              className="league-selector"
            >
              <option value="">All Leagues</option>
              {leagues.sort(sortAlphabetically).map(league => (
                <option key={league.id} value={league.id}>{league.name}</option>
              ))}
            </select>
            <div className="grid-layout">
              {teams
                .filter(team => !selectedLeagueForTeams || team.leagueId === selectedLeagueForTeams)
                .sort(sortAlphabetically)
                .map(team => (
                  <div key={team.id} className="grid-item">
                    <div className="item-info">
                      <div className="team-colors">
                        <div className="color-circle" style={{ background: `linear-gradient(to right, ${team.primaryColor} 50%, ${team.secondaryColor} 50%)` }}></div>
                      </div>
                      <span className="item-name">{team.name}</span>
                      <span className="item-detail">{leagues.find(l => l.id === team.leagueId)?.name}</span>
                    </div>
                    <div className="item-actions">
                      <button onClick={() => setEditingTeam(team)} className="edit-button">Edit</button>
                      <button onClick={() => handleDeleteTeam(team.id)} className="delete-button">Delete</button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {editingTeam && (
            <form onSubmit={handleUpdateTeam} className="edit-form">
              <select
                value={editingTeam.leagueId}
                onChange={(e) => setEditingTeam({ ...editingTeam, leagueId: e.target.value })}
                required
              >
                <option value="">Select League</option>
                {leagues.sort(sortAlphabetically).map(league => (
                  <option key={league.id} value={league.id}>{league.name}</option>
                ))}
              </select>
              <input
                type="text"
                value={editingTeam.name}
                onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                required
              />
              <div className="color-inputs">
                <label>
                  Primary Color:
                  <input
                    type="color"
                    value={editingTeam.primaryColor}
                    onChange={(e) => setEditingTeam({ ...editingTeam, primaryColor: e.target.value })}
                  />
                </label>
                <label>
                  Secondary Color:
                  <input
                    type="color"
                    value={editingTeam.secondaryColor}
                    onChange={(e) => setEditingTeam({ ...editingTeam, secondaryColor: e.target.value })}
                  />
                </label>
              </div>
              <button type="submit" className="update-button">Update Team</button>
              <button onClick={() => setEditingTeam(null)} className="cancel-button">Cancel</button>
            </form>
          )}
        </TabPanel>

        <TabPanel>
          <h2>Matches</h2>
          <Tabs selectedIndex={activeMatchesTab} onSelect={index => setActiveMatchesTab(index)}>
            <TabList>
              <Tab>Create Fixtures</Tab>
              <Tab>Input Scores</Tab>
            </TabList>

            <TabPanel>
            <h3>Create Fixtures</h3>
<form onSubmit={handleCreateFixture} className="create-fixture-form">
  <div className="form-columns-container">
    <div className="form-column">
      <select
        value={newFixture.leagueId}
        onChange={(e) => {
          setNewFixture({ 
            ...newFixture, 
            leagueId: e.target.value,
            homeTeamId: '',
            awayTeamId: '',
            matchday: 1
          });
        }}
        required
      >
        <option value="">Select League</option>
        {leagues.map(league => (
          <option key={league.id} value={league.id}>{league.name}</option>
        ))}
      </select>
      <select
        value={newFixture.homeTeamId}
        onChange={(e) => setNewFixture({ ...newFixture, homeTeamId: e.target.value })}
        required
      >
        <option value="">Select Home Team</option>
        {teams
          .filter(team => team.leagueId === newFixture.leagueId && team.id !== newFixture.awayTeamId)
          .map(team => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
      </select>
      <select
        value={newFixture.awayTeamId}
        onChange={(e) => setNewFixture({ ...newFixture, awayTeamId: e.target.value })}
        required
      >
        <option value="">Select Away Team</option>
        {teams
          .filter(team => team.leagueId === newFixture.leagueId && team.id !== newFixture.homeTeamId)
          .map(team => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
      </select>
      <select
        value={newFixture.matchday}
        onChange={(e) => setNewFixture({ ...newFixture, matchday: parseInt(e.target.value) })}
        required
      >
        <option value="">Select Matchday</option>
        {generateMatchdayOptions(getMaxMatchday(newFixture.leagueId))}
      </select>
      <select
        value={newFixture.time}
        onChange={(e) => setNewFixture({ ...newFixture, time: e.target.value })}
        required
      >
        {generateTimeOptions()}
      </select>
    </div>
    <div className="form-column">
      <div className="datepicker-container">
        <DatePicker
          selected={newFixture.date}
          onChange={(date) => setNewFixture({ ...newFixture, date })}
          inline
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
        />
      </div>
    </div>
  </div>
  <button className="submit-button" type="submit">Create Fixture</button>
</form>
              </TabPanel>
  
              <TabPanel>
              <InputScores 
                leagues={leagues} 
                teams={teams} 
                fetchMatches={fetchMatches}
              />
            </TabPanel>
            </Tabs>
          </TabPanel>
          <TabPanel>
          <h2>League Tables</h2>
          <LeagueTable leagues={leagues} teams={teams} />
        </TabPanel>
        </Tabs>
      </div>
    );
  };
  
  export default AdminDashboard;