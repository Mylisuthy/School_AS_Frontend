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

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                const data = await lessonService.getById(id);
                setLesson(data);
                if (data.isCompleted) setCompleted(true);
            } catch (err) {
                console.error(err);
                setError("Failed to load lesson.");
            } finally {
                setLoading(false);
            }
        };
        fetchLesson();
    }, [id]);

    const handleComplete = async () => {
        try {
            await lessonService.complete(id);
            setCompleted(true);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (error || !lesson) return (
        <div className="p-8 text-center text-red-600">{error || "Lesson not found"}</div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <button onClick={() => navigate(`/courses/${lesson.courseId}`)} className="text-gray-600 hover:text-indigo-600 font-medium flex items-center">
                    &larr; Back to Course
                </button>
                <h1 className="text-lg font-bold text-gray-900 truncate max-w-xl">{lesson.title}</h1>
                <div className="w-24"></div> {/* Spacer */}
            </div>

            <div className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 space-y-8">
                {/* Video Section */}
                {lesson.videoUrl && (
                    <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                        <iframe
                            src={lesson.videoUrl.replace('watch?v=', 'embed/')}
                            className="w-full h-full"
                            frameBorder="0"
                            allowFullScreen
                            title="Lesson Video"
                        ></iframe>
                    </div>
                )}

                {/* Content Section */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 prose max-w-none">
                    {lesson.content ? (
                        <div dangerouslySetInnerHTML={{ __html: lesson.content.replace(/\n/g, '<br/>') }} />
                    ) : (
                        <p className="text-gray-500 italic">No text content provided for this lesson.</p>
                    )}
                </div>

                {/* Action Bar */}
                <div className="flex justify-center pb-10">
                    {completed ? (
                        <button disabled className="px-8 py-3 bg-green-100 text-green-700 rounded-xl font-bold flex items-center cursor-default">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            Completed
                        </button>
                    ) : (
                        <button
                            onClick={handleComplete}
                            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all"
                        >
                            Mark as Complete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
