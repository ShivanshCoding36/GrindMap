import React, { useState } from 'react';
import CircularProgress from './CircularProgress';
import ActivityHeatmap from './ActivityHeatmap';
import '../App.css';

const DemoPage = () => {
  const [expanded, setExpanded] = useState(null);

  const demoData = {
    leetcode: {
      totalSolved: 487,
      totalQuestions: 3000,
      easySolved: 245,
      mediumSolved: 198,
      hardSolved: 44,
      ranking: 125432,
      submissionCalendar: generateDemoCalendar()
    },
    codeforces: {
      rating: 1542,
      rank: 'Expert',
      solved: 312
    },
    codechef: {
      rating: 1876,
      problem_fully_solved: 156,
      total_stars: 4,
      global_rank: 8234,
      country_rank: 1523
    }
  };

  const platforms = [
    { key: 'leetcode', name: 'LeetCode', color: '#ffa116' },
    { key: 'codeforces', name: 'Codeforces', color: '#1e88e5' },
    { key: 'codechef', name: 'CodeChef', color: '#5d4037' }
  ];

  const totalSolved = demoData.leetcode.totalSolved + demoData.codeforces.solved + demoData.codechef.problem_fully_solved;
  const overallGoal = 10000;

  const getPlatformPercentage = (platKey) => {
    const data = demoData[platKey];
    if (platKey === 'leetcode') return Math.round((data.totalSolved / data.totalQuestions) * 100);
    if (platKey === 'codeforces') return Math.round((data.rating / 3500) * 100);
    if (platKey === 'codechef') return Math.round((data.rating / 3000) * 100);
    return 0;
  };

  const getHeatmapData = (calendar) => {
    return Object.entries(calendar).map(([ts, count]) => ({
      date: new Date(parseInt(ts) * 1000).toISOString().split('T')[0],
      count
    }));
  };

  return (
    <div className="app demo-mode">
      <div className="demo-banner">
        <h2>🎯 Interactive Demo</h2>
        <p>Explore GrindMap with sample data • Click cards to expand details</p>
      </div>

      <h1>GrindMap</h1>

      <div className="overall">
        <h2>Overall Progress</h2>
        <CircularProgress solved={totalSolved} goal={overallGoal} color="#4caf50" />
        <p>{totalSolved} / {overallGoal} problems solved</p>
      </div>

      <div className="platforms-grid">
        {platforms.map(plat => {
          const data = demoData[plat.key];
          const isExpanded = expanded === plat.key;
          const percentage = getPlatformPercentage(plat.key);

          return (
            <div
              key={plat.key}
              className={`platform-card ${isExpanded ? 'expanded' : ''}`}
              onClick={() => setExpanded(expanded === plat.key ? null : plat.key)}
            >
              <div className="card-header">
                <h3 style={{ color: plat.color }}>{plat.name}</h3>
                <div className="platform-progress">
                  <CircularProgress percentage={percentage} color={plat.color} size={isExpanded ? 'large' : 'medium'} />
                </div>
              </div>

              <div className="summary">
                {data.totalSolved && <p><strong>{data.totalSolved}</strong> solved ({percentage}%)</p>}
                {data.solved && <p><strong>{data.solved}</strong> solved</p>}
                {data.rating && <p>Rating: <strong>{data.rating}</strong></p>}
                {data.rank && <p>Rank: <strong>{data.rank}</strong></p>}
                {data.problem_fully_solved && <p>Fully Solved: <strong>{data.problem_fully_solved}</strong></p>}
              </div>

              {isExpanded && (
                <div className="details">
                  {plat.key === 'leetcode' && (
                    <>
                      <p>Easy: {data.easySolved} | Medium: {data.mediumSolved} | Hard: {data.hardSolved}</p>
                      <p>Global Ranking: #{data.ranking}</p>
                      <div className="heatmap-section">
                        <h4>Submission Heatmap</h4>
                        <ActivityHeatmap data={getHeatmapData(data.submissionCalendar)} />
                      </div>
                    </>
                  )}
                  {plat.key === 'codeforces' && (
                    <>
                      <p>Current Rating: {data.rating}</p>
                      <p>Current Rank: {data.rank}</p>
                    </>
                  )}
                  {plat.key === 'codechef' && (
                    <>
                      <p>Stars: {data.total_stars} ⭐</p>
                      <p>Global Rank: #{data.global_rank}</p>
                      <p>Country Rank: #{data.country_rank}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="today-activity">
        <h2>Today's Activity</h2>
        <div className="activity-list">
          {platforms.map(plat => (
            <div key={plat.key} className="activity-item done">
              <span>{plat.name}</span>
              <span>✅ Coded Today</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function generateDemoCalendar() {
  const calendar = {};
  const now = Date.now() / 1000;
  for (let i = 0; i < 365; i++) {
    const timestamp = Math.floor(now - (i * 86400));
    calendar[timestamp] = Math.floor(Math.random() * 15);
  }
  return calendar;
}

export default DemoPage;
