
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Star, Send, Loader2, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Project, Comment } from '../types';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      const [projectRes, commentsRes] = await Promise.all([
        supabase.from('projects').select('*').eq('id', id).single(),
        supabase.from('project_comments').select('*').eq('project_id', id).order('created_at', { ascending: false }),
      ]);
      if (projectRes.data) {
        setProject(projectRes.data);
        setLikesCount(projectRes.data.likes_count || 0);
        setAvgRating(projectRes.data.rating || 0);
      }
      if (commentsRes.data) setComments(commentsRes.data);

      if (user) {
        const { data: likeData } = await supabase
          .from('project_likes')
          .select('id')
          .eq('project_id', id)
          .eq('user_id', user.id)
          .maybeSingle();
        setLiked(!!likeData);

        const { data: ratingData } = await supabase
          .from('project_ratings')
          .select('rating')
          .eq('project_id', id)
          .eq('user_id', user.id)
          .maybeSingle();
        if (ratingData) setUserRating(ratingData.rating);
      }
      setLoading(false);
    };
    load();
  }, [id, user]);

  const toggleLike = async () => {
    if (!user || !id) return;
    if (liked) {
      await supabase.from('project_likes').delete().eq('project_id', id).eq('user_id', user.id);
      setLiked(false);
      setLikesCount((c) => c - 1);
    } else {
      await supabase.from('project_likes').insert({ project_id: id, user_id: user.id });
      setLiked(true);
      setLikesCount((c) => c + 1);
    }
  };

  const submitRating = async (rating: number) => {
    if (!user || !id) return;
    setUserRating(rating);
    await supabase.from('project_ratings').upsert(
      { project_id: id, user_id: user.id, rating },
      { onConflict: 'project_id,user_id' }
    );
    // Refresh average rating from DB (trigger updates projects.rating)
    const { data } = await supabase.from('projects').select('rating').eq('id', id).single();
    if (data) setAvgRating(data.rating || 0);
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !commentText.trim()) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from('project_comments')
      .insert({ project_id: id, user_id: user.id, user_name: user.full_name || user.email, content: commentText.trim() })
      .select()
      .single();
    if (!error && data) {
      setComments((prev) => [data, ...prev]);
      setCommentText('');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 font-bold uppercase tracking-widest">Project not found</p>
        <Link to="/projects" className="text-orange-600 font-bold hover:underline">Back to Projects</Link>
      </div>
    );
  }

  const images = project.media?.length ? project.media : ['https://via.placeholder.com/800x450'];

  return (
    <div className="py-12 md:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Enlarged" className="max-w-full max-h-[90vh] rounded-2xl object-contain" />
        </div>
      )}

      {/* Back */}
      <Link to="/projects" className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-600 font-bold text-sm uppercase tracking-widest mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Link>

      {/* Hero Image */}
      <div className="rounded-[2rem] overflow-hidden border border-gray-200 dark:border-gray-800 mb-4">
        <img
          src={images[selectedImage]}
          alt={project.title}
          className="w-full aspect-video object-cover cursor-pointer"
          onClick={() => setLightbox(images[selectedImage])}
        />
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-3 mb-10 overflow-x-auto pb-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImage(i)}
              className={`flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                i === selectedImage ? 'border-orange-600 scale-105' : 'border-gray-200 dark:border-gray-800 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Video */}
      {project.video_url && (
        <div className="mb-10 rounded-[2rem] overflow-hidden border border-gray-200 dark:border-gray-800">
          <video controls className="w-full" src={project.video_url}>
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Project Info */}
      <div className="mb-10 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-3xl md:text-5xl font-black text-black dark:text-white uppercase tracking-tighter">
            {project.title}
          </h1>
          {project.price != null && (
            <span className="px-4 py-1.5 bg-orange-600/10 text-orange-600 font-bold rounded-xl text-sm">
              ${project.price}
            </span>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">{project.description}</p>
        <p className="text-gray-400 dark:text-gray-600 text-sm">
          {new Date(project.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-6 mb-12 pb-8 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={toggleLike}
          disabled={!user}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
            liked
              ? 'bg-red-600/10 text-red-600'
              : 'bg-gray-100 dark:bg-gray-900 text-gray-500 hover:text-red-600'
          } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          {likesCount}
        </button>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              disabled={!user}
              onClick={() => submitRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className={`transition-colors ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Star
                className={`w-6 h-6 ${
                  star <= (hoverRating || userRating)
                    ? 'text-orange-500 fill-current'
                    : 'text-gray-300 dark:text-gray-700'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-500 font-bold">{avgRating} avg</span>
        </div>

        {!user && <span className="text-xs text-gray-400">Log in to like, rate & comment</span>}
      </div>

      {/* Comments */}
      <div>
        <h2 className="text-2xl font-black text-black dark:text-white uppercase tracking-tighter mb-6">
          Comments <span className="text-orange-600">({comments.length})</span>
        </h2>

        {user && (
          <form onSubmit={submitComment} className="flex gap-3 mb-8">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-grow px-5 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-orange-600 transition-colors"
            />
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="px-5 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        )}

        {comments.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No comments yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-black dark:text-white">{c.user_name}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">{c.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
