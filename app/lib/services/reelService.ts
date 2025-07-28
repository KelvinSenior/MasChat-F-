import client from '../../api/client';
import { User } from './postService';

export type Reel = {
  id: string;
  userId: string;
  username: string;
  profilePicture?: string;
  mediaUrl: string;
  videoUrl: string;
  caption?: string;
  createdAt: string;
  likedBy?: string[];
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
};

export type ReelComment = {
  id: string;
  userId: string;
  username: string;
  profilePicture?: string;
  text: string;
  createdAt: string;
};

export const fetchReels = async (): Promise<Reel[]> => {
  const res = await client.get('/reels');
  return res.data;
};

export const createReel = async (reel: { mediaUrl: string; caption?: string }, userId: string) => {
  const res = await client.post(`/reels/create`, { ...reel, userId });
  return res.data;
};

export const deleteReel = async (reelId: string, userId: string) => {
  const res = await client.delete(`/reels/${reelId}?userId=${userId}`);
  return res.data;
};

export const likeReel = async (reelId: string, userId: string) => {
  const res = await client.post(`/reels/${reelId}/like?userId=${userId}`);
  return res.data;
};

export const unlikeReel = async (reelId: string, userId: string) => {
  const res = await client.post(`/reels/${reelId}/unlike?userId=${userId}`);
  return res.data;
};

export const addReelComment = async (reelId: string, userId: string, text: string) => {
  const res = await client.post(`/reels/${reelId}/comment?userId=${userId}`, text);
  return res.data;
};

export const getReelComments = async (reelId: string): Promise<ReelComment[]> => {
  const res = await client.get(`/reels/${reelId}/comments`);
  return res.data;
};

export const shareReel = async (reelId: string) => {
  const res = await client.post(`/reels/${reelId}/share`);
  return res.data;
}; 