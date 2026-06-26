import { useState } from 'react';
import { Link } from 'react-router-dom';
import { tees } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function TeeCard({ tee, onUpdate }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(tee.comments || []);
  const [commentText, setCommentText] = useState('');
  const [likedByMe, setLikedByMe] = useState(tee.likedByMe ?? false);
  const [likeCount, setLikeCount] = useState(tee._count?.likes ?? 0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const author = tee.user;
  const isOwner = user?.id === author?.id;

  async function handleLike() {
    setBusy(true);
    setError('');
    try {
      const result = await tees.like(tee.id);
      setLikedByMe(result.liked);
      setLikeCount((count) => count + (result.liked ? 1 : -1));
      onUpdate?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function loadComments() {
    if (comments.length > 0 || showComments) {
      setShowComments((open) => !open);
      return;
    }
    try {
      const data = await tees.comments(tee.id);
      setComments(data);
      setShowComments(true);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;

    setBusy(true);
    setError('');
    try {
      const comment = await tees.addComment(tee.id, commentText.trim());
      setComments((prev) => [comment, ...prev]);
      setCommentText('');
      setShowComments(true);
      onUpdate?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteComment(commentId) {
    setBusy(true);
    try {
      await tees.deleteComment(tee.id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      onUpdate?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteTee() {
    if (!window.confirm('Delete this tee?')) return;
    setBusy(true);
    try {
      await tees.remove(tee.id);
      onUpdate?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="tee-card">
      <div className="tee-header">
        <Link to={`/users/${author?.id}`} className="author">
          {author?.profilePicture ? (
            <img src={author.profilePicture} alt="" className="avatar" />
          ) : (
            <div className="avatar avatar-fallback">{author?.name?.[0] || '?'}</div>
          )}
          <div>
            <strong>{author?.name}</strong>
            <span>@{author?.username}</span>
          </div>
        </Link>
        <time>{new Date(tee.createdAt).toLocaleString()}</time>
      </div>

      <p className="tee-text">{tee.text}</p>

      <div className="tee-actions">
        <button
          type="button"
          className={`btn btn-ghost ${likedByMe ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={busy}
        >
          {likedByMe ? '♥' : '♡'} {likeCount}
        </button>
        <button type="button" className="btn btn-ghost" onClick={loadComments}>
          💬 {tee._count?.comments ?? comments.length}
        </button>
        {isOwner && (
          <button type="button" className="btn btn-danger btn-sm" onClick={handleDeleteTee} disabled={busy}>
            Delete
          </button>
        )}
      </div>

      {showComments && (
        <div className="comments">
          <form onSubmit={handleComment} className="comment-form">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment…"
              disabled={busy}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
              Post
            </button>
          </form>
          <ul>
            {comments.map((comment) => (
              <li key={comment.id}>
                <div>
                  <strong>{comment.user?.name}</strong>
                  <span>@{comment.user?.username}</span>
                  <p>{comment.text}</p>
                </div>
                {user?.id === comment.userId && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
            {comments.length === 0 && <li className="muted">No comments yet.</li>}
          </ul>
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </article>
  );
}
