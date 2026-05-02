import { JobsOptions } from "bullmq";
import { emailQueue } from "../queues/email.queue.js";

/**
 * 📧 Email Job Data Type
 */
interface EmailJobData {
  to: string;
  subject: string;
  template: string;
  payload: Record<string, unknown>;
}

/**
 * 📧 Send Email Job
 */
export const addEmailJob = async (data: EmailJobData): Promise<void> => {
  const jobOptions: JobsOptions = {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  };

  await emailQueue.add(
    "send-email",
    {
      to: data.to,
      subject: data.subject,
      template: data.template,
      payload: data.payload,
    },
    jobOptions
  );
};