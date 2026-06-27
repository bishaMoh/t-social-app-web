import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={`rounded-full ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
