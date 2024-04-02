import './App.css';
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from 'pages/dashboard';
import PostEdit, { PostCreate } from 'pages/PostEdit';
import CommentEdit, { CommentCreate } from 'pages/CommentEdit';
import Login from 'pages/login';
import Register from 'pages/register';
import Home from 'pages/home';
import ForgotPassword from 'pages/forgot-password';
import PasswordReset from 'pages/password-reset';
import NotFoundPage from 'pages/404';
import AuthValidationErrors from 'components/AuthValidationErrors';
import AuthSessionStatus from 'components/AuthSessionStatus';
import { ErrorContext } from 'lib/common';

function App() {
  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState([]);
  
  return (
    <div className="antialiased">
      <AuthSessionStatus className="mb-4" status={status} />
      <AuthValidationErrors className="mb-4" errors={errors} />
      
      <ErrorContext.Provider value={{ setStatus, setErrors }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/password-reset/:token" element={<PasswordReset />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/posts/create" element={<PostCreate />} />
        <Route path="/posts/:id" element={<PostEdit />} />
        <Route path="/comments/create/:postId" element={<CommentCreate />} />
        <Route path="/comments/:id" element={<CommentEdit />} />
        <Route path="*" element={<NotFoundPage/>}
        />
      </Routes>
      </ErrorContext.Provider>
    </div>
  );
}

export default App;
