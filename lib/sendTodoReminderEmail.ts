import nodemailer from "nodemailer";

type SendTodoReminderEmailInput = {
  to: string;
  userName?: string;
  todoTitle: string;
  dueDate: string;
  carName?: string;
  reminderLabel: string;
  todoUrl?: string;
};

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function getTransporter() {
  const host = getRequiredEnv("SMTP_HOST");
  const port = Number(process.env.SMTP_PORT || "587");
  const user = getRequiredEnv("SMTP_USER");
  const pass = getRequiredEnv("SMTP_PASS");

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendTodoReminderEmail({
  to,
  userName,
  todoTitle,
  dueDate,
  carName,
  reminderLabel,
  todoUrl,
}: SendTodoReminderEmailInput) {
  const transporter = getTransporter();
  const from = getRequiredEnv("SMTP_FROM");
  const formattedDueDate = new Date(dueDate).toLocaleString("sl-SI");
  const greetingName = userName?.trim() || "there";
  const vehicleLine = carName ? `Vehicle: ${carName}` : undefined;
  const linkLine = todoUrl ? `Open to-do: ${todoUrl}` : undefined;

  const text = [
    `Hello ${greetingName},`,
    "",
    `This is a reminder for your to-do \"${todoTitle}\".`,
    `Reminder: ${reminderLabel}`,
    `Due date: ${formattedDueDate}`,
    vehicleLine,
    linkLine,
    "",
    "Do not forget to review it in CarLog.",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
      <p>Hello ${greetingName},</p>
      <p>This is a reminder for your to-do <strong>${todoTitle}</strong>.</p>
      <ul>
        <li><strong>Reminder:</strong> ${reminderLabel}</li>
        <li><strong>Due date:</strong> ${formattedDueDate}</li>
        ${carName ? `<li><strong>Vehicle:</strong> ${carName}</li>` : ""}
      </ul>
      ${todoUrl ? `<p><a href="${todoUrl}">Open to-do in CarLog</a></p>` : ""}
      <p>Do not forget to review it in CarLog.</p>
    </div>
  `;

  await transporter.sendMail({
    from,
    to,
    subject: `CarLog reminder: ${todoTitle}`,
    text,
    html,
  });
}
