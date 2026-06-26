import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { follows, users } from '../api/client';
import { useAuth } from '../context/AuthContext';

function FollowButton({ user, onChange }) {
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
    <div className="follow-actions">
      <button
        type="button"
        className={`btn btn-sm ${status === 'following' ? 'btn-ghost' : 'btn-primary'}`}
        onClick={handleFollow}
        disabled={busy || status === 'pending'}
      >
        {label}
      </button>
      {error && <span className="error inline">{error}</span>}
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
    <main className="page">
      <section className="panel">
        <h1>People</h1>
        <p className="muted">Find people to follow.</p>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="user-list">
        {loading && <p className="muted">Loading…</p>}
        {people.map((person) => (
          <article key={person.id} className="user-row">
            <Link to={`/users/${person.id}`} className="author">
              {person.profilePicture ? (
                <img src={person.profilePicture} alt="" className="avatar" />
              ) : (
                <div className="avatar avatar-fallback">{person.name?.[0] || '?'}</div>
              )}
              <div>
                <strong>{person.name}</strong>
                <span>@{person.username}</span>
                {person.bio && <p className="bio">{person.bio}</p>}
                <p className="muted stats">
                  {person.followerCount} followers · {person.followingCount} following
                </p>
              </div>
            </Link>
            <FollowButton user={person} onChange={loadUsers} />
          </article>
        ))}
      </section>
    </main>
  );
}
