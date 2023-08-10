import Like from "../models/like.model.js";
import redisClient from "../utils/redis.js";

export const storeLike = async (user_id, content_id) => {
  // Check if user has already liked the content
  const liked = await checkLike(user_id, content_id);
  if (liked) {
    console.log(`User ${user_id} already liked content ${content_id}`);
    return;
  }

  // Store the like event in the database
  const LikeEvent = new Like({ user_id, content_id });
  await LikeEvent.save();
  console.log(`User ${user_id} liked content ${content_id}`);

  // Increment the like count for the content
  const contentLikeCountKey = `content_likes:${content_id}`;
  await redisClient.incr(contentLikeCountKey);

  // Increment the like count for the user
  const likeCountKey = `likes:${user_id}`;
  await redisClient.incr(likeCountKey);

  // Check if the user reached 100 likes
  const currentLikeCount = await redisClient.get(likeCountKey);
  if (currentLikeCount === "100") {
    console.log(`User ${user_id} liked 100 Contents`);
  }

  // Check if the content reached 100 likes
  const currentContentLikeCount = await redisClient.get(contentLikeCountKey);
  if (currentContentLikeCount === "100") {
    console.log(`Content ${content_id} reached 100 likes`);
  }

  console.log({ currentLikeCount, currentContentLikeCount });
};

export const checkLike = async (user_id, content_id) => {
  // Check if the user has liked the content in the database
  const check = await Like.findOne({ user_id, content_id });

  if (check) {
    return true;
  }

  return false;
};

export const getLikeCount = async (content_id) => {
  // Get the total likes count for a content from the database
  const likeCount = await Like.countDocuments({ content_id });

  return likeCount || 0;
};

