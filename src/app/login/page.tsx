"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const { user, loginWithGoogle, loginWithPin, logout } = useAuth();
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginWithPin(pin)) {
      router.push("/");
    } else {
      setError("Incorrect PIN. Default is 1234");
    }
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
    router.push("/");
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 text-3xl mb-3">
          ♾️
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Infinite Login
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Simplified Co-operative Accounting · Secure Access
        </p>
      </div>

      {user.isLoggedIn ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-3">
          <div className="text-4xl">{user.avatar}</div>
          <div>
            <p className="font-black text-gray-900 text-base">{user.name}</p>
            <p className="text-xs text-emerald-800 font-semibold">{user.role}</p>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{user.email}</p>
          </div>
          <div className="flex gap-2 pt-2">
            <Link
              href="/"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-xs transition-colors"
            >
              Go to Dashboard →
            </Link>
            <button
              onClick={logout}
              className="px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 rounded-lg text-xs transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Option 1: 1-Click Google Sign-In */}
          <div>
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 text-gray-800 font-bold py-3 px-4 rounded-xl shadow-sm transition-all text-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google (Dad&apos;s Account)</span>
            </button>
            <p className="text-[11px] text-center text-gray-400 mt-1.5">
              Instant 1-click access without typing passwords
            </p>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase font-semibold">Or Quick PIN</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Option 2: 4-Digit Quick PIN */}
          <form onSubmit={handlePinSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Enter 4-Digit Quick PIN
              </label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError("");
                }}
                placeholder="••••"
                className="w-full text-center tracking-widest text-2xl font-black py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:ring-0"
              />
            </div>

            {error && <p className="text-xs text-red-600 font-bold text-center">{error}</p>}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm transition-colors"
            >
              Sign In with PIN
            </button>
            <p className="text-[10px] text-gray-400 text-center">
              (Default demo PIN: <strong>1234</strong>)
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
