export const reminderOffsetLabel: Record<string, string> = {
  "1day": "1 dan prej",
  "3days": "3 dni prej",
  "1week": "1 teden prej",
  "2weeks": "2 tedna prej",
};

export function getReminderOffsetMs(reminderOffset: string) {
  switch (reminderOffset) {
    case "1day":
      return 24 * 60 * 60 * 1000;
    case "3days":
      return 3 * 24 * 60 * 60 * 1000;
    case "1week":
      return 7 * 24 * 60 * 60 * 1000;
    case "2weeks":
      return 14 * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
}
