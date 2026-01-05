import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonService } from '../services';

export default function LessonViewer() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [completed, setCompleted] = useState(false);

    const [siblings, setSiblings] = useState([]);

    const fetchLessonAndSiblings = async () => {
        try {
            // 1. Fetch current lesson
            const data = await lessonService.getById(id);
            setLesson(data);
            if (data.isCompleted) setCompleted(true);

            // 2. Fetch all lessons for course to determine order
            const allLessons = await lessonService.getByCourseId(data.courseId);
            const sorted = allLessons.sort((a, b) => a.order - b.order);
            setSiblings(sorted);

        } catch (err) {
            console.error(err);
            setError("Failed to load lesson.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLessonAndSiblings();
    }, [id]);

    const handleComplete = async () => {
        try {
            await lessonService.complete(id);
            setCompleted(true);

            // Refetch to update progress bar and siblings IsCompleted status
            await fetchLessonAndSiblings();

            // Play Minecraft XP Sound
            const xpSound = new Audio('/sounds/orb.mp3');
            xpSound.volume = 0.5;
            xpSound.play().catch(e => console.warn("Audio play failed:", e));

        } catch (err) {
            console.error(err);
        }
    };

    // Navigation Helpers
    const currentIndex = siblings.findIndex(l => l.id === id);
    const prevLesson = currentIndex > 0 ? siblings[currentIndex - 1] : null;
    const nextLesson = currentIndex !== -1 && currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-2xl text-minecraft-dark animate-pulse retro-shadow">Loading Chunk Data...</div>
        </div>
    );

    if (error || !lesson) return (
        <div className="p-8 text-center text-red-100 bg-red-900 border-2 border-red-500 m-8 mc-card">
            {error || "Lesson not found in this chunk"}
        </div>
    );

    return (
        <div className="min-h-screen font-minecraft">
            {/* Top Bar */}
            <div className="bg-[#C6C6C6] border-b-4 border-b-[#555555] px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-md">
                <button onClick={() => navigate(`/courses/${lesson.courseId}`)} className="mc-btn-stone px-4 py-2 flex items-center">
                    &larr; Return to Quest
                </button>
                <div className="flex items-center space-x-3">
                    <span className="text-3xl animate-pulse">✨</span>
                    <h1 className="text-2xl text-purple-900 retro-shadow truncate max-w-xl font-bold tracking-wider" style={{ textShadow: '2px 2px 0px #ffffff' }}>
                        {lesson.title}
                    </h1>
                    <span className="text-3xl animate-pulse animation-delay-2000">✨</span>
                </div>
                {/* Spacer or Mini-XP Bar? */}
                <div className="w-24 text-right cursor-default" title="Your progress in this quest">
                    {siblings.length > 0 && (
                        <div className="text-xs font-bold mb-1 text-minecraft-dark">
                            Lv {Math.round((siblings.filter(l => l.isCompleted).length / siblings.length) * 100)}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 space-y-8">
                {/* Video Section (Painting Frame) */}
                {lesson.videoUrl && (
                    <div className="bg-[#3a200d] p-2 border-4 border-[#7ea6e0] shadow-xl relative">
                        {/* Painting Inner Frame */}
                        <div className="bg-black aspect-video relative overflow-hidden">
                            <iframe
                                src={lesson.videoUrl.replace('watch?v=', 'embed/')}
                                className="w-full h-full"
                                frameBorder="0"
                                allowFullScreen
                                title="Lesson Video"
                            ></iframe>
                        </div>
                    </div>
                )}

                {/* Content Section (Book Page) */}
                <div className="mc-card bg-[#e3dac9] border-4 border-[#8b4513] text-gray-900 p-8 shadow-sm">
                    <h3 className="text-2xl mb-4 border-b-2 border-[#8b4513] pb-2 font-bold text-[#5c2e0e]">Written Book</h3>
                    {lesson.content ? (
                        <div className="text-xl leading-relaxed font-minecraft text-[#3e2723]" dangerouslySetInnerHTML={{ __html: lesson.content.replace(/\n/g, '<br/>') }} />
                    ) : (
                        <p className="text-gray-600 italic">This page is intentionally left blank.</p>
                    )}
                </div>

                {/* Navigation & Action Bar */}
                <div className="flex flex-col md:flex-row justify-center items-center gap-6 pb-10">
                    {/* Previous Button */}
                    <button
                        onClick={() => prevLesson && navigate(`/lessons/${prevLesson.id}`)}
                        disabled={!prevLesson}
                        className={`mc-btn-stone px-6 py-3 text-lg flex items-center ${!prevLesson ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        &larr; Prev Page
                    </button>

                    {/* Complete Button */}
                    {completed ? (
                        <button disabled className="px-8 py-4 bg-green-700/80 text-green-100 border-2 border-green-400 font-bold flex items-center cursor-default retro-shadow transform scale-110">
                            <span className="mr-2 text-2xl">✓</span>
                            Objective Completed
                        </button>
                    ) : (
                        <button
                            onClick={handleComplete}
                            className="mc-btn-stone px-8 py-4 text-2xl transform hover:scale-105 transition-transform"
                        >
                            Complete Objective
                        </button>
                    )}

                    {/* Next Button */}
                    <button
                        onClick={() => nextLesson && navigate(`/lessons/${nextLesson.id}`)}
                        disabled={!nextLesson}
                        className={`mc-btn-stone px-6 py-3 text-lg flex items-center ${!nextLesson ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Next Page &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
}
