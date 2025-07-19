import client from '../../api/client';

export type User = {
  id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
  email?: string;
  coverPhoto?: string;
  bio?: string;
  verified?: boolean;
};

export type Post = {
  id: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
  user: User;
  likedBy?: string[];
  shareCount?: number;
  comments?: PostComment[];
};

export type PostComment = {
  id: string;
  userId: string;
  username: string;
  profilePicture?: string;
  text: string;
  createdAt: string;
};

export async function getPosts() {
  const res = await client.get('/posts');
  return res.data as Post[];
}

export async function createPost(post: { content?: string; imageUrl?: string; videoUrl?: string }, userId: string) {
  const res = await client.post(`/posts`, post, { params: { userId } });
  return res.data;
}

export async function deletePost(postId: string, userId: string) {
  return client.delete(`/posts/${postId}?userId=${userId}`);
}

export async function getPost(postId: string) {
  const res = await client.get(`/posts/${postId}`);
  return res.data as Post;
}

export async function fetchPostComments(postId: string) {
  const res = await client.get(`/posts/${postId}/comments`);
  return res.data as PostComment[];
}

export const likePost = async (postId: string, userId: string) => {
  const res = await client.post(`/posts/${postId}/like?userId=${userId}`);
  return res.data;
};

export const unlikePost = async (postId: string, userId: string) => {
  const res = await client.post(`/posts/${postId}/unlike?userId=${userId}`);
  return res.data;
};

export const addComment = async (postId: string, userId: string, text: string) => {
  const res = await client.post(`/posts/${postId}/comment?userId=${userId}`, text, {
    headers: { "Content-Type": "text/plain" }
  });
  return res.data;
};

export async function sharePost(postId: string) {
  const res = await client.post(`/posts/${postId}/share`);
  return res.data;
}