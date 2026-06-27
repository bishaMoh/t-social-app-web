import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { follows, users } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import TeeCard from '../components/TeeCard';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { ArrowLeft, MessageCircle } from 'lucide-react';

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: me, refreshUser } = useAuth();
  const { startConversationWith } = useChat();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', bio: '', profilePicture: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editOpen, setEditOpen] = useState(false);

  const isOwnProfile = me && String(me.id) === String(id);

  async function loadProfile() {
    setLoading(true);
    setError('');
    try {
      const data = await users.get(id);
      setProfile(data);
      if (String(me?.id) === String(id)) {
        setForm({
          name: data.name || '',
          bio: data.bio || '',
          profilePicture: data.profilePicture || '',
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, [id, me?.id]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await users.updateMe(form);
      await refreshUser();
      await loadProfile();
      setEditOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleFollowAction() {
    setError('');
    try {
      if (profile.followStatus === 'following') {
        await follows.unfollow(profile.id);
      } else if (profile.followStatus === 'none') {
        await follows.send(profile.id);
      }
      await loadProfile();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleMessage() {
    setError('');
    try {
      await startConversationWith(profile.id);
      navigate('/messages');
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="flex-1 flex justify-center py-12 text-muted-foreground">Loading profile…</div>;
  if (!profile) return <div className="flex-1 flex justify-center py-12 text-destructive">{error || 'User not found'}</div>;

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-2 flex items-center gap-6">
        <Link to="/" className="p-2 rounded-full hover:bg-secondary transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight leading-none">{profile.name}</h1>
          <span className="text-xs text-muted-foreground mt-1">{profile.tees?.length || 0} Tees</span>
        </div>
      </header>

      <div>
        {/* Cover Photo */}
        <div className="h-32 md:h-48 bg-gradient-to-r from-muted to-secondary w-full" />
        
        <div className="px-4 pb-4">
          <div className="flex justify-between items-start">
            {/* Avatar overlapping cover photo */}
            <Avatar className="h-20 w-20 md:h-32 md:w-32 rounded-full border-4 border-background -mt-10 md:-mt-16 bg-background">
              <AvatarImage src={profile.profilePicture} alt={profile.name} />
              <AvatarFallback className="bg-secondary text-foreground font-bold text-3xl md:text-5xl">
                {profile.name?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>

            <div className="pt-3">
              {isOwnProfile ? (
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="rounded-full font-bold">Edit profile</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit profile</DialogTitle>
                      <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="bio">Bio</Label>
                        <textarea
                          id="bio"
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                          value={form.bio}
                          onChange={(e) => setForm({ ...form, bio: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="profilePicture">Profile picture URL</Label>
                        <Input
                          id="profilePicture"
                          value={form.profilePicture}
                          onChange={(e) => setForm({ ...form, profilePicture: e.target.value })}
                        />
                      </div>
                      {error && <p className="text-sm text-destructive">{error}</p>}
                      <DialogFooter>
                        <Button type="submit" disabled={saving}>
                          {saving ? 'Saving…' : 'Save changes'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" className="rounded-full font-bold" onClick={handleMessage}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  {profile.followStatus !== 'pending' && (
                    <Button 
                      variant={profile.followStatus === 'following' ? 'outline' : 'default'}
                      onClick={handleFollowAction}
                      className="rounded-full font-bold"
                    >
                      {profile.followStatus === 'following' ? 'Unfollow' : 'Follow'}
                    </Button>
                  )}
                  {profile.followStatus === 'pending' && (
                    <Button variant="outline" disabled className="rounded-full font-bold text-muted-foreground">
                      Request pending
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3">
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p className="text-muted-foreground">@{profile.username}</p>
          </div>

          {profile.bio && <p className="mt-3 text-[15px] leading-snug">{profile.bio}</p>}

          <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
            <p><span className="font-bold text-foreground">{profile.followingCount}</span> Following</p>
            <p><span className="font-bold text-foreground">{profile.followerCount}</span> Followers</p>
          </div>
        </div>
      </div>

      <div className="border-t">
        <div className="px-4 py-3 border-b">
          <span className="font-bold border-b-2 border-primary pb-3 px-1 inline-block">Tees</span>
        </div>
        
        <div className="flex flex-col">
          {profile.tees?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              @{profile.username} hasn't posted any tees yet.
            </div>
          )}
          {profile.tees?.map((tee) => (
            <TeeCard key={tee.id} tee={{ ...tee, user: profile }} onUpdate={loadProfile} />
          ))}
        </div>
      </div>
    </div>
  );
}
