import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [course, setCourse] = useState({ title: '', status: 0 }); // 0: Draft, 1: Published
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(!isNew);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Lesson Form State
    const [isAddingLesson, setIsAddingLesson] = useState(false);
    const [newLessonTitle, setNewLessonTitle] = useState('');
    const [newLessonOrder, setNewLessonOrder] = useState(1);

    useEffect(() => {
        if (!isNew) {
            fetchCourseDetails();
        }
    }, [id]);

    const fetchCourseDetails = async () => {
        try {
            setError('');
            const courseRes = await api.get(`/courses/${id}`);
            setCourse(courseRes.data);

            const lessonRes = await api.get(`/lessons/course/${id}`);
            setLessons(lessonRes.data.sort((a, b) => a.order - b.order));
        } catch (err) {
            setError(err.formattedMessage || 'Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCourse = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        try {
            if (isNew) {
                const res = await api.post('/courses', { title: course.title });
                navigate(`/courses/${res.data.id}`);
            } else {
                await api.put(`/courses/${id}`, { title: course.title });
                setSuccessMsg('Course saved successfully.');
                fetchCourseDetails();
            }
        } catch (err) {
            setError(err.formattedMessage || 'Failed to save course');
        }
    };

    const handleDeleteCourse = async () => {
        if (!window.confirm('Are you sure you want to delete this course? This action is irreversible.')) return;
        try {
            await api.delete(`/courses/${id}`);
            navigate('/courses');
        } catch (err) {
            setError(err.formattedMessage || 'Failed to delete course');
        }
    };

    const handlePublish = async () => {
        try {
            setError('');
            if (course.status === 0) {
                await api.patch(`/courses/${id}/publish`);
                setSuccessMsg('Course published!');
            } else {
                await api.patch(`/courses/${id}/unpublish`);
                setSuccessMsg('Course unpublished.');
            }
            fetchCourseDetails();
        } catch (err) {
            setError(err.formattedMessage || 'Failed to update status. Check if course has lessons.');
        }
    };

    const handleCreateLesson = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/lessons', {
                courseId: id,
                title: newLessonTitle,
                order: parseInt(newLessonOrder)
            });
            setIsAddingLesson(false);
            setNewLessonTitle('');
            setSuccessMsg('Lesson added successfully.');
            fetchCourseDetails();
        } catch (err) {
            setError(err.formattedMessage || 'Failed to create lesson');
        }
    };

    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm('Delete this lesson?')) return;
        try {
            await api.delete(`/lessons/${lessonId}`);
            fetchCourseDetails();
        } catch (err) {
            setError(err.formattedMessage || 'Failed to delete lesson');
        }
    };

    const handleMoveLesson = async (index, direction) => {
        setError('');
        const newLessons = [...lessons];
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= newLessons.length) return;

        const temp = newLessons[index];
        newLessons[index] = newLessons[targetIndex];
        newLessons[targetIndex] = temp;

        setLessons(newLessons); // Optimistic

        try {
            const idsInOrder = newLessons.map(l => l.id);
            await api.post(`/lessons/course/${id}/reorder`, idsInOrder);
            // fetchCourseDetails(); // Optional if we trust optimistic
        } catch (err) {
            setError(err.formattedMessage || "Failed to reorder lessons");
            fetchCourseDetails(); // Revert
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-purple-600 animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Error/Success Messages */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3 text-red-700 animate-fade-in-down shadow-sm">
                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        <span className="font-medium">{error}</span>
                    </div>
                )}
                {successMsg && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3 text-green-700 animate-fade-in-down shadow-sm">
                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        <span className="font-medium">{successMsg}</span>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Header / Course Form */}
                    <div className="p-8 border-b border-gray-100 bg-white">
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                            <button onClick={() => navigate('/courses')} className="text-gray-500 hover:text-purple-600 font-medium flex items-center transition-colors">
                                &larr; Back to Courses
                            </button>
                            {!isNew && (
                                <div className="flex space-x-3 w-full sm:w-auto">
                                    <button
                                        onClick={handlePublish}
                                        className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold transition-all transform hover:scale-105 shadow-sm ${course.status === 1 ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                                    >
                                        {course.status === 1 ? 'Unpublish' : 'Publish'}
                                    </button>
                                    <button
                                        onClick={handleDeleteCourse}
                                        className="flex-1 sm:flex-none px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all transform hover:scale-105 shadow-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSaveCourse} className="space-y-2">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Course Title</label>
                            <div className="flex rounded-xl shadow-sm">
                                <input
                                    type="text"
                                    value={course.title}
                                    onChange={(e) => setCourse({ ...course, title: e.target.value })}
                                    required
                                    className="flex-1 min-w-0 block w-full px-4 py-3 rounded-l-xl border border-gray-300 focus:ring-purple-500 focus:border-purple-500 text-lg font-semibold text-gray-900 bg-gray-50 focus:bg-white transition-colors"
                                    placeholder="e.g. Advanced Backend Architecture"
                                />
                                <button
                                    type="submit"
                                    className="ml-[-1px] relative inline-flex items-center px-6 py-3 border border-transparent text-base font-bold rounded-r-xl shadow-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none z-10 hover:z-20 transform hover:scale-105 transition-all"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Lessons Section */}
                    {!isNew && (
                        <div className="p-8 bg-gray-50/50">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                    <span className="bg-purple-100 text-purple-600 p-2 rounded-lg mr-3">
                                        📖
                                    </span>
                                    Lessons
                                    <span className="ml-3 bg-gray-200 text-gray-600 text-xs py-1 px-2 rounded-full">{lessons.length}</span>
                                </h2>
                                <button
                                    onClick={() => {
                                        setIsAddingLesson(true);
                                        setError('');
                                        setSuccessMsg('');
                                        setNewLessonOrder(lessons.length > 0 ? Math.max(...lessons.map(l => l.order)) + 1 : 1);
                                    }}
                                    className="inline-flex items-center px-4 py-2 border border-gray-200 shadow-sm text-sm font-bold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all hover:border-purple-300"
                                >
                                    + Add Lesson
                                </button>
                            </div>

                            {isAddingLesson && (
                                <form onSubmit={handleCreateLesson} className="mb-6 p-6 bg-white rounded-2xl shadow-lg border border-purple-100 animate-slide-down relative">
                                    <h3 className="text-sm font-bold text-gray-900 mb-4">New Lesson</h3>
                                    <div className="grid grid-cols-12 gap-4 items-end">
                                        <div className="col-span-8">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                                            <input
                                                type="text"
                                                value={newLessonTitle}
                                                onChange={(e) => setNewLessonTitle(e.target.value)}
                                                className="block w-full border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-2.5"
                                                required
                                                placeholder="Lesson Name"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Order</label>
                                            <input
                                                type="number"
                                                value={newLessonOrder}
                                                onChange={(e) => setNewLessonOrder(e.target.value)}
                                                className="block w-full border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-2.5"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2 flex space-x-2">
                                            <button type="submit" className="flex-1 bg-purple-600 text-white rounded-lg py-2.5 text-sm hover:bg-purple-700 font-bold shadow-md transform hover:scale-105 transition-all">Add</button>
                                            <button type="button" onClick={() => setIsAddingLesson(false)} className="flex-1 bg-gray-100 text-gray-600 rounded-lg py-2.5 text-sm hover:bg-gray-200 font-medium">Cancel</button>
                                        </div>
                                    </div>
                                </form>
                            )}

                            <div className="space-y-3">
                                {lessons.map((lesson, index) => (
                                    <div key={lesson.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-purple-200 group">
                                        <div className="flex items-center space-x-4">
                                            <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-50 text-purple-700 rounded-lg font-bold text-lg border border-purple-100">
                                                {lesson.order}
                                            </span>
                                            <span className="font-semibold text-gray-900 text-lg group-hover:text-purple-700 transition-colors">{lesson.title}</span>
                                        </div>
                                        <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1 border border-gray-100 opacity-80 hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleMoveLesson(index, -1)}
                                                disabled={index === 0}
                                                className="p-2 text-gray-400 hover:text-purple-600 disabled:opacity-30 hover:bg-white rounded-md transition-colors"
                                                title="Move Up"
                                            >
                                                &uarr;
                                            </button>
                                            <button
                                                onClick={() => handleMoveLesson(index, 1)}
                                                disabled={index === lessons.length - 1}
                                                className="p-2 text-gray-400 hover:text-purple-600 disabled:opacity-30 hover:bg-white rounded-md transition-colors"
                                                title="Move Down"
                                            >
                                                &darr;
                                            </button>
                                            <div className="w-px h-4 bg-gray-300 mx-1"></div>
                                            <button
                                                onClick={() => handleDeleteLesson(lesson.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                title="Delete Lesson"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {lessons.length === 0 && (
                                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                                        <p className="text-gray-400 mb-2">No lessons added yet.</p>
                                        <button onClick={() => setIsAddingLesson(true)} className="text-purple-600 font-bold hover:underline">Add your first lesson</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
