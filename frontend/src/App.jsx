import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { BattleArena } from './components/BattleArena';

// Config
import API_URL_BASE from './api/config';
const API_URL = `${API_URL_BASE}/api`;
const BATTLE_ID = 'red-vs-blue';

function App() {
  const [deviceId, setDeviceId] = useState(null);
  const [battleData, setBattleData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Initialize FingerprintJS on mount
  useEffect(() => {
    const setFp = async () => {
      const fp = await FingerprintJS.load();
      const { visitorId } = await fp.get();
      setDeviceId(visitorId);
      console.log('Device ID:', visitorId);
    };
    setFp();
  }, []);

  // 2. Poll for updates (Real-time-ish)
  useEffect(() => {
    if (!deviceId) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/battle/${BATTLE_ID}`, {
          params: { deviceId }
        });
        setBattleData(res.data);
      } catch (error) {
        console.error("Error fetching battle data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 2000); // Poll every 2s

    return () => clearInterval(interval);
  }, [deviceId]);

  // 3. Handle Vote
  const handleVote = async (optionId) => {
    if (!deviceId) return;

    // Optimistic UI update (optional, but good for UX)
    // For MVP, we'll just wait for the poll or force a refresh

    try {
      await axios.post(`${API_URL}/battle/${BATTLE_ID}/vote`, {
        optionId,
        deviceId
      });
      // Force immediate refresh
      const res = await axios.get(`${API_URL}/battle/${BATTLE_ID}`, {
        params: { deviceId }
      });
      setBattleData(res.data);
    } catch (error) {
      alert("Error voting. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!battleData) return <div className="text-white">Failed to load battle.</div>;

  return (
    <BattleArena
      options={battleData.options}
      totalVotes={battleData.totalVotes}
      userVote={battleData.userVote}
      onVote={handleVote}
    />
  );
}

export default App;
