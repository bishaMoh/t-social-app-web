import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { follows } from '../api/client';

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadRequests() {
    setLoading(true);
    setError('');
    try {
      const data = await follows.pending();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleAccept(followId) {
    try {
      await follows.accept(followId);
      await loadRequests();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReject(followId) {
    try {
      await follows.reject(followId);
      await loadRequests();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="page">
      <section className="panel">
        <h1>Follow requests</h1>
        <p className="muted">People who want to follow you.</p>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="user-list">
        {loading && <p className="muted">Loading…</p>}
        {!loading && requests.length === 0 && (
          <div className="empty">No pending requests.</div>
        )}
        {requests.map((request) => (
          <article key={request.id} className="user-row">
            <Link to={`/users/${request.follower.id}`} className="author">
              {request.follower.profilePicture ? (
                <img src={request.follower.profilePicture} alt="" className="avatar" />
              ) : (
                <div className="avatar avatar-fallback">{request.follower.name?.[0] || '?'}</div>
              )}
              <div>
                <strong>{request.follower.name}</strong>
                <span>@{request.follower.username}</span>
              </div>
            </Link>
            <div className="follow-actions">
              <button type="button" className="btn btn-primary btn-sm" onClick={() => handleAccept(request.id)}>
                Accept
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleReject(request.id)}>
                Reject
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
