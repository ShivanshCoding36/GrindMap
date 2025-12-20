import React, { useState, useEffect } from 'react';
import './App.css';
import UsernameInputs from './components/UsernameInputs';
import PlatformCard from './components/PlatformCard';
import ActivityHeatmap from './components/ActivityHeatmap';

function App() {
  const [usernames, setUsernames] = useState({
    codeforces: '',
    github: '',
    // Removed codechef and hackerrank from auto-fetch
  });

  const [platformData, setPlatformData] = useState({
    codeforces: { rating: 0, solved: 0 },
    codechef: { rating: 0, solved: 0 },       // Manual
    hackerrank: { solved: 0 },                // Manual
    github: { contributions: [] },
    leetcode: { solved: 0 },                 // Manual
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('grindmap-usernames');
    if (saved) setUsernames(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('grindmap-usernames', JSON.stringify(usernames));
  }, [usernames]);

  const fetchAllData = async () => {
    setLoading(true);

    // Codeforces (works perfectly)
    if (usernames.codeforces?.trim()) {
      try {
        const infoRes = await fetch(`https://codeforces.com/api/user.info?handles=${usernames.codeforces}`);
        const infoData = await infoRes.json();
        if (infoData.status === 'OK' && infoData.result.length > 0) {
          const rating = infoData.result[0].rating || 0;

          const statusRes = await fetch(`https://codeforces.com/api/user.status?handle=${usernames.codeforces}`);
          const statusData = await statusRes.json();
          if (statusData.status === 'OK') {
            const solvedSet = new Set(
              statusData.result
                .filter(s => s.verdict === 'OK')
                .map(s => `${s.problem.contestId}-${s.problem.index}`)
            );
            const solved = solvedSet.size;

            setPlatformData(prev => ({ ...prev, codeforces: { rating, solved } }));
          }
        }
      } catch (e) {
        console.error('Codeforces error:', e);
      }
    }

    // GitHub contributions (improved with better error handling)
    if (usernames.github?.trim()) {
      try {
        const res = await fetch(`https://github.com/users/${usernames.github}/contributions`, {
          mode: 'no-cors', // Helps bypass some browser restrictions during dev
          headers: { 'Accept': 'text/html' }
        });
        if (res.ok || res.type === 'opaque') { // no-cors returns opaque
          const text = await res.text();
          const matches = [...text.matchAll(/data-date="([^"]+)" data-count="(\d+)" data-level="([^"]+)"/g)];
          const contributions = matches.map(m => ({
            date: m[1],
            count: parseInt(m[2]),
          }));
          if (contributions.length > 0) {
            setPlatformData(prev => ({ ...prev, github: { contributions } }));
          }
        }
      } catch (e) {
        console.error('GitHub fetch failed (common due to site changes/CORS):', e);
        alert('GitHub heatmap temporarily unavailable – try again later or check username.');
      }
    }

    setLoading(false);
  };

  const totalSolved = 
    platformData.codeforces.solved +
    platformData.codechef.solved +
    platformData.hackerrank.solved +
    platformData.leetcode.solved;

  return (
    <div className="app">
      <h1>GrindMap</h1>
      <p className="subtitle">Track your coding progress safely</p>

      <UsernameInputs usernames={usernames} setUsernames={setUsernames} />

      <div className="manual-section">
        <h3>Manual Entry (Recommended for accuracy)</h3>
        <div>
          <label>LeetCode Solved: </label>
          <input type="number" min="0" value={platformData.leetcode.solved}
            onChange={(e) => setPlatformData(prev => ({ ...prev, leetcode: { solved: Number(e.target.value) || 0 } }))} />
        </div>
        <div>
          <label>CodeChef Solved: </label>
          <input type="number" min="0" value={platformData.codechef.solved}
            onChange={(e) => setPlatformData(prev => ({ ...prev, codechef: { solved: Number(e.target.value) || 0 } }))} />
        </div>
        <div>
          <label>CodeChef Rating: </label>
          <input type="number" min="0" value={platformData.codechef.rating}
            onChange={(e) => setPlatformData(prev => ({ ...prev, codechef: { rating: Number(e.target.value) || 0 } }))} />
        </div>
        <div>
          <label>HackerRank Solved: </label>
          <input type="number" min="0" value={platformData.hackerrank.solved}
            onChange={(e) => setPlatformData(prev => ({ ...prev, hackerrank: { solved: Number(e.target.value) || 0 } }))} />
        </div>
      </div>

      <button onClick={fetchAllData} disabled={loading} className="refresh-btn">
        {loading ? 'Loading...' : 'Refresh Codeforces & GitHub'}
      </button>

      <div className="summary">
        <h2>Total Problems Solved: {totalSolved}</h2>
      </div>

      <div className="platforms-grid">
        <PlatformCard name="Codeforces" data={platformData.codeforces} />
        <PlatformCard name="CodeChef (Manual)" data={platformData.codechef} />
        <PlatformCard name="HackerRank (Manual)" data={platformData.hackerrank} />
        <PlatformCard name="LeetCode (Manual)" data={platformData.leetcode} />
      </div>

      {platformData.github.contributions.length > 0 && (
        <div className="heatmap-section">
          <h2>GitHub Contribution Heatmap</h2>
          <ActivityHeatmap data={platformData.github.contributions} />
        </div>
      )}
    </div>
  );
}

export default App;