import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function CourseList() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(''); // 'Draft' or 'Published' or ''
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourses();
    }, [filter]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            // Construct query string manually or use params object
            const statusQuery = filter !== '' ? `&status=${filter === 'Published' ? 1 : 0}` : '';
            const response = await api.get(`/courses/search?page=1&pageSize=100${statusQuery}`);
            setCourses(response.data);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <nav className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                SchoolAS
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                localStorage.removeItem('token');
                                navigate('/login');
                            }}
                            className="text-gray-500 hover:text-red-500 transition-colors font-medium text-sm"
                        >
                            Log out
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        My Courses
                    </h1>
                    <div className="flex space-x-3">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-lg shadow-sm"
                        >
                            <option value="">All Statuses</option>
                            <option value="Draft">Draft</option>
                            <option value="Published">Published</option>
                        </select>
                        <button
                            onClick={() => navigate('/courses/new')} // We'll implement this route next
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all transform hover:scale-105"
                        >
                            + New Course
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                className="bg-white overflow-hidden rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                                onClick={() => navigate(`/courses/${course.id}`)}
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.status === 1 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {course.status === 1 ? 'Published' : 'Draft'}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(course.updatedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                                        {course.title}
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                                        Click to manage lessons and course details.
                                    </p>
                                </div>
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                    <div className="flex justify-end">
                                        <span className="text-sm font-medium text-purple-600 group-hover:text-purple-500 flex items-center">
                                            Manage Course &rarr;
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {courses.length === 0 && (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-500 text-lg">No courses found.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
