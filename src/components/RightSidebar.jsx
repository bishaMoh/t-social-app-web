import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { tees, users } from '../api/client';
import { usePreferences } from '../context/PreferencesContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

function extractTrends(items) {
  const counts = {};
  for (const tee of items) {
    const tags = tee.text.match(/#[\w]+/g) || [];
    for (const tag of tags) {
      counts[tag] = (counts[tag] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([tag, count]) => ({ tag, count }));
}

export default function RightSidebar() {
  const { prefs } = usePreferences();
  const [suggestions, setSuggestions] = useState([]);
  const [published, setPublished] = useState([]);

  useEffect(() => {
    users.suggestions().then(setSuggestions).catch(() => setSuggestions([]));
    tees.published().then(setPublished).catch(() => setPublished([]));
  }, []);

  const trends = useMemo(() => extractTrends(published), [published]);

  return (
    <aside className="hidden lg:block sticky top-0 h-screen py-6 pl-8 pr-4 overflow-y-auto">
      <div className="relative mb-4">
        <input
          type="search"
          placeholder="Search T Social"
          className="w-full rounded-full border bg-secondary/40 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30"
        />
      </div>

      {prefs.showTrending && trends.length > 0 && (
        <div className="bg-secondary/30 rounded-2xl p-4 mb-4 border">
          <h2 className="font-bold text-xl mb-4">Trending for you</h2>
          <div className="space-y-4">
            {trends.map(({ tag, count }) => (
              <div key={tag}>
                <p className="text-xs text-muted-foreground">Trending</p>
                <p className="font-bold text-sm">{tag}</p>
                <p className="text-xs text-muted-foreground">{count} tees</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="bg-secondary/30 rounded-2xl p-4 mb-4 border">
          <h2 className="font-bold text-xl mb-4">Who to follow</h2>
          <div className="space-y-4">
            {suggestions.map((person) => (
              <div key={person.id} className="flex items-center gap-3">
                <Link to={`/users/${person.id}`}>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={person.profilePicture} alt={person.name} />
                    <AvatarFallback>{person.name?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/users/${person.id}`} className="font-semibold text-sm hover:underline truncate block">
                    {person.name}
                  </Link>
                  <p className="text-xs text-muted-foreground truncate">@{person.username}</p>
                </div>
                <Link to={`/users/${person.id}`}>
                  <Button size="sm" className="rounded-full text-xs px-3">View</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link
        to="/settings"
        className="block rounded-2xl border p-4 mb-4 hover:bg-secondary/30 transition-colors"
      >
        <p className="font-semibold text-sm">Personalize your experience</p>
        <p className="text-xs text-muted-foreground mt-1">Feed mode, interests, and display options</p>
      </Link>

      <div className="text-xs text-muted-foreground flex flex-wrap gap-2 px-2">
        <a href="#" className="hover:underline">Terms of Service</a>
        <a href="#" className="hover:underline">Privacy Policy</a>
        <span>© 2026 T Social.</span>
      </div>
    </aside>
  );
}
