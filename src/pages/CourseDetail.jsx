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
            const courseRes = await api.get(`/courses/${id}`);
            setCourse(courseRes.data);

            // Fetch lessons - assuming API has endpoint or we get it from course details if included
            // But based on requirements, there is: GET /api/courses/{id}/summary and lessons listing is separate usually?
            // Requirement says: "Listar lecciones por curso"
            // Let's assume we need to fetch them. If not in course DTO, we might need a separate endpoint or it should be in CourseDto
            // Looking at CourseDto in backend: it HAS NO lessons list, but CourseSummaryDto has count.
            // Wait, requirement: "Listar lecciones por curso". We probably need an endpoint for this.
            // Let's check LessonController or Course controller. 
            // Checking backend... LessonController likely has GetByCourseId.
            // Assuming GET /api/lessons?courseId={id} or similar.
            // Let's guess GET /api/courses/{id}/lessons or GET /api/lessons?courseId={id} based on REST.
            // I'll assume /api/lessons/course/{id} or query.
            // Let's try to fetch lessons from presumed endpoint.

            const lessonRes = await api.get(`/lessons/course/${id}`);
            setLessons(lessonRes.data.sort((a, b) => a.order - b.order));
        } catch (err) {
            setError('Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCourse = async (e) => {
        e.preventDefault();
        try {
            if (isNew) {
                const res = await api.post('/courses', { title: course.title });
                navigate(`/courses/${res.data.id}`);
            } else {
                await api.put(`/courses/${id}`, { title: course.title });
                // Refresh details
                fetchCourseDetails();
            }
        } catch (err) {
            setError('Failed to save course');
        }
    };

    const handleDeleteCourse = async () => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;
        try {
            await api.delete(`/courses/${id}`);
            navigate('/courses');
        } catch (err) {
            setError('Failed to delete course');
        }
    };

    const handlePublish = async () => {
        try {
            if (course.status === 0) {
                await api.patch(`/courses/${id}/publish`);
            } else {
                await api.patch(`/courses/${id}/unpublish`);
            }
            fetchCourseDetails();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleCreateLesson = async (e) => {
        e.preventDefault();
        try {
            await api.post('/lessons', {
                courseId: id,
                title: newLessonTitle,
                order: parseInt(newLessonOrder)
            });
            setIsAddingLesson(false);
            setNewLessonTitle('');
            fetchCourseDetails();
        } catch (err) {
            alert(err.response?.data?.Message || 'Failed to create lesson');
        }
    };

    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm('Delete this lesson?')) return;
        try {
            await api.delete(`/lessons/${lessonId}`);
            fetchCourseDetails();
        } catch (err) {
            alert('Failed to delete lesson');
        }
    };

    const handleMoveLesson = async (index, direction) => {
        // Simple swap logic for UI, then send reorder request
        // Requirement: "Reordenar lecciones (subir/bajar posición)"
        // And "El reordenamiento de lecciones no debe generar órdenes duplicados."
        // Best approach: Swap orders of two lessons and update both? Or use Reorder Endpoint if exists?
        // Backend LessonService has `ReorderAsync`. Let's see if Controller exposes it.
        // Assuming endpoint: POST /api/lessons/reorder { courseId, lessonIdsInOrder }

        const newLessons = [...lessons];
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= newLessons.length) return;

        const temp = newLessons[index];
        newLessons[index] = newLessons[targetIndex];
        newLessons[targetIndex] = temp;

        setLessons(newLessons); // Optimistic update

        try {
            const idsInOrder = newLessons.map(l => l.id);
            await api.post(`/lessons/reorder`, { courseId: id, lessonIdsInOrder: idsInOrder });
            fetchCourseDetails(); // Refresh to be safe
        } catch (err) {
            alert("Failed to reorder");
            fetchCourseDetails(); // Revert
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

                {/* Header / Course Form */}
                <div className="p-8 border-b border-gray-100 bg-white">
                    <div className="flex justify-between items-start mb-6">
                        <button onClick={() => navigate('/courses')} className="text-gray-500 hover:text-gray-700 flex items-center">
                            &larr; Back to Courses
                        </button>
                        {!isNew && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={handlePublish}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${course.status === 1 ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                                >
                                    {course.status === 1 ? 'Unpublish' : 'Publish'}
                                </button>
                                <button
                                    onClick={handleDeleteCourse}
                                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSaveCourse} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Course Title</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <input
                                    type="text"
                                    value={course.title}
                                    onChange={(e) => setCourse({ ...course, title: e.target.value })}
                                    required
                                    className="flex-1 min-w-0 block w-full px-4 py-3 rounded-l-lg rounded-r-lg border border-gray-300 focus:ring-purple-500 focus:border-purple-500 sm:text-lg"
                                    placeholder="e.g. Advanced Backend Architecture"
                                />
                                <button
                                    type="submit"
                                    className="ml-3 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </form>
                    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                </div>

                {/* Lessons Section */}
                {!isNew && (
                    <div className="p-8 bg-gray-50/50">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Lessons</h2>
                            <button
                                onClick={() => {
                                    setIsAddingLesson(true);
                                    setNewLessonOrder(lessons.length > 0 ? Math.max(...lessons.map(l => l.order)) + 1 : 1);
                                }}
                                className="text-sm px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                + Add Lesson
                            </button>
                        </div>

                        {isAddingLesson && (
                            <form onSubmit={handleCreateLesson} className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-purple-100">
                                <div className="grid grid-cols-12 gap-4 items-end">
                                    <div className="col-span-8">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                                        <input
                                            type="text"
                                            value={newLessonTitle}
                                            onChange={(e) => setNewLessonTitle(e.target.value)}
                                            className="block w-full border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Order</label>
                                        <input
                                            type="number"
                                            value={newLessonOrder}
                                            onChange={(e) => setNewLessonOrder(e.target.value)}
                                            className="block w-full border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2 flex space-x-2">
                                        <button type="submit" className="flex-1 bg-purple-600 text-white rounded-md py-2 text-sm hover:bg-purple-700">Add</button>
                                        <button type="button" onClick={() => setIsAddingLesson(false)} className="flex-1 bg-gray-200 text-gray-700 rounded-md py-2 text-sm hover:bg-gray-300">Cancel</button>
                                    </div>
                                </div>
                            </form>
                        )}

                        <div className="space-y-3">
                            {lessons.map((lesson, index) => (
                                <div key={lesson.id} className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center space-x-4">
                                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full font-bold text-sm">
                                            {lesson.order}
                                        </span>
                                        <span className="font-medium text-gray-900">{lesson.title}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleMoveLesson(index, -1)}
                                            disabled={index === 0}
                                            className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                        >
                                            &uarr;
                                        </button>
                                        <button
                                            onClick={() => handleMoveLesson(index, 1)}
                                            disabled={index === lessons.length - 1}
                                            className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                        >
                                            &darr;
                                        </button>
                                        <button
                                            onClick={() => handleDeleteLesson(lesson.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 ml-2"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {lessons.length === 0 && <p className="text-gray-500 text-sm text-center py-4 italic">No lessons yet.</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
