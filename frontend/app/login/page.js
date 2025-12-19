"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, googleLogin } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError("Failed to log in. Please check your credentials.");
      console.error(err);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await googleLogin();
      router.push("/");
    } catch (err) {
      setError("Failed to sign in with Google.");
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Inventory Login</h1>
        <p>Please enter your credentials to continue</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="login-button">Sign In</button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button onClick={handleGoogleLogin} className="google-button">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
          Sign in with Google
        </button>
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          font-family: 'Inter', sans-serif;
        }
        .login-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          padding: 2.5rem;
          border-radius: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          width: 100%;
          max-width: 400px;
          color: white;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        h1 {
          margin-top: 0;
          margin-bottom: 0.5rem;
          font-size: 1.875rem;
          font-weight: 700;
          text-align: center;
        }
        p {
          color: #94a3b8;
          text-align: center;
          margin-bottom: 2rem;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #e2e8f0;
          font-size: 0.875rem;
          font-weight: 500;
        }
        input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          color: white;
          font-size: 1rem;
          transition: all 0.2s;
        }
        input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
        }
        .login-button {
          width: 100%;
          padding: 0.75rem;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 0.75rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 1rem;
        }
        .login-button:hover {
          background: #1d4ed8;
        }
        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 1.5rem 0;
          color: #64748b;
          font-size: 0.75rem;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .divider span {
          margin: 0 0.75rem;
        }
        .google-button {
          width: 100%;
          padding: 0.75rem;
          background: white;
          color: #1f2937;
          border: none;
          border-radius: 0.75rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }
        .google-button:hover {
          background: #f3f4f6;
        }
        .google-button img {
          width: 18px;
          height: 18px;
        }
        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #f87171;
          padding: 0.75rem;
          border-radius: 0.75rem;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
