import axios from "axios";
const BASE_URL = "http://10.132.74.85:8080/api/posts";

export const createPost = async (data: any) => {
  const { userId, ...postData } = data;
  const res = await axios.post(`${BASE_URL}?userId=${userId}`, postData);
  return res.data;
};

export const getPosts = async () => {
  const res = await axios.get(BASE_URL);
  return res.data;
};

export const likePost = async (postId: number, userId: number) => {
  const res = await axios.post(`${BASE_URL}/${postId}/like?userId=${userId}`);
  return res.data;
};

export const unlikePost = async (postId: number, userId: number) => {
  const res = await axios.post(`${BASE_URL}/${postId}/unlike?userId=${userId}`);
  return res.data;
};

export const addComment = async (postId: number, userId: number, text: string) => {
  const res = await axios.post(`${BASE_URL}/${postId}/comment?userId=${userId}`, text, {
    headers: { "Content-Type": "text/plain" }
  });
  return res.data;
};