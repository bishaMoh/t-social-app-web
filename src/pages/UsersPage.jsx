import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { follows, users } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from '../components/ui/card';
import PageHeader from '../components/PageHeader';

function FollowButton({ user, onChange, fullWidth }) {
  const { user: me } = useAuth();
  const [status, setStatus] = useState(user.followStatus);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (me?.id === user.id) return null;

  async function handleFollow() {
    setBusy(true);
    setError('');
    try {
      if (status === 'following') {
        await follows.unfollow(user.id);
        setStatus('none');
      } else if (status === 'none') {
        await follows.send(user.id);
        setStatus('pending');
      }
      onChange?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const label =
    status === 'following' ? 'Following' : status === 'pending' ? 'Pending' : 'Follow';

  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? 'w-full' : ''}`}>
      <Button
        variant={status === 'following' ? 'secondary' : 'default'}
        size="sm"
        onClick={(e) => { e.preventDefault(); handleFollow(); }}
        disabled={busy || status === 'pending'}
        className={`font-semibold rounded-full ${fullWidth ? 'w-full' : 'min-w-[90px]'}`}
      >
        {label}
      </Button>
      {error && <span className="text-xs text-destructive text-center">{error}</span>}
    </div>
  );
}

export default function UsersPage() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      const data = await users.list();
      setPeople(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="People" subtitle="Discover and connect with others" />

      <div className="p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight">Who to follow</h2>
          <p className="text-muted-foreground mt-1 text-sm">Discover and connect with others.</p>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </div>

        {loading && <p className="text-muted-foreground text-center py-8">Loading…</p>}
        {!loading && people.length === 0 && (
          <div className="text-center py-12 border border-dashed rounded-lg text-muted-foreground bg-muted/20">
            No people found.
          </div>
        )}
        {!loading && people.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {people.map((person) => (
              <Link key={person.id} to={`/users/${person.id}`} className="block group">
                <Card className="h-full hover:border-border/80 transition-colors">
                  <CardHeader className="flex flex-col items-center text-center gap-2 pb-2">
                    <Avatar className="h-20 w-20 shadow-sm border-2 border-background">
                      <AvatarImage src={person.profilePicture} alt={person.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                        {person.name?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col w-full">
                      <span className="font-bold text-lg truncate group-hover:underline">{person.name}</span>
                      <span className="text-sm text-muted-foreground truncate">@{person.username}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="text-center pb-2">
                    {person.bio && <p className="text-sm line-clamp-2 text-foreground/80">{person.bio}</p>}
                    <p className="text-xs text-muted-foreground mt-2">
                      <span className="font-semibold text-foreground">{person.followerCount}</span> followers
                    </p>
                  </CardContent>
                  <CardFooter>
                    <FollowButton user={person} onChange={loadUsers} fullWidth />
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
