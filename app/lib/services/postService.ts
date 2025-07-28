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
  likeCount?: number;
  commentCount?: number;
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

export const getPosts = async (): Promise<Post[]> => {
  const res = await client.get('/posts');
  return res.data;
};

export const createPost = async (post: { content?: string; imageUrl?: string; videoUrl?: string }, userId: string) => {
  const res = await client.post(`/posts?userId=${userId}`, post);
  return res.data;
};

export const deletePost = async (postId: string, userId: string) => {
  const res = await client.delete(`/posts/${postId}?userId=${userId}`);
  return res.data;
};

export const likePost = async (postId: string, userId: string) => {
  const res = await client.post(`/posts/${postId}/like?userId=${userId}`);
  return res.data;
};

export const unlikePost = async (postId: string, userId: string) => {
  const res = await client.post(`/posts/${postId}/unlike?userId=${userId}`);
  return res.data;
};

export const addComment = async (postId: string, userId: string, text: string) => {
  const res = await client.post(`/posts/${postId}/comment?userId=${userId}`, text);
  return res.data;
};

export const getComments = async (postId: string): Promise<PostComment[]> => {
  const res = await client.get(`/posts/${postId}/comments`);
  return res.data;
};