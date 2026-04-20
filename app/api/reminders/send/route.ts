import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/WriteClient";
import { getReminderOffsetMs, reminderOffsetLabel } from "@/lib/todoReminder";
import { sendTodoReminderEmail } from "@/lib/sendTodoReminderEmail";

type ReminderTodo = {
  _id: string;
  title: string;
  dueDate: string;
  reminderOffset?: string;
  reminderLastSentAt?: string;
  userEmail?: string;
  userName?: string;
  carName?: string;
};

function getAppBaseUrl() {
  const explicitUrl = process.env.APP_BASE_URL || process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;

  if (explicitUrl) {
    return explicitUrl.replace(/\/$/, "");
  }

  const vercelUrl = process.env.VERCEL_URL;

  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/$/, "")}`;
  }

  return null;
}

function getCronSecret() {
  return process.env.CRON_SECRET || process.env.REMINDER_CRON_SECRET;
}

function isAuthorized(request: NextRequest) {
  const secret = getCronSecret();

  if (!secret) {
    throw new Error("Missing environment variable: CRON_SECRET or REMINDER_CRON_SECRET");
  }

  const authHeader = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-reminder-secret");

  return authHeader === `Bearer ${secret}` || headerSecret === secret;
}

async function sendReminders() {
  const todos: ReminderTodo[] = await writeClient.fetch(
    `*[_type == "todo" && status == "open" && reminderEnabled == true && defined(dueDate)]{
      _id,
      title,
      dueDate,
      reminderOffset,
      reminderLastSentAt,
      "userEmail": user->email,
      "userName": user->name,
      "carName": car->name
    }`
  );

  const now = Date.now();
  const appBaseUrl = getAppBaseUrl();
  const sentIds: string[] = [];
  const skippedIds: string[] = [];

  for (const todo of todos) {
    const dueAt = new Date(todo.dueDate).getTime();
    const offsetMs = getReminderOffsetMs(todo.reminderOffset || "1week");

    if (!todo.userEmail || Number.isNaN(dueAt) || !offsetMs) {
      skippedIds.push(todo._id);
      continue;
    }

    const triggerAt = dueAt - offsetMs;

    if (now < triggerAt) {
      skippedIds.push(todo._id);
      continue;
    }

    const reminderLastSentAt = todo.reminderLastSentAt ? new Date(todo.reminderLastSentAt).getTime() : null;

    if (reminderLastSentAt && reminderLastSentAt >= triggerAt) {
      skippedIds.push(todo._id);
      continue;
    }

    const todoUrl = appBaseUrl ? `${appBaseUrl}/todo/${todo._id}` : undefined;

    await sendTodoReminderEmail({
      to: todo.userEmail,
      userName: todo.userName,
      todoTitle: todo.title,
      dueDate: todo.dueDate,
      carName: todo.carName,
      reminderLabel: reminderOffsetLabel[todo.reminderOffset || "1week"] || "Reminder",
      todoUrl,
    });

    await writeClient.patch(todo._id).set({ reminderLastSentAt: new Date(now).toISOString() }).commit();
    sentIds.push(todo._id);
  }

  return {
    success: true,
    checked: todos.length,
    sent: sentIds.length,
    sentIds,
    skipped: skippedIds.length,
  };
}

async function handleRequest(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const result = await sendReminders();
    return NextResponse.json(result);
  } catch (error) {
    console.error("SEND TODO REMINDERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send reminders.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}
