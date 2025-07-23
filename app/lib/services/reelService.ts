

export async function getReel(reelId: string) {
  const res = await client.get(`/reels/${reelId}`);
  const data = res.data;
  if (!data.id) throw new Error('Reel missing id');
  return {
    ...data,
    id: String(data.id),
    videoUrl: data.videoUrl || (data.mediaUrl && data.mediaUrl.endsWith('.mp4') ? data.mediaUrl : undefined),
    imageUrl: data.imageUrl || (data.mediaUrl && !data.mediaUrl.endsWith('.mp4') ? data.mediaUrl : undefined),
  };
}
import client from '../../api/client';

export type Reel = {
  id: string; // always string, never undefined/null
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
  id: string; // always string, never undefined/null
  userId: string;
  username: string;
  profilePicture?: string;
  text: string;
  createdAt: string;
};

export async function fetchReels() {
  const res = await client.get('/reels');
  return (res.data as Reel[])
    .filter(data => data.id !== undefined && data.id !== null && data.id !== '')
    .map(data => ({
      ...data,
      id: String(data.id),
      videoUrl: (data as any).videoUrl || (data.mediaUrl && data.mediaUrl.endsWith('.mp4') ? data.mediaUrl : undefined),
      imageUrl: (data as any).imageUrl || (data.mediaUrl && !data.mediaUrl.endsWith('.mp4') ? data.mediaUrl : undefined),
    })) as (Reel & { videoUrl?: string; imageUrl?: string })[];
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

// Default export to fix warning
export default {
  fetchReels,
  createReel,
  deleteReel,
  likeReel,
  unlikeReel,
  addReelComment,
  shareReel,
  fetchReelComments
  ,getReel
}; 