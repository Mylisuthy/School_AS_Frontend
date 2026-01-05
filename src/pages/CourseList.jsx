import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseService } from '../services';

const MINECRAFT_ITEMS = ['⚔️', '🛡️', '🏹', '🧪', '🍎', '🥩', '🍞', '🍪', '🎂', '🪵', '💎', '🔑', '🗺️', '🕯️', '🔱', '🔥', '💧', '🌲', '⛏️', '🪓'];

const getRandomItem = (id) => {
    // Deterministic item based on ID to avoid hydration mismatches
    const charCode = id ? id.charCodeAt(0) : 0;
    return MINECRAFT_ITEMS[charCode % MINECRAFT_ITEMS.length];
};

const CourseList = () => {
    const { user, logout } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Determine status filter based on role
                const status = user?.roles.includes('Admin') ? null : 1; // 1 = Published
                const data = await courseService.getAll({
                    status,
                    q: searchTerm,
                    page: 1,
                    pageSize: 100
                });
                setCourses(data);
            } catch (err) {
                console.error("Error fetching courses:", err);
                setError(err.formattedMessage || 'Failed to load courses.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [user, searchTerm]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="text-2xl text-minecraft-dark animate-pulse retro-shadow">Loading Chunks...</div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mc-card bg-[#C6C6C6] border-b-[#555555]">
                <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                    <span className="text-4xl filter drop-shadow-md">🧰</span>
                    <h1 className="text-3xl text-minecraft-dark retro-shadow">
                        Chest (Inventory)
                    </h1>
                </div>

                <div className="flex space-x-4 w-full sm:w-auto items-center">
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full sm:w-64 mc-input"
                    />
                    {user?.roles.includes('Admin') && (
                        <Link
                            to="/courses/new"
                            className="flex items-center px-4 py-2 mc-btn-stone"
                        >
                            <span className="mr-2 text-xl">🔨</span>
                            Craft Course
                        </Link>
                    )}
                    {user?.roles.includes('Admin') && (
                        <Link
                            to="/admin/dashboard"
                            className="flex items-center px-4 py-2 mc-btn-stone bg-red-800/50 hover:bg-red-700/50 ml-2"
                        >
                            <span className="mr-2 text-xl">📊</span>
                            Dashboard
                        </Link>
                    )}
                    <button
                        onClick={logout}
                        className="flex items-center px-4 py-2 mc-btn-stone bg-red-800 hover:bg-red-700 ml-2 border-red-900"
                        title="Disconnect"
                    >
                        <span className="mr-2 text-xl">🚪</span>
                        Log Out
                    </button>
                </div>
            </div>

            {
                error && (
                    <div className="bg-red-900/80 border-2 border-red-500 p-4 retro-shadow text-white">
                        <p>Error: {error}</p>
                    </div>
                )
            }

            {
                courses.length === 0 ? (
                    <div className="text-center py-12 mc-card opacity-80">
                        <h3 className="text-2xl text-minecraft-dark retro-shadow">Inventory Empty</h3>
                        <p className="mt-1 text-lg text-gray-700">
                            {searchTerm ? 'No items match your search.' : 'Craft a new course to get started.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <Link
                                key={course.id}
                                to={`/courses/${course.id}`}
                                className="group mc-card hover:bg-[#d1d1d1] transition-all relative block h-full flex flex-col p-0"
                            >
                                {/* Inner Bevel for Image */}
                                <div className="border-b-4 border-r-white border-l-[#555555] border-t-[#555555] border-b-white bg-gray-800 h-48 relative overflow-hidden m-2 mb-0 flex items-center justify-center">
                                    {course.imageUrl ? (
                                        <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500 rendering-pixelated" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-[#8b8b8b]">
                                            <span className="text-8xl filter drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)] transform group-hover:scale-110 transition-transform duration-200">
                                                {getRandomItem(course.id)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <span className={`px-2 py-1 text-sm border-2 ${course.status === 1
                                            ? 'bg-green-600 border-green-800 text-white'
                                            : 'bg-yellow-600 border-yellow-800 text-white'
                                            } retro-shadow shadow-md`}>
                                            {course.status === 1 ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 flex-1 flex flex-col">
                                    <h2 className="text-xl text-minecraft-dark retro-shadow mb-2 line-clamp-2">
                                        {course.title}
                                    </h2>

                                    <div className="mt-auto pt-4 border-t-2 border-[#a0a0a0] border-b-white flex justify-between items-center text-sm text-gray-700">
                                        <span className="flex items-center">
                                            <span className="mr-2 text-lg">📅</span>
                                            {new Date(course.updatedAt).toLocaleDateString()}
                                        </span>
                                        <span className="text-blue-800 font-bold group-hover:underline flex items-center">
                                            Open {'>'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )
            }
        </div >
    );
};

export default CourseList;
