import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Read blog data seeded from static constants on first run
// We load the static data lazily using require to avoid module-level path issues
function getStaticBlogPosts() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require('../../../../constants').blogPosts || [];
    } catch {
        return [];
    }
}


const DATA_FILE = path.join(process.cwd(), 'data', 'blog_posts.json');

function ensureDataDir() {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function readPosts(): any[] {
    ensureDataDir();
    if (!fs.existsSync(DATA_FILE)) {
        // Seed from static constants on first run
        const staticBlogPosts = getStaticBlogPosts();
        const seeded = staticBlogPosts.map((p: any) => ({
            slug: p.slug,
            title: p.title,
            date: p.date,
            excerpt: p.excerpt,
            coverImage: p.coverImage || '',
            category: p.category || 'General',
            author: p.author || 'PDFBullet Team',
            content: p.content || '',
            published: true,
        }));
        fs.writeFileSync(DATA_FILE, JSON.stringify(seeded, null, 2), 'utf-8');
        return seeded;
    }
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch {
        return [];
    }
}


function writePosts(posts: any[]) {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), 'utf-8');
}

function slugify(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// GET /api/blogs - get all or single post by ?slug=
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get('slug');
        const posts = readPosts();
        if (slug) {
            const post = posts.find((p) => p.slug === slug);
            if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
            return NextResponse.json(post);
        }
        // Return all posts sorted newest first, without heavy content field unless ?full=1
        const full = searchParams.get('full') === '1';
        const result = posts
            .filter((p) => !searchParams.get('publishedOnly') || p.published)
            .map((p) => full ? p : { ...p, content: undefined });
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/blogs - create new post
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const posts = readPosts();
        
        const slug = body.slug || slugify(body.title);
        if (posts.find((p) => p.slug === slug)) {
            return NextResponse.json({ error: `Slug "${slug}" already exists` }, { status: 409 });
        }

        const newPost = {
            slug,
            title: body.title || 'Untitled Post',
            date: body.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            excerpt: body.excerpt || '',
            coverImage: body.coverImage || '',
            category: body.category || 'General',
            author: body.author || 'PDFBullet Team',
            content: body.content || '',
            published: body.published !== undefined ? body.published : true,
            createdAt: new Date().toISOString(),
        };

        posts.unshift(newPost);
        writePosts(posts);
        return NextResponse.json({ success: true, post: newPost }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/blogs - update existing post by slug
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { slug, ...updates } = body;
        if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

        const posts = readPosts();
        const idx = posts.findIndex((p) => p.slug === slug);
        if (idx === -1) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

        posts[idx] = { ...posts[idx], ...updates, slug, updatedAt: new Date().toISOString() };
        writePosts(posts);
        return NextResponse.json({ success: true, post: posts[idx] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/blogs - delete by slug
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get('slug');
        if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

        const posts = readPosts();
        const newPosts = posts.filter((p) => p.slug !== slug);
        if (newPosts.length === posts.length) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }
        writePosts(newPosts);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
