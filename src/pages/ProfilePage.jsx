import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { follows, users } from '../api/client';
import { useAuth } from '../context/AuthContext';
import TeeCard from '../components/TeeCard';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: me, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', bio: '', profilePicture: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
  }, [id]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await users.updateMe(form);
      await refreshUser();
      await loadProfile();
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

  if (loading) return <main className="page"><p className="muted">Loading profile…</p></main>;
  if (!profile) return <main className="page"><p className="error">{error || 'User not found'}</p></main>;

  return (
    <main className="page">
      <section className="panel profile-header">
        <div className="profile-top">
          {profile.profilePicture ? (
            <img src={profile.profilePicture} alt="" className="avatar avatar-lg" />
          ) : (
            <div className="avatar avatar-lg avatar-fallback">{profile.name?.[0] || '?'}</div>
          )}
          <div>
            <h1>{profile.name}</h1>
            <p className="muted">@{profile.username}</p>
            {profile.bio && <p>{profile.bio}</p>}
            <p className="muted stats">
              {profile.followerCount} followers · {profile.followingCount} following
            </p>
          </div>
        </div>

        {!isOwnProfile && profile.followStatus !== 'pending' && (
          <button type="button" className="btn btn-primary" onClick={handleFollowAction}>
            {profile.followStatus === 'following' ? 'Unfollow' : 'Follow'}
          </button>
        )}
        {!isOwnProfile && profile.followStatus === 'pending' && (
          <span className="badge">Follow request pending</span>
        )}

        {isOwnProfile && (
          <form onSubmit={handleSave} className="profile-form stack">
            <h2>Edit profile</h2>
            <label>
              Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              Bio
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
              />
            </label>
            <label>
              Profile picture URL
              <input
                value={form.profilePicture}
                onChange={(e) => setForm({ ...form, profilePicture: e.target.value })}
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        )}

        {error && <p className="error">{error}</p>}
      </section>

      <section>
        <h2 className="section-title">{isOwnProfile ? 'Your tees' : `${profile.name}'s tees`}</h2>
        <div className="stack">
          {profile.tees?.length === 0 && <div className="empty">No published tees yet.</div>}
          {profile.tees?.map((tee) => (
            <TeeCard key={tee.id} tee={{ ...tee, user: profile }} onUpdate={loadProfile} />
          ))}
        </div>
      </section>

      {isOwnProfile && (
        <p className="muted footer-link">
          <Link to="/">Back to feed</Link>
        </p>
      )}
    </main>
  );
}
