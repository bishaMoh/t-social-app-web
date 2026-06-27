import { useState } from 'react';
import { Link } from 'react-router-dom';
import { tees } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Heart, MessageSquare, Trash2 } from 'lucide-react';

export default function TeeCard({ tee, onUpdate, variant = 'feed', compact = false }) {
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

  const containerClass = variant === 'grid' 
    ? "w-full flex gap-3 p-4 border rounded-2xl bg-card hover:border-border/80 transition-colors shadow-sm break-inside-avoid"
    : compact
      ? "w-full flex gap-3 px-4 py-2 border-b hover:bg-secondary/20 transition-colors last:border-b-0"
      : "w-full flex gap-3 px-4 py-3 border-b hover:bg-secondary/20 transition-colors last:border-b-0";

  return (
    <article className={containerClass}>
      <Link to={`/users/${author?.id}`} className="flex-shrink-0 h-10">
        <Avatar className="h-10 w-10">
          <AvatarImage src={author?.profilePicture} alt={author?.name} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold">
            {author?.name?.[0]?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <Link to={`/users/${author?.id}`} className="flex items-center gap-1.5 min-w-0 flex-1 hover:underline group">
            <span className="font-bold truncate text-sm">{author?.name}</span>
            <span className="text-muted-foreground text-sm truncate group-hover:no-underline">@{author?.username}</span>
          </Link>
          <time className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(tee.createdAt).toLocaleString(undefined, {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </time>
        </div>

        <p className="text-[15px] leading-snug whitespace-pre-wrap break-words">{tee.text}</p>
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}

        <div className="flex items-center gap-6 mt-3 -ml-2 text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1.5 h-8 px-2 rounded-full hover:bg-like/10 hover:text-like ${likedByMe ? 'text-like' : ''}`}
            onClick={handleLike}
            disabled={busy}
          >
            <Heart className={`h-[18px] w-[18px] ${likedByMe ? 'fill-current text-like' : ''}`} />
            <span className="text-xs">{likeCount > 0 ? likeCount : ''}</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="gap-1.5 h-8 px-2 rounded-full hover:bg-secondary hover:text-foreground" onClick={loadComments}>
            <MessageSquare className="h-[18px] w-[18px]" />
            <span className="text-xs">{tee._count?.comments > 0 ? tee._count.comments : (comments.length > 0 ? comments.length : '')}</span>
          </Button>

          {isOwner && (
            <Button variant="ghost" size="sm" className="ml-auto h-8 px-2 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleDeleteTee} disabled={busy}>
              <Trash2 className="h-[18px] w-[18px]" />
            </Button>
          )}
        </div>

        {showComments && (
          <div className="w-full mt-3 flex flex-col gap-3">
            <Separator className="bg-border/50" />
            <form onSubmit={handleComment} className="flex items-center gap-2 mt-1">
              <Avatar className="h-6 w-6">
                <AvatarImage src={user?.profilePicture} alt={user?.name} />
                <AvatarFallback className="text-[10px]">{user?.name?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Post your reply…"
                disabled={busy}
                className="h-8 text-sm rounded-full border-none bg-secondary/50 focus-visible:ring-1"
              />
              <Button type="submit" size="sm" disabled={busy} className="h-8 rounded-full px-4 font-semibold">
                Reply
              </Button>
            </form>
            
            <div className="flex flex-col gap-3 mt-2">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2 group/comment">
                  <Avatar className="h-6 w-6 mt-1 flex-shrink-0">
                    <AvatarImage src={comment.user?.profilePicture} alt={comment.user?.name} />
                    <AvatarFallback className="text-[10px]">
                      {comment.user?.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-1.5 min-w-0">
                        <span className="font-semibold text-sm truncate">{comment.user?.name}</span>
                        <span className="text-xs text-muted-foreground truncate">@{comment.user?.username}</span>
                      </div>
                      {user?.id === comment.userId && (
                        <button
                          type="button"
                          className="text-xs text-muted-foreground opacity-0 group-hover/comment:opacity-100 hover:text-destructive transition-all"
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={busy}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[14px] leading-snug">{comment.text}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <p className="text-sm text-center text-muted-foreground py-2">No replies yet.</p>}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
