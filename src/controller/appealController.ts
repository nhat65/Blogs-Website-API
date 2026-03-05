import { getUserByAppealId, getUserIdByAccountId } from '../repository/userRepository';
import { AuthRequest } from '../middleware/identify';
import { Request, Response } from 'express';
import { AppealTypes } from '../constant/enum';
import { getPostByAppealId, getPostById } from '../repository/postRepository';
import {
  getAllAppeal,
  getUserAppealbyUserId,
  insertPostAppeal,
  rejectAppealById,
  resolveAppealById,
} from '../repository/appealRepository';
import { sendEmail } from '../utils/mailer';

export const sendPostAppeal = async (req: AuthRequest, res: Response) => {
  const { postId, reason, message } = req.body as {
    postId: number;
    reason: string;
    message: string;
  };
  const accountId = req.user?.accountId;
  try {
    const userId = await getUserIdByAccountId(accountId);
    if (!userId) {
      res.status(404).json({
        status: false,
        message: 'User not found.',
      });
      return;
    }

    const post = await getPostById(postId);
    if (!post) {
      res.status(404).json({
        status: false,
        message: 'Post not found.',
      });
      return;
    }

    const appealPayload = {
      type: AppealTypes.POST,
      userId,
      postId,
      reason,
      message,
    };
    const result = await insertPostAppeal(appealPayload);
    if (!result) {
      res.status(400).json({
        status: false,
        message: 'Appeal failed.',
      });
      return;
    }

    res.status(201).json({
      status: true,
      message: 'Send appeal for post successfully.',
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: '[User][AppealUnlock] Request failed!',
    });
  }
};

