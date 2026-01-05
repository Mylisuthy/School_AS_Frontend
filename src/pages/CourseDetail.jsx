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
            setSuccessMsg("Quest Accepted!");
            fetchCourseDetails(); // Refresh to get isEnrolled = true
        } catch (err) {
            setError(err.formattedMessage || "Failed to accept quest.");
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
                setSuccessMsg('Quest updated successfully.');
            }
        } catch (err) {
            setError(err.formattedMessage || 'Failed to save quest info');
        }
    };

    const handleDeleteCourse = async () => {
        if (!window.confirm('Delete this Quest? This cannot be undone.')) return;
        try {
            await courseService.delete(id);
            navigate('/courses');
        } catch (err) {
            setError(err.formattedMessage || 'Failed to delete quest');
        }
    };

    const handlePublish = async () => {
        try {
            if (course.status === 0) {
                await courseService.publish(id);
                setSuccessMsg('Quest Published to Server!');
            } else {
                await courseService.unpublish(id);
                setSuccessMsg('Quest hidden (Draft).');
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
            setSuccessMsg('Stage added.');
            fetchCourseDetails();
        } catch (err) {
            setError(err.formattedMessage || 'Failed to create stage');
        }
    };

    // Admin: Delete Lesson
    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm("Remove this stage?")) return;
        try {
            await lessonService.delete(lessonId);
            fetchCourseDetails();
        } catch (err) {
            setError(err.formattedMessage || "Failed to remove stage");
        }
    }

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-2xl text-minecraft-dark animate-pulse retro-shadow">Loading Quest Data...</div>
        </div>
    );

    // STUDENT VIEW: Not Enrolled
    if (!isAdmin && !isNew && !course.isEnrolled) {
        return (
            <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto mc-card bg-[#C6C6C6]">
                    <div className="h-64 border-2 border-white border-r-[#555555] border-b-[#555555] bg-black bg-opacity-20 relative mb-6">
                        {course.imageUrl ? (
                            <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover opacity-90 rendering-pixelated" />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <span className="text-4xl text-gray-500 font-minecraft">?</span>
                            </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <h1 className="text-5xl text-white retro-shadow font-minecraft px-4 text-center">{course.title}</h1>
                        </div>
                    </div>
                    <div className="p-4 bg-[#b0b0b0] border-2 border-[#555555]">
                        <div className="prose max-w-none text-minecraft-dark mb-8">
                            <h3 className="text-2xl retro-shadow mb-2 underline decoration-2 decoration-[#555555]">Quest Description</h3>
                            <p className="text-lg leading-relaxed">{course.description || "No description provided."}</p>
                        </div>
                        <div className="flex justify-center">
                            <button
                                onClick={handleEnroll}
                                className="px-8 py-4 mc-btn-stone text-2xl"
                            >
                                Accept Quest
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // AUTHENTICATED VIEW (Admin Editing OR Student Enrolled)
    return (
        <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-minecraft">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Navigation */}
                <button onClick={() => navigate('/courses')} className="mc-btn-stone px-4 py-2 inline-flex items-center text-lg">
                    &larr; Return to Inventory
                </button>

                {error && <div className="bg-red-900/80 border-2 border-red-500 text-red-100 p-4 retro-shadow">{error}</div>}
                {successMsg && <div className="bg-green-700/80 border-2 border-green-400 text-green-100 p-4 retro-shadow">{successMsg}</div>}

                {/* Course Header / Editor */}
                <div className="mc-card bg-[#C6C6C6]">
                    <div className="p-4">
                        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
                            <h1 className="text-4xl text-minecraft-dark retro-shadow mb-4 md:mb-0">
                                {isNew ? 'Craft New Quest' : course.title}
                            </h1>
                            {/* Admin Actions */}
                            {isAdmin && !isNew && (
                                <div className="flex space-x-2">
                                    <button onClick={handlePublish} className={`mc-btn-stone px-4 py-2 ${course.status === 1 ? 'text-yellow-200' : 'text-green-200'}`}>
                                        {course.status === 1 ? 'Go to Draft' : 'Publish to Server'}
                                    </button>
                                    <button onClick={handleDeleteCourse} className="mc-btn-stone px-4 py-2 text-red-300">Destroy</button>
                                </div>
                            )}
                        </div>

                        {/* Admin Edit Form */}
                        {isAdmin ? (
                            <form onSubmit={handleSaveCourse} className="space-y-4 bg-[#b0b0b0] p-4 border-2 border-[#555555]">
                                <div className="flex items-center space-x-2 mb-4">
                                    <span className="text-3xl">✍️</span>
                                    <h3 className="text-xl font-bold text-minecraft-dark retro-shadow">Quest Editor (Book & Quill)</h3>
                                </div>
                                <div>
                                    <label className="block text-xl text-minecraft-dark mb-1 ml-1">Quest Title</label>
                                    <input type="text" value={course.title} onChange={e => setCourse({ ...course, title: e.target.value })} className="w-full mc-input" required />
                                </div>
                                <div>
                                    <label className="block text-xl text-minecraft-dark mb-1 ml-1">Description (Lore)</label>
                                    <textarea value={course.description} onChange={e => setCourse({ ...course, description: e.target.value })} className="w-full mc-input" rows="3" />
                                </div>
                                <div>
                                    <label className="block text-xl text-minecraft-dark mb-1 ml-1">Cover Image Texture (URL)</label>
                                    <input type="text" value={course.imageUrl} onChange={e => setCourse({ ...course, imageUrl: e.target.value })} className="w-full mc-input" />
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" className="mc-btn-stone px-6 py-2 text-xl">Save Changes</button>
                                </div>
                            </form>
                        ) : (
                            // Student View of Details (Lore)
                            <div className="bg-[#b0b0b0] p-4 border-2 border-[#555555]">
                                <h3 className="text-xl retro-shadow mb-2 underline">Quest Details</h3>
                                <p className="text-lg">{course.description}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lesson List (Objectives) */}
                {!isNew && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-[#C6C6C6] p-2 border-2 border-white border-b-[#555555] border-r-[#555555]">
                            <h2 className="text-2xl text-minecraft-dark retro-shadow px-2">Quest Objectives (Stages)</h2>
                            {isAdmin && (
                                <button onClick={() => setIsAddingLesson(!isAddingLesson)} className="mc-btn-stone px-4 py-2 text-sm">
                                    + Add Stage
                                </button>
                            )}
                        </div>

                        {/* Admin Add Lesson Form */}
                        {isAdmin && isAddingLesson && (
                            <div className="mc-card bg-[#C6C6C6] animate-slide-down">
                                <h3 className="text-xl retro-shadow mb-4">New Objective</h3>
                                <form onSubmit={handleCreateLesson} className="space-y-4">
                                    <input type="text" placeholder="Stage Title" value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })} className="w-full mc-input" required />
                                    <textarea placeholder="Stage Content (Markdown)" value={newLesson.content} onChange={e => setNewLesson({ ...newLesson, content: e.target.value })} className="w-full mc-input" rows="4"></textarea>
                                    <input type="text" placeholder="Video URL" value={newLesson.videoUrl} onChange={e => setNewLesson({ ...newLesson, videoUrl: e.target.value })} className="w-full mc-input" />
                                    <div className="flex space-x-2 pt-2">
                                        <button type="submit" className="mc-btn-stone px-4 py-2 text-green-200">Confirm</button>
                                        <button type="button" onClick={() => setIsAddingLesson(false)} className="mc-btn-stone px-4 py-2 text-red-200">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* List */}
                        <div className="mc-card bg-[#C6C6C6] p-0 overflow-hidden">
                            {lessons.length === 0 ? (
                                <div className="p-8 text-center text-gray-600 font-bold">No objectives revealed yet.</div>
                            ) : (
                                <div>
                                    {/* XP Bar */}
                                    {!isAdmin && (
                                        <div className="p-4 bg-[#b0b0b0] border-b-2 border-[#555555]">
                                            <div className="flex justify-between text-minecraft-dark mb-1 font-bold">
                                                <span>Experience Level</span>
                                                <span>{Math.round((lessons.filter(l => l.isCompleted).length / lessons.length) * 100)}%</span>
                                            </div>
                                            <div className="h-4 w-full bg-[#373737] border-2 border-white border-r-[#373737] border-b-[#373737] relative">
                                                <div
                                                    className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-1000 ease-out"
                                                    style={{ width: `${(lessons.filter(l => l.isCompleted).length / lessons.length) * 100}%` }}
                                                ></div>
                                                {/* XP Markers */}
                                                <div className="absolute inset-0 flex justify-between px-1">
                                                    {[...Array(10)].map((_, i) => <div key={i} className="w-[2px] h-full bg-[#ffffff] opacity-20"></div>)}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="divide-y-2 divide-[#555555]">
                                        {lessons.map((lesson, index) => (
                                            <div
                                                key={lesson.id}
                                                className={`p-4 transition-colors flex justify-between items-center group cursor-pointer ${lesson.isCompleted ? 'bg-green-800/20 hover:bg-green-800/30' : 'hover:bg-[#d1d1d1]'
                                                    }`}
                                                onClick={() => !isAdmin && navigate(`/lessons/${lesson.id}`)}
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className={`mc-slot shrink-0 ${lesson.isCompleted ? 'border-green-400 bg-green-700' : ''}`}>
                                                        {lesson.isCompleted ? (
                                                            <span className="text-xl font-bold text-white drop-shadow-md">💎</span>
                                                        ) : (
                                                            <span className="text-xl font-bold text-white drop-shadow-md">{index + 1}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className={`text-xl retro-shadow group-hover:underline decoration-2 ${lesson.isCompleted ? 'text-green-800' : 'text-minecraft-dark'}`}>
                                                            {lesson.title}
                                                        </h4>
                                                        {lesson.isCompleted && <span className="text-xs text-green-700 font-bold uppercase tracking-widest">[Completed]</span>}
                                                    </div>
                                                </div>

                                                {isAdmin ? (
                                                    <div className="flex items-center space-x-2">
                                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson.id); }} className="mc-btn-stone px-3 py-1 text-red-400 text-sm">
                                                            X
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => navigate(`/lessons/${lesson.id}`)} className={`mc-btn-stone px-4 py-2 text-sm ${lesson.isCompleted ? 'bg-green-700 text-green-100' : ''}`}>
                                                        {lesson.isCompleted ? 'Revisit' : 'Start'}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
