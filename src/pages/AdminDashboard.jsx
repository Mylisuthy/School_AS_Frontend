import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await dashboardService.getStats();
                setStats(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load dashboard statistics.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-900">
            <div className="text-2xl text-white font-minecraft animate-pulse retro-shadow">Loading Redstone Circuits...</div>
        </div>
    );

    if (error) return (
        <div className="p-8 text-center text-red-100 bg-red-900 border-2 border-red-500 m-8 mc-card">
            {error}
        </div>
    );

    return (
        <div className="min-h-screen font-minecraft bg-[#1a1a1a] p-6 text-white space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center bg-[#333] border-4 border-[#555] p-4 text-white shadow-lg">
                <div className="flex items-center space-x-3">
                    <span className="text-4xl animate-pulse">🔴</span>
                    <h1 className="text-3xl retro-shadow font-bold text-red-400">Command Block (Admin Dashboard)</h1>
                </div>
                <Link to="/courses" className="mc-btn-stone px-4 py-2 flex items-center">
                    &larr; Return to World
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Users Card */}
                <div className="bg-[#2c2c2c] border-4 border-[#555] p-6 relative overflow-hidden group hover:border-blue-400 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 text-8xl">👤</div>
                    <h3 className="text-gray-400 uppercase tracking-widest text-sm font-bold mb-2">Total Players</h3>
                    <p className="text-5xl font-bold retro-shadow text-blue-300">{stats.totalUsers}</p>
                </div>

                {/* Enrollments Card */}
                <div className="bg-[#2c2c2c] border-4 border-[#555] p-6 relative overflow-hidden group hover:border-green-400 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 text-8xl">📜</div>
                    <h3 className="text-gray-400 uppercase tracking-widest text-sm font-bold mb-2">Active Quests</h3>
                    <p className="text-5xl font-bold retro-shadow text-green-300">{stats.totalEnrollments}</p>
                </div>

                {/* Completions Card */}
                <div className="bg-[#2c2c2c] border-4 border-[#555] p-6 relative overflow-hidden group hover:border-yellow-400 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 text-8xl">🏆</div>
                    <h3 className="text-gray-400 uppercase tracking-widest text-sm font-bold mb-2">Completed Quests</h3>
                    <p className="text-5xl font-bold retro-shadow text-yellow-300">{stats.totalCompletions}</p>
                </div>
            </div>

            {/* Top Courses Table */}
            <div className="bg-[#2c2c2c] border-4 border-[#555] p-6">
                <h2 className="text-2xl mb-6 text-purple-300 retro-shadow border-b-2 border-[#444] pb-2 flex items-center">
                    <span className="mr-3">💎</span> Most Popular Realms
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-4 border-[#444] text-gray-400">
                                <th className="p-4">Rank</th>
                                <th className="p-4">Realm Name</th>
                                <th className="p-4 text-center">Adventurers</th>
                                <th className="p-4 text-center">Conquerors</th>
                                <th className="p-4 text-center">Completion Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#444]">
                            {stats.topCourses.map((course, index) => {
                                const rate = course.enrollments > 0
                                    ? Math.round((course.completions / course.enrollments) * 100)
                                    : 0;

                                return (
                                    <tr key={index} className="hover:bg-[#383838] transition-colors">
                                        <td className="p-4 font-bold text-gray-500">#{index + 1}</td>
                                        <td className="p-4 font-bold text-white">{course.title}</td>
                                        <td className="p-4 text-center text-blue-300">{course.enrollments}</td>
                                        <td className="p-4 text-center text-yellow-300">{course.completions}</td>
                                        <td className="p-4 text-center">
                                            <div className="w-full bg-[#111] h-4 border border-[#555] relative">
                                                <div
                                                    className={`h-full ${rate >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${rate}%` }}
                                                ></div>
                                                <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white shadow-black drop-shadow-md">
                                                    {rate}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
