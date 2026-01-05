import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/courses');
        } catch (err) {
            const msg = err.formattedMessage || 'Invalid credentials';
            setError(msg);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
            {/* Minecraft Dirt Background Overlay */}
            <div className="absolute inset-0 bg-minecraft-stone opacity-50 z-0"></div>

            <div className="w-full max-w-md mc-card relative z-10 mx-4">
                <div className="text-center mb-6">
                    <h2 className="text-4xl text-minecraft-dark retro-shadow mb-2">Server Login</h2>
                    <p className="text-xl text-gray-700">Enter /credentials to join</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email-address" className="block text-lg text-minecraft-dark mb-1">Username (Email)</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="w-full mc-input"
                                placeholder="steve@minecraft.net"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-lg text-minecraft-dark mb-1">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="w-full mc-input"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-900/80 border-2 border-red-500 text-red-100 p-2 text-center text-lg">
                            <span className="retro-shadow">Error: {error}</span>
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full py-3 px-4 mc-btn-stone text-xl uppercase tracking-widest"
                        >
                            Join Server
                        </button>
                    </div>

                    <div className="text-center text-lg mt-4">
                        <span className="text-gray-700">New player? </span>
                        <Link to="/register" className="text-blue-800 underline hover:text-blue-600 decoration-2">
                            Register Account
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
