const BASE = '/api';

async function handle(res) {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function fetchPosts({ page = 1, limit = 10, sort = 'newest', search = '' } = {}) {
  const params = new URLSearchParams({ page, limit, sort });
  if (search) params.set('search', search);
  const res = await fetch(`${BASE}/posts?${params.toString()}`);
  return handle(res);
}

export async function fetchPost(id) {
  const res = await fetch(`${BASE}/posts/${id}`);
  return handle(res);
}

export async function createPost({ title, content }) {
  const res = await fetch(`${BASE}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content }),
  });
  return handle(res);
}

export async function updatePostTitle(id, title) {
  const res = await fetch(`${BASE}/posts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  return handle(res);
}

export async function deletePost(id) {
  const res = await fetch(`${BASE}/posts/${id}`, { method: 'DELETE' });
  return handle(res);
}

export async function votePost(id, direction) {
  const res = await fetch(`${BASE}/posts/${id}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ direction }),
  });
  return handle(res);
}

export async function fetchComments(postId) {
  const res = await fetch(`${BASE}/posts/${postId}/comments`);
  return handle(res);
}

export async function createComment(postId, content) {
  const res = await fetch(`${BASE}/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  return handle(res);
}

export async function voteComment(id, direction) {
  const res = await fetch(`${BASE}/comments/${id}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ direction }),
  });
  return handle(res);
}
