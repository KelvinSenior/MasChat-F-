import client, { BASE_URL } from '../../api/client';

export const createPost = async (data: any, userId: string|number) => {
  const res = await client.post(
    `/posts?userId=${userId}`,
    data,
    { headers: { 'Content-Type': 'application/json' } }
  );
  return res.data;
};

export const getPosts = async () => {
  const res = await client.get('/posts');
  return res.data;
};

export const likePost = async (postId: number, userId: number) => {
  const res = await client.post(`/posts/${postId}/like?userId=${userId}`);
  return res.data;
};

export const unlikePost = async (postId: number, userId: number) => {
  const res = await client.post(`/posts/${postId}/unlike?userId=${userId}`);
  return res.data;
};

export const addComment = async (postId: number, userId: number, text: string) => {
  const res = await client.post(`/posts/${postId}/comment?userId=${userId}`, text, {
    headers: { "Content-Type": "text/plain" }
  });
  return res.data;
};