"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface UserProfile {
  name: string;
  email: string;
  role: "Dad (Chief Accountant & Admin)" | "Brother (Ops & Collections)" | "Guest";
  avatar: string;
  isLoggedIn: boolean;
}

const DAD_PROFILE: UserProfile = {
  name: "Dad (Admin)",
  email: "dad.infinitechs@gmail.com",
  role: "Dad (Chief Accountant & Admin)",
  avatar: "👨‍💼",
  isLoggedIn: true,
};

const GUEST_PROFILE: UserProfile = {
  name: "Guest",
  email: "",
  role: "Guest",
  avatar: "👤",
  isLoggedIn: false,
};

interface AuthContextType {
  user: UserProfile;
  loginWithGoogle: () => void;
  loginWithPin: (pin: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: DAD_PROFILE,
  loginWithGoogle: () => {},
  loginWithPin: () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DAD_PROFILE);

  useEffect(() => {
    const saved = localStorage.getItem("infinite_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const loginWithGoogle = () => {
    // In production, triggers Google OAuth 2.0 flow
    const googleUser: UserProfile = {
      name: "Dad (Admin)",
      email: "dad.infinitechs@gmail.com",
      role: "Dad (Chief Accountant & Admin)",
      avatar: "👨‍💼",
      isLoggedIn: true,
    };
    setUser(googleUser);
    localStorage.setItem("infinite_user", JSON.stringify(googleUser));
  };

  const loginWithPin = (pin: string) => {
    // Quick 4-digit PIN for Dad
    if (pin === "1234" || pin === "9999") {
      setUser(DAD_PROFILE);
      localStorage.setItem("infinite_user", JSON.stringify(DAD_PROFILE));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(GUEST_PROFILE);
    localStorage.removeItem("infinite_user");
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, loginWithPin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
