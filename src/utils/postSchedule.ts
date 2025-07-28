import cron from 'node-cron';
import { getAllPostSchedule, updatePostSchedule } from '../repository/postRepository';
import { CRON_CONFIG } from '../constant/cron';

export const schedulePostPublication = () => {
  cron.schedule(CRON_CONFIG.POST_SCHEDULE, async () => {
    const currentDate = new Date();
    try {
      const posts = await getAllPostSchedule();

      if (posts) {
        for (const post of posts) {
          const postId = post as number;
          const success = await updatePostSchedule(postId);
        }
      }
    } catch (error) {}
  });
};
