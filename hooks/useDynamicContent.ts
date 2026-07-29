import { useState, useEffect } from 'react';
import { blogPosts as staticBlogPosts } from '../constants.ts';

export interface DynamicBlogPost {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    content?: string;
    coverImage?: string;
    image?: string;       // legacy compat alias for coverImage
    authorImage?: string; // legacy static field
    category?: string;
    author?: string;
    published?: boolean;
    tags?: string[];
    readTime?: string;
}

// Merges dynamic API posts with static fallback data
function mergeWithStatic(apiPosts: DynamicBlogPost[]): DynamicBlogPost[] {
    return apiPosts.map(post => {
        // Find matching static post for backward-compat fields (tags, image, readTime)
        const staticMatch = (staticBlogPosts as any[]).find(s => s.slug === post.slug);
        return {
            ...staticMatch, // static fields first (has tags, image, readTime, etc.)
            ...post,        // API data overrides (title, date, excerpt, content, coverImage)
            image: post.coverImage || staticMatch?.image || '',
            tags: staticMatch?.tags || [post.category || 'General'],
        };
    });
}

// ─── useDynamicBlogs ────────────────────────────────────────────────────────
// Fetches blog list from /api/blogs. Falls back to static constants on error.
export function useDynamicBlogs() {
    const [posts, setPosts] = useState<DynamicBlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetch('/api/blogs')
            .then(async (r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then((data: DynamicBlogPost[]) => {
                if (cancelled) return;
                if (Array.isArray(data) && data.length > 0) {
                    const published = data.filter(p => p.published !== false);
                    setPosts(mergeWithStatic(published.length > 0 ? published : (staticBlogPosts as any[])));
                } else {
                    setPosts(staticBlogPosts as any[]);
                }
            })
            .catch(() => {
                if (cancelled) return;
                // Graceful fallback — use static constants
                setError('Using cached data');
                setPosts(staticBlogPosts as any[]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, []);

    return { posts, loading, error };
}

// ─── useDynamicBlogPost ─────────────────────────────────────────────────────
// Fetches a single blog post by slug from /api/blogs. Falls back to static.
export function useDynamicBlogPost(slug: string | undefined) {
    const [post, setPost] = useState<DynamicBlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) { setLoading(false); return; }
        let cancelled = false;
        fetch(`/api/blogs?slug=${encodeURIComponent(slug)}&full=1`)
            .then(async (r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then((data: DynamicBlogPost) => {
                if (cancelled) return;
                const staticMatch = (staticBlogPosts as any[]).find(s => s.slug === slug);
                if (data && (data.slug || data.title)) {
                    setPost({
                        ...staticMatch,
                        ...data,
                        image: data.coverImage || staticMatch?.image || '',
                        tags: staticMatch?.tags || [data.category || 'General'],
                    });
                } else if (staticMatch) {
                    setPost(staticMatch);
                } else {
                    setPost(null);
                }
            })
            .catch(() => {
                if (cancelled) return;
                // Fallback to static
                const staticPost = (staticBlogPosts as any[]).find(s => s.slug === slug);
                setPost(staticPost || null);
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [slug]);

    return { post, loading };
}

// ─── useSiteContent ─────────────────────────────────────────────────────────
// Fetches dynamic homepage section content from /api/site-content.
export function useSiteContent() {
    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        fetch('/api/site-content')
            .then(r => r.json())
            .then(data => { if (!cancelled) setContent(data); })
            .catch(() => {}) // Fail silently — components use their hardcoded defaults
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    return { content, loading };
}
