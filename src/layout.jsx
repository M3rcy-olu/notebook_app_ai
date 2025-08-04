import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Layout({ children, currentPageName }) {
  const [isDark, setIsDark] = useState(false);

  // Load theme preference on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem('notability-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme ? savedTheme === 'dark' : prefersDark;
    setIsDark(initialTheme);
  }, []);
  
  // Apply theme class to HTML element when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('notability-theme', newTheme ? 'dark' : 'light');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-green-50 to-stone-50'
    }`}>
      <style>{`
        :root {
          /* Light Theme Colors */
          --primary-green: #065f46;
          --secondary-green: #16a34a;
          --accent-green: #22c55e;
          --light-green: #f0fdf4;
          --bg-primary: #ffffff;
          --bg-secondary: #f8fafc;
          --text-primary: #1f2937;
          --text-secondary: #6b7280;
          --border-color: #e5e7eb;
          --glass-bg: rgba(255, 255, 255, 0.85);
          --shadow-color: rgba(9, 9, 11, 0.06);
        }
        
        .dark {
          /* Dark Theme Colors */
          --primary-green: #059669;
          --secondary-green: #10b981;
          --accent-green: #34d399;
          --light-green: #064e3b;
          --bg-primary: #0f172a;
          --bg-secondary: #1e293b;
          --text-primary: #f8fafc;
          --text-secondary: #cbd5e1;
          --border-color: #334155;
          --glass-bg: rgba(30, 41, 59, 0.8);
          --shadow-color: rgba(0, 0, 0, 0.3);
        }
        
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          touch-action: manipulation;
          color: var(--text-primary);
          background-color: var(--bg-secondary);
        }
        
        .glass-effect {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-color);
          transition: background 0.3s, border-color 0.3s;
        }
        
        .floating-element {
          box-shadow: 0 8px 32px var(--shadow-color);
          transform: translateZ(0);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .floating-element:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px var(--shadow-color);
        }
        
        .smooth-transition {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .earthy-green-gradient {
          background: linear-gradient(135deg, var(--primary-green), var(--secondary-green));
        }
        
        .light-green-bg {
          background-color: var(--light-green);
        }
        
        @media (max-width: 768px) {
          .mobile-optimize {
            padding: 1rem;
          }
        }
      `}</style>
      
      <main className="relative w-full h-screen overflow-hidden">
        {children}
      </main>
    </div>
  );
}