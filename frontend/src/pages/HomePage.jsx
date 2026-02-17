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

    const [error, setError] = useState(null);

    // Form State
    const [newBattleName, setNewBattleName] = useState('');
    const [option1, setOption1] = useState('');
    const [option2, setOption2] = useState('');
    const [creating, setCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        // Initial Fetch Sequence
        const init = async () => {
            setError(null);
            try {
                const trending = await fetchTrending();
                const excludeIds = trending ? trending.map(b => b.battleId) : [];
                await fetchRecent(1, excludeIds);
            } catch (err) {
                console.error("Init failed:", err);
                setError(err.message || "Failed to load battles");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const fetchTrending = async () => {
        try {
            const res = await axios.get(`${API_URL}/battles/trending`);
            setTrendingBattles(res.data);
            return res.data; // Return for chaining
        } catch (error) {
            console.error("Error fetching trending:", error);
            // Trending failure is non-critical, don't throw
            return [];
        }
    };

    const fetchRecent = async (pageNum, specificExcludeIds = null) => {
        try {
            const limit = 10;
            // Use specific IDs if passed (initial load), otherwise state (load more)
            const idsToExclude = specificExcludeIds || trendingBattles.map(b => b.battleId);
            const excludeIdsStr = idsToExclude.join(',');

            const res = await axios.get(`${API_URL}/battles`, {
                params: { page: pageNum, limit, excludeIds: excludeIdsStr }
            });
            const newBattles = res.data;

            if (newBattles.length < limit) {
                setHasMore(false);
            }

            setRecentBattles(prev => pageNum === 1 ? newBattles : [...prev, ...newBattles]);
        } catch (error) {
            console.error("Error fetching battles:", error);
            if (pageNum === 1) throw new Error("No se pudo conectar con el servidor. Verifica tu conexión.");
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
                <div
                    role="status"
                    aria-label="Cargando"
                    className="animate-spin rounded-full h-12 w-12 border-t-bg-gray-800 border-t-2 border-b-2 border-white"
                ></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold mb-2">Error de Conexión</h2>
                <p className="text-gray-400 mb-6 max-w-md">{error}</p>
                <div className="flex gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors"
                    >
                        Recargar Página
                    </button>
                    <p className="text-xs text-gray-500 mt-2">Server: {API_URL}</p>
                </div>
            </div>
        );
    }

    const BattleCard = ({ battle, trending = false }) => {
        // Theme fallback or use provided
        const theme = battle.theme || {
            optionAColor: '#ef4444',
            optionBColor: '#3b82f6',
            background: 'linear-gradient(to right, #1f2937, #111827)'
        };

        return (
            <Link
                to={`/battle/${battle.battleId}`}
                className={`block bg-gray-900/30 hover:bg-gray-800 border ${trending ? 'border-yellow-500/50 shadow-yellow-500/20 shadow-sm' : 'border-gray-800'} hover:border-gray-700 rounded-xl p-4 transition-all hover:scale-[1.01] group mb-3 relative overflow-hidden`}
                style={{ background: `linear-gradient(to bottom right, ${theme.background.split(',')[1] || '#1f2937'}20, ${theme.background.split(',')[2] || '#111827'}20)` }}
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
                            className={`text-xs px-2 py-1 rounded bg-opacity-80 text-white font-bold shadow-sm truncate flex-1 text-center`}
                            style={{ backgroundColor: i === 0 ? theme.optionAColor : theme.optionBColor }}
                        >
                            {opt.name}
                        </span>
                    ))}
                </div>
            </Link>
        );
    };

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
                        {showForm ? '❌ Cancelar' : '➕ Crear Nueva Batalla'}
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">

                    {/* Create Battle Section */}
                    <div className={`${showForm ? 'block' : 'hidden'} md:block`}>
                        <div className="bg-gray-900/50 p-6 md:p-8 rounded-2xl border border-gray-800 backdrop-blur-sm md:sticky md:top-8">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <span className="text-xl">⚔️</span> Crear Batalla
                            </h2>
                            <form onSubmit={handleCreateBattle} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Nombre de la Batalla</label>
                                    <input
                                        type="text"
                                        value={newBattleName}
                                        onChange={(e) => setNewBattleName(e.target.value)}
                                        placeholder="ej. Gatos vs Perros"
                                        className="w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Opción 1 (Rojo)</label>
                                        <input
                                            type="text"
                                            value={option1}
                                            onChange={(e) => setOption1(e.target.value)}
                                            placeholder="Gatos"
                                            className="w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-red-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Opción 2 (Azul)</label>
                                        <input
                                            type="text"
                                            value={option2}
                                            onChange={(e) => setOption2(e.target.value)}
                                            placeholder="Perros"
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
                                    {creating ? 'Creando...' : '¡Empezar Batalla! 🚀'}
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
                                    <span className="text-2xl">📈</span> Top 5 Tendencias
                                </h2>
                                <div className="space-y-1">
                                    {trendingBattles.map((battle) => (
                                        <BattleCard key={battle.battleId} battle={battle} trending={true} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Top Voted Battles */}
                        <div>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-400">
                                <span className="text-xl">🏆</span> Más Votadas
                            </h2>
                            <div className="space-y-1">
                                {recentBattles.length === 0 && trendingBattles.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8 bg-gray-900/30 rounded-xl">
                                        No hay batallas activas. ¡Sé el primero!
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
                                    {loadingMore ? 'Cargando...' : 'Cargar Más'}
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
