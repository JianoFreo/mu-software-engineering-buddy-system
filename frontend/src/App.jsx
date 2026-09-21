import { useEffect, useState, useCallback } from 'react';
import NewPostForm from './components/NewPostForm.jsx';
import PostCard from './components/PostCard.jsx';
import Toolbar from './components/Toolbar.jsx';
import Pagination from './components/Pagination.jsx';
import * as api from './api/forum.js';

export default function App() {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.fetchPosts({ page, limit: 10, sort, search });
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message || 'Could not load posts. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [sort, search]);

  useEffect(() => {
    const t = setTimeout(() => load(1), search ? 300 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, search]);

  async function handleCreate({ title, content }) {
    await api.createPost({ title, content });
    load(1);
  }

  function handlePostChange(updated) {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  function handlePostRemove(id) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setPagination((prev) => ({ ...prev, total: Math.max(prev.total - 1, 0) }));
  }

  return (
    <div className="min-h-screen bg-ink font-body">
      <header className="border-b border-line/40">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="font-display text-3xl font-bold text-[#ece7de] tracking-tight">
            unsigned<span className="text-accent">.</span>
          </h1>
          <p className="text-sm text-muted mt-1">
            A board for thoughts without names attached. Post, reply, vote — no account needed.
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-16">
        <div className="pt-6">
          <NewPostForm onCreate={handleCreate} />
        </div>

        <Toolbar search={search} onSearchChange={setSearch} sort={sort} onSortChange={setSort} />

        {error && (
          <p className="text-sm text-[#ff8a6b] py-6 text-center">{error}</p>
        )}

        {loading && !error && (
          <p className="text-sm text-muted py-10 text-center">Loading threads…</p>
        )}

        {!loading && !error && posts.length === 0 && (
          <p className="text-sm text-muted py-10 text-center">
            {search ? 'No threads match your search.' : 'No threads yet. Start one above.'}
          </p>
        )}

        {!loading && !error && posts.length > 0 && (
          <div>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onChange={handlePostChange}
                onRemove={handlePostRemove}
              />
            ))}
          </div>
        )}

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={load}
        />
      </main>
    </div>
  );
}
