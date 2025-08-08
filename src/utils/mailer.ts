import transporter from '../config/nodemailer';

export const sendEmail = async (
  to: string | undefined,
  subject: string,
  html: string,
): Promise<void> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.log('Send mail errors: ' + error);
  }
};