export const getUserAppeal = async (req: AuthRequest, res: Response) => {
  const accountId = req.user?.accountId;
  try {
    const userId = await getUserIdByAccountId(accountId);
    if (!userId) {
      res.status(404).json({
        status: false,
        message: 'User not found.',
      });
      return;
    }

    const result = await getUserAppealbyUserId(userId);
    if (!result) {
      res.status(204).json({
        status: true,
        message: 'There is no appeal.',
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: 'Get appeal successfully.',
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: '[Appeal][GetUser] Request failed!',
    });
  }
};

export const getAppeals = async (req: Request, res: Response) => {
  try {
    const result = await getAllAppeal();
    if (!result) {
      res.status(204).json({
        status: true,
        message: 'There is no appeal.',
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: 'Get all appeal successfully.',
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: '[Appeal][GetAll] Request failed!',
    });
  }
};

export const rejectAppeal = async (req: AuthRequest, res: Response) => {
  const appealId = parseInt(req.params.appealId);
  const accountId = req.user?.accountId;
  try {
    const adminUserId = await getUserIdByAccountId(accountId);
    if (!adminUserId) {
      res.status(404).json({
        status: false,
        message: 'Admin user id not found!',
      });
      return;
    }

    const result = await rejectAppealById(appealId, adminUserId);
    if (!result) {
      res.status(400).json({
        status: false,
        message: 'Reject appeal failed!',
      });
      return;
    }

    const user = await getUserByAppealId(appealId);
    if (!user) {
      res.status(404).json({
        status: false,
        message: 'User not found!',
      });
      return;
    }

    const userPost = await getPostByAppealId(appealId);
    if (!userPost) {
      res.status(404).json({
        status: false,
        message: 'Post not found!',
      });
      return;
    }
    sendEmail(
      user?.email,
      'Phản hồi về khiếu nại bài viết bị ẩn',
      `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <p><strong>Kính gửi ${user.full_name},</strong></p>

      <p>
        Cảm ơn bạn đã liên hệ với chúng tôi và gửi khiếu nại liên quan đến bài viết
        "<em>${userPost.title}</em>" đã bị ẩn trên nền tảng blog của chúng tôi.
      </p>

      <p>
        Sau khi xem xét kỹ lưỡng đơn khiếu nại của bạn cũng như quá trình xử lý báo cáo từ người dùng khác,
        chúng tôi xác nhận rằng bài viết đã bị ẩn theo đúng <strong>quy trình đánh giá nội dung vi phạm của hệ thống</strong>.
      </p>

      <p>
        Cụ thể, bài viết của bạn đã bị nhiều người dùng báo cáo, và sau khi kiểm duyệt,
        đội ngũ quản trị viên xác định nội dung có dấu hiệu vi phạm
        <strong>chính sách cộng đồng</strong> mà bạn đã đồng ý khi sử dụng dịch vụ.
      </p>

      <p>
        Chúng tôi hiểu việc bài viết bị ẩn có thể gây ảnh hưởng đến trải nghiệm của bạn,
        tuy nhiên quyết định này được đưa ra nhằm đảm bảo môi trường blog lành mạnh,
        tích cực và tuân thủ đúng các quy định đã đề ra.
      </p>

      <p>
        Vì vậy, chúng tôi rất tiếc <strong>không thể chấp nhận yêu cầu khôi phục bài viết</strong> như bạn đã đề nghị.
      </p>

      <p>
        Nếu bạn cần thêm thông tin về nguyên nhân cụ thể hoặc mong muốn điều chỉnh nội dung để phù hợp với chính sách và đăng lại,
        đội ngũ chúng tôi sẵn sàng hỗ trợ.
      </p>

      <p>
        Cảm ơn bạn đã thấu hiểu và đồng hành cùng nền tảng.
      </p>

      <br>

      <p>
        <strong>Trân trọng,</strong><br>
        Bộ phận Hỗ trợ Người dùng<br>
        <strong>BLOGS</strong>
      </p>
    </div>
  `,
    );

    res.status(200).json({
      status: true,
      message: 'Reject appeal successfully.',
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: '[Appeal][Reject] Request failed!',
    });
  }
};

export const resolveAppeal = async (req: AuthRequest, res: Response) => {
  const appealId = parseInt(req.params.appealId);
  const accountId = req.user?.accountId;
  try {
    const userId = await getUserIdByAccountId(accountId);
    if (!userId) {
      res.status(404).json({
        status: false,
        message: 'User not found.',
      });
      return;
    }

    const result = await resolveAppealById(appealId, userId);
    if (!result) {
      res.status(400).json({
        status: false,
        message: 'Reject appeal failed!',
      });
      return;
    }

    const user = await getUserByAppealId(appealId);
    if (!user) {
      res.status(404).json({
        status: false,
        message: 'User not found!',
      });
      return;
    }

    const userPost = await getPostByAppealId(appealId);
    if (!userPost) {
      res.status(404).json({
        status: false,
        message: 'Post not found!',
      });
      return;
    }
    sendEmail(
      user?.email,
      'Kết quả xử lý khiếu nại bài viết',
      `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <p><strong>Kính gửi ${user.full_name},</strong></p>

      <p>
        Cảm ơn bạn đã gửi khiếu nại liên quan đến bài viết
        "<em>${userPost.title}</em>" trên nền tảng blog của chúng tôi.
      </p>

      <p>
        Sau khi tiếp nhận và tiến hành rà soát kỹ lưỡng nội dung bài viết cũng như các báo cáo liên quan,
        chúng tôi nhận thấy rằng <strong>khiếu nại của bạn là hợp lý</strong>.
      </p>

      <p>
        Do đó, chúng tôi đã <strong>mở lại bài viết</strong> của bạn và đảm bảo rằng nội dung sẽ tiếp tục được hiển thị bình thường trên nền tảng.
      </p>

      <p>
        Chúng tôi xin lỗi vì sự bất tiện mà việc ẩn bài viết có thể đã gây ra. 
        Đồng thời, chúng tôi luôn nỗ lực để đảm bảo công bằng và minh bạch trong quá trình kiểm duyệt nội dung.
      </p>

      <p>
        Nếu bạn có bất kỳ câu hỏi hoặc cần hỗ trợ thêm, đừng ngần ngại liên hệ với chúng tôi.
      </p>

      <p>
        Cảm ơn bạn đã kiên nhẫn và đồng hành cùng chúng tôi để xây dựng một cộng đồng blog tích cực và tôn trọng lẫn nhau.
      </p>

      <br>

      <p>
        <strong>Trân trọng,</strong><br>
        Bộ phận Hỗ trợ Người dùng<br>
        <strong>BLOGS</strong>
      </p>
    </div>
  `,
    );

    res.status(200).json({
      status: true,
      message: 'Reject appeal successfully.',
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: '[Appeal][Reject] Request failed!',
    });
  }
};
