import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function CourseList() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(''); // 'Draft' or 'Published' or ''
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourses();
    }, [filter]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            setError('');
            const statusQuery = filter !== '' ? `&status=${filter === 'Published' ? 1 : 0}` : '';
            const response = await api.get(`/courses/search?page=1&pageSize=100${statusQuery}`);
            setCourses(response.data);
        } catch (err) {
            setError(err.formattedMessage || "Failed to fetch courses. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-10 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/courses')}>
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl mr-3 shadow-md">S</div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                SchoolAS
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                localStorage.removeItem('token');
                                navigate('/login');
                            }}
                            className="text-gray-500 hover:text-red-500 transition-colors font-medium text-sm flex items-center px-4 py-2 rounded-lg hover:bg-red-50"
                        >
                            Log out
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3 text-red-700 animate-fade-in-down">
                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        <span>{error}</span>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        My Courses
                    </h1>
                    <div className="flex space-x-3 w-full sm:w-auto">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="block w-full sm:w-auto pl-3 pr-10 py-2.5 text-base border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm rounded-xl shadow-sm bg-white hover:border-gray-300 transition-colors"
                        >
                            <option value="">All Statuses</option>
                            <option value="Draft">Draft</option>
                            <option value="Published">Published</option>
                        </select>
                        <button
                            onClick={() => navigate('/courses/new')}
                            className="inline-flex justify-center w-full sm:w-auto items-center px-4 py-2.5 border border-transparent text-sm font-bold rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all transform hover:scale-[1.02] hover:shadow-purple-500/30"
                        >
                            + New Course
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-purple-600 animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
                                onClick={() => navigate(`/courses/${course.id}`)}
                            >
                                <div className="p-6 flex-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${course.status === 1 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {course.status === 1 ? 'Published' : 'Draft'}
                                        </span>
                                        <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-md">
                                            {new Date(course.updatedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300 mb-2">
                                        {course.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-3">
                                        Manage your curriculum, lessons, and course settings.
                                    </p>
                                </div>
                                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 rounded-b-2xl">
                                    <div className="flex justify-end">
                                        <span className="text-sm font-semibold text-purple-600 group-hover:text-purple-700 flex items-center transition-colors">
                                            Manage Course <span className="ml-1 transform group-hover:translate-x-1 transition-transform">&rarr;</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {courses.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-dashed border-gray-300 text-center shadow-sm">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-3xl">📚</div>
                                <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
                                <p className="mt-1 text-gray-500 max-w-sm">Get started by creating your first course.</p>
                                <button
                                    onClick={() => navigate('/courses/new')}
                                    className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-purple-700 bg-purple-100 hover:bg-purple-200 transition-colors"
                                >
                                    Create Course
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
