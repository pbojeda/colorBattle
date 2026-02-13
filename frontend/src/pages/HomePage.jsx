import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import API_URL_BASE from '../api/config';

const API_URL = `${API_URL_BASE}/api`;

function HomePage() {
    const [recentBattles, setRecentBattles] = useState([]);
    const [trendingBattles, setTrendingBattles] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // Form State
    const [newBattleName, setNewBattleName] = useState('');
    const [option1, setOption1] = useState('');
    const [option2, setOption2] = useState('');
    const [creating, setCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        // Initial Fetch
        const init = async () => {
            await Promise.all([fetchTrending(), fetchRecent(1)]);
            setLoading(false);
        };
        init();
    }, []);

    const fetchTrending = async () => {
        try {
            const res = await axios.get(`${API_URL}/battles/trending`);
            setTrendingBattles(res.data);
        } catch (error) {
            console.error("Error fetching trending:", error);
        }
    };

    const fetchRecent = async (pageNum) => {
        try {
            const limit = 10;
            const res = await axios.get(`${API_URL}/battles`, {
                params: { page: pageNum, limit }
            });
            const newBattles = res.data;

            if (newBattles.length < limit) {
                setHasMore(false);
            }

            setRecentBattles(prev => pageNum === 1 ? newBattles : [...prev, ...newBattles]);
        } catch (error) {
            console.error("Error fetching battles:", error);
        }
    };

    const handleLoadMore = async () => {
        setLoadingMore(true);
        const nextPage = page + 1;
        await fetchRecent(nextPage);
        setPage(nextPage);
        setLoadingMore(false);
    };

    const handleCreateBattle = async (e) => {
        e.preventDefault();
        if (!newBattleName || !option1 || !option2) return;

        setCreating(true);
        try {
            const res = await axios.post(`${API_URL}/battles`, {
                name: newBattleName,
                options: [{ name: option1 }, { name: option2 }]
            });
            navigate(`/battle/${res.data.battleId}`);
        } catch (error) {
            console.error("Error creating battle:", error);
            alert("Failed to create battle");
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-bg-gray-800 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    const BattleCard = ({ battle, trending = false }) => (
        <Link
            to={`/battle/${battle.battleId}`}
            className={`block bg-gray-900/30 hover:bg-gray-800 border ${trending ? 'border-yellow-500/50 shadow-yellow-500/20 shadow-sm' : 'border-gray-800'} hover:border-gray-700 rounded-xl p-4 transition-all hover:scale-[1.01] group mb-3 relative overflow-hidden`}
        >
            {trending && (
                <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                    HOT 🔥
                </div>
            )}
            <div className="flex justify-between items-center mb-2 min-w-0">
                <h3 className="font-bold text-lg text-gray-200 group-hover:text-white transition-colors line-clamp-2 pr-8 min-w-0">
                    {battle.name}
                </h3>
                <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded text-gray-400 whitespace-nowrap ml-2 flex-shrink-0">
                    {battle.totalVotes} votes
                </span>
            </div>
            <div className="flex gap-2 min-w-0">
                {battle.options.map((opt, i) => (
                    <span
                        key={opt.id}
                        className={`text-xs px-2 py-1 rounded bg-opacity-20 ${i === 0 ? 'bg-red-500 text-red-200' : 'bg-blue-500 text-blue-200'} truncate flex-1 text-center`}
                    >
                        {opt.name}
                    </span>
                ))}
            </div>
        </Link>
    );

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto pb-12">
                <h1 className="text-4xl md:text-5xl font-black mb-8 md:mb-12 text-center bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text">
                    COLOR BATTLE
                </h1>

                {/* Mobile: Toggle Create Form */}
                <div className="md:hidden mb-6">
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="w-full bg-gray-800 border border-gray-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                        {showForm ? '❌ Cancel' : '➕ Create New Battle'}
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">

                    {/* Create Battle Section */}
                    {/* Fixed Logic: Sticky creates issues on mobile if overflow is hidden elsewhere. Removed sticky for mobile simplicity. */}
                    <div className={`${showForm ? 'block' : 'hidden'} md:block`}>
                        <div className="bg-gray-900/50 p-6 md:p-8 rounded-2xl border border-gray-800 backdrop-blur-sm md:sticky md:top-8">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <span className="text-xl">⚔️</span> Create Battle
                            </h2>
                            <form onSubmit={handleCreateBattle} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Battle Name</label>
                                    <input
                                        type="text"
                                        value={newBattleName}
                                        onChange={(e) => setNewBattleName(e.target.value)}
                                        placeholder="e.g. Cats vs Dogs"
                                        className="w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Option 1 (Red)</label>
                                        <input
                                            type="text"
                                            value={option1}
                                            onChange={(e) => setOption1(e.target.value)}
                                            placeholder="Cats"
                                            className="w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-red-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Option 2 (Blue)</label>
                                        <input
                                            type="text"
                                            value={option2}
                                            onChange={(e) => setOption2(e.target.value)}
                                            placeholder="Dogs"
                                            className="w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {creating ? 'Creating...' : 'Start Battle! 🚀'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Battles List (Mobile: Second in DOM, Desktop: Right) */}
                    <div className="min-w-0">

                        {/* FEATURED: Top 5 Trending */}
                        {trendingBattles.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-yellow-500">
                                    <span className="text-2xl">📈</span> Trending Top 5
                                </h2>
                                <div className="space-y-1">
                                    {trendingBattles.map((battle) => (
                                        <BattleCard key={battle.battleId} battle={battle} trending={true} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recent Battles */}
                        <div>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-400">
                                <span className="text-xl">🆕</span> Recent Battles
                            </h2>
                            <div className="space-y-1">
                                {recentBattles.length === 0 && trendingBattles.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8 bg-gray-900/30 rounded-xl">
                                        No active battles yet. Be the first!
                                    </p>
                                ) : (
                                    recentBattles.map((battle) => (
                                        <BattleCard key={battle.battleId} battle={battle} />
                                    ))
                                )}
                            </div>

                            {/* Load More Button */}
                            {hasMore && (
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="w-full mt-6 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 rounded-xl transition-colors border border-gray-700 disabled:opacity-50"
                                >
                                    {loadingMore ? 'Loading...' : 'Load More'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
