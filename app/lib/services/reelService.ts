import client from '../../api/client';

export type Reel = {
  id: string;
  userId: string;
  username: string;
  profilePicture?: string;
  mediaUrl: string;
  caption?: string;
  createdAt: string;
  likedBy?: string[];
  shareCount?: number;
  comments?: ReelComment[];
};

export type ReelComment = {
  id: string;
  userId: string;
  username: string;
  profilePicture?: string;
  text: string;
  createdAt: string;
};

export async function fetchReels() {
  const res = await client.get('/reels');
  return res.data as Reel[];
}

export async function createReel(reel: { mediaUrl: string; caption?: string }, userId: string) {
  const res = await client.post(`/reels/create`, { ...reel, userId });
  return res.data;
}

export async function deleteReel(reelId: string, userId: string) {
  return client.delete(`/reels/${reelId}?userId=${userId}`);
}

export async function likeReel(reelId: string, userId: string) {
  const res = await client.post(`/reels/${reelId}/like?userId=${userId}`);
  return res.data;
}

export async function unlikeReel(reelId: string, userId: string) {
  const res = await client.post(`/reels/${reelId}/unlike?userId=${userId}`);
  return res.data;
}

export async function addReelComment(reelId: string, userId: string, content: string) {
  const res = await client.post(`/reels/${reelId}/comment?userId=${userId}`, content, {
    headers: { 'Content-Type': 'text/plain' }
  });
  return res.data;
}

export async function shareReel(reelId: string) {
  const res = await client.post(`/reels/${reelId}/share`);
  return res.data;
}

export async function fetchReelComments(reelId: string) {
  const res = await client.get(`/reels/${reelId}/comments`);
  return res.data as ReelComment[];
} 