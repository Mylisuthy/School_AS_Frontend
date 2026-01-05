import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import LessonViewer from './pages/LessonViewer';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/courses"
            element={
              <PrivateRoute>
                <CourseList />
              </PrivateRoute>
            }
          />
          <Route
            path="/courses/:id"
            element={
              <PrivateRoute>
                <CourseDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/lessons/:id"
            element={
              <PrivateRoute>
                <LessonViewer />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
