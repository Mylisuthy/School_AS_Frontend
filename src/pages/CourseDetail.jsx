import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseService, lessonService } from '../services';

export default function CourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isNew = id === 'new';
    const isAdmin = user?.roles.includes('Admin');

    const [course, setCourse] = useState({
        title: '',
        description: '',
        imageUrl: '',
        status: 0,
        isEnrolled: false
    });
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(!isNew);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Lesson Management State (Admin)
    const [isAddingLesson, setIsAddingLesson] = useState(false);
    const [newLesson, setNewLesson] = useState({ title: '', content: '', videoUrl: '', order: 1 });

    useEffect(() => {
        if (!isNew) {
            fetchCourseDetails();
        }
    }, [id]);

    const fetchCourseDetails = async () => {
        try {
            setError('');
            const courseData = await courseService.getById(id);
            setCourse(courseData);

            if (courseData.isEnrolled || isAdmin) {
                const lessonData = await lessonService.getByCourseId(id);
                setLessons(lessonData.sort((a, b) => a.order - b.order));
            }
        } catch (err) {
            console.error(err);
            setError(err.formattedMessage || 'Failed to load details.');
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        try {
            setLoading(true);
            await courseService.enroll(id);
            setSuccessMsg("You have successfully enrolled!");
            fetchCourseDetails(); // Refresh to get isEnrolled = true
        } catch (err) {
            setError(err.formattedMessage || "Enrollment failed.");
            setLoading(false);
        }
    };

    const handleSaveCourse = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        try {
            if (isNew) {
                const res = await courseService.create(course);
                navigate(`/courses/${res.id}`);
            } else {
                await courseService.update(id, course);
                setSuccessMsg('Course saved successfully.');
            }
        } catch (err) {
            setError(err.formattedMessage || 'Failed to save course');
        }
    };

    const handleDeleteCourse = async () => {
        if (!window.confirm('Are you sure? This is irreversible.')) return;
        try {
            await courseService.delete(id);
            navigate('/courses');
        } catch (err) {
            setError(err.formattedMessage || 'Failed to delete course');
        }
    };

    const handlePublish = async () => {
        try {
            if (course.status === 0) {
                await courseService.publish(id);
                setSuccessMsg('Course published!');
            } else {
                await courseService.unpublish(id);
                setSuccessMsg('Course unpublished.');
            }
            fetchCourseDetails();
        } catch (err) {
            setError(err.formattedMessage || 'Failed to update status.');
        }
    };

    // Admin: Lesson Actions
    const handleCreateLesson = async (e) => {
        e.preventDefault();
        try {
            await lessonService.create({ ...newLesson, courseId: id });
            setIsAddingLesson(false);
            setNewLesson({ title: '', content: '', videoUrl: '', order: lessons.length + 2 });
            setSuccessMsg('Lesson added.');
            fetchCourseDetails();
        } catch (err) {
            setError(err.formattedMessage || 'Failed to create lesson');
        }
    };

    // Admin: Delete Lesson
    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm("Delete lesson?")) return;
        try {
            await lessonService.delete(lessonId);
            fetchCourseDetails();
        } catch (err) {
            setError(err.formattedMessage || "Failed to delete lesson");
        }
    }

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    // STUDENT VIEW: Not Enrolled
    if (!isAdmin && !isNew && !course.isEnrolled) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="h-64 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                        {course.imageUrl && <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover opacity-50" />}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <h1 className="text-4xl font-extrabold text-white text-center px-4 drop-shadow-lg">{course.title}</h1>
                        </div>
                    </div>
                    <div className="p-8">
                        <div className="prose max-w-none text-gray-600 mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">About this Course</h3>
                            <p>{course.description || "No description provided."}</p>
                        </div>
                        <div className="flex justify-center">
                            <button
                                onClick={handleEnroll}
                                className="px-8 py-4 bg-indigo-600 text-white text-xl font-bold rounded-xl shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all"
                            >
                                Enroll Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // AUTHENTICATED VIEW (Admin Editing OR Student Enrolled)
    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Navigation */}
                <button onClick={() => navigate('/courses')} className="text-gray-500 hover:text-indigo-600 font-medium flex items-center transition-colors mb-4">
                    &larr; Back to Dashboard
                </button>

                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm">{error}</div>}
                {successMsg && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-sm">{successMsg}</div>}

                {/* Course Header / Editor */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <h1 className="text-3xl font-bold text-gray-900">{isNew ? 'Create New Course' : course.title}</h1>
                            {/* Admin Actions */}
                            {isAdmin && !isNew && (
                                <div className="flex space-x-2">
                                    <button onClick={handlePublish} className={`px-4 py-2 rounded-lg font-bold text-sm ${course.status === 1 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                        {course.status === 1 ? 'Unpublish' : 'Publish'}
                                    </button>
                                    <button onClick={handleDeleteCourse} className="px-4 py-2 bg-red-100 text-red-800 rounded-lg font-bold text-sm">Delete</button>
                                </div>
                            )}
                        </div>

                        {/* Admin Edit Form */}
                        {isAdmin ? (
                            <form onSubmit={handleSaveCourse} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                                    <input type="text" value={course.title} onChange={e => setCourse({ ...course, title: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                    <textarea value={course.description} onChange={e => setCourse({ ...course, description: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500" rows="3" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Cover Image URL</label>
                                    <input type="text" value={course.imageUrl} onChange={e => setCourse({ ...course, imageUrl: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition">Save Course Details</button>
                                </div>
                            </form>
                        ) : (
                            // Student View of Details
                            <div className="prose max-w-none text-gray-600">
                                <p>{course.description}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lesson List */}
                {!isNew && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">Course Content</h2>
                            {isAdmin && (
                                <button onClick={() => setIsAddingLesson(!isAddingLesson)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700">
                                    + Add Lesson
                                </button>
                            )}
                        </div>

                        {/* Admin Add Lesson Form */}
                        {isAdmin && isAddingLesson && (
                            <div className="bg-gray-50 p-6 rounded-xl border border-indigo-200 animate-fadeIn">
                                <h3 className="font-bold text-lg mb-4">New Lesson</h3>
                                <form onSubmit={handleCreateLesson} className="space-y-4">
                                    <input type="text" placeholder="Lesson Title" value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })} className="w-full px-4 py-2 rounded border" required />
                                    <textarea placeholder="Lesson Content (Markdown supported)" value={newLesson.content} onChange={e => setNewLesson({ ...newLesson, content: e.target.value })} className="w-full px-4 py-2 rounded border" rows="4"></textarea>
                                    <input type="text" placeholder="Video URL (YouTube/Vimeo)" value={newLesson.videoUrl} onChange={e => setNewLesson({ ...newLesson, videoUrl: e.target.value })} className="w-full px-4 py-2 rounded border" />
                                    <div className="flex space-x-2">
                                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded font-bold">Create Lesson</button>
                                        <button type="button" onClick={() => setIsAddingLesson(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded font-bold">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* List */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
                            {lessons.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No lessons available yet.</div>
                            ) : (
                                lessons.map((lesson, index) => (
                                    <div key={lesson.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center group">
                                        <div className="flex items-center space-x-4 cursor-pointer" onClick={() => navigate(`/lessons/${lesson.id}`)}>
                                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                    {lesson.title}
                                                </h4>
                                                {/* If student, show completion status (need to implement logic) */}
                                            </div>
                                        </div>

                                        {isAdmin && (
                                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleDeleteLesson(lesson.id)} className="text-red-500 hover:text-red-700 p-2">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        )}
                                        {!isAdmin && (
                                            <button onClick={() => navigate(`/lessons/${lesson.id}`)} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors">
                                                Start Lesson
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
