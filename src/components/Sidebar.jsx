import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { LogOut, User, Users, Compass, Home, Mail, Feather, MessageCircle, Settings } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Badge from './ui/badge';
import { useChat } from '../context/ChatContext';
import { usePreferences } from '../context/PreferencesContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useChat();
  const { prefs } = usePreferences();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Messages', path: '/messages', icon: MessageCircle, badge: prefs.notifyMessages ? unreadCount : 0 },
    { name: 'People', path: '/users', icon: Users },
    { name: 'Requests', path: '/requests', icon: Mail },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Profile', path: `/users/${user?.id}`, icon: User },
  ];

  const mobileNavItems = [
    navItems[0],
    navItems[1],
    navItems[2],
    navItems[5],
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col h-screen sticky top-0 px-4 py-6 w-full max-w-[275px]">
        <Link to="/" className="flex items-center gap-3 px-2 mb-8 hover:opacity-80 transition-opacity">
          <img src="/src/assets/Tlogo.svg" alt="T Social" className="h-10 w-10" />
          <span className="font-bold text-2xl tracking-tight hidden lg:block">T Social</span>
        </Link>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-full text-lg transition-all duration-200 ${
                  isActive
                    ? 'font-bold bg-secondary text-secondary-foreground'
                    : 'font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`
              }
            >
              <item.icon className="h-6 w-6" strokeWidth={2.5} />
              <span className="hidden lg:block flex-1">{item.name}</span>
              {item.badge > 0 && (
                <Badge variant="destructive" className="hidden lg:inline-flex min-w-[1.25rem] h-5 px-1.5">
                  {item.badge}
                </Badge>
              )}
            </NavLink>
          ))}
          <Button size="lg" className="w-full mt-6 rounded-full hidden lg:flex font-bold text-lg">
            Post
          </Button>
          <Button size="icon" className="mt-6 rounded-full lg:hidden h-12 w-12 mx-auto flex shadow-md">
            <Feather className="h-5 w-5" />
          </Button>
        </nav>

        <div className="flex items-center gap-1 px-2 mb-2">
          <ThemeToggle />
          <span className="text-sm text-muted-foreground hidden lg:block">Theme</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full h-16 rounded-full flex justify-start items-center gap-3 px-2 hover:bg-secondary/50 mt-auto">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.profilePicture} alt={user?.name} />
                <AvatarFallback>{user?.name?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-col items-start hidden lg:flex text-left flex-1 overflow-hidden">
                <span className="text-sm font-bold truncate w-full">{user?.name}</span>
                <span className="text-sm text-muted-foreground truncate w-full">@{user?.username}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mb-2" align="center" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">@{user?.username}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer font-medium">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-md z-50 flex items-center justify-around h-16 px-1">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `relative flex p-3 rounded-full transition-colors ${
                isActive ? 'text-foreground' : 'text-muted-foreground hover:bg-secondary'
              }`
            }
          >
            <item.icon className="h-6 w-6" strokeWidth={2.5} />
            {item.badge > 0 && (
              <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-like text-[10px] text-white font-bold flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
        <ThemeToggle className="h-10 w-10" />
        <Link to={`/users/${user?.id}`} className="p-3">
          <Avatar className="h-7 w-7 border">
            <AvatarImage src={user?.profilePicture} alt={user?.name} />
            <AvatarFallback className="text-[10px]">{user?.name?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
      </nav>
    </>
  );
}
