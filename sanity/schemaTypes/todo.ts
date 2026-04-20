import { defineField, defineType } from "sanity";

export default defineType({
  name: "todo",
  title: "Todo",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "car",
      title: "Car",
      type: "reference",
      to: [{ type: "car" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "user",
      title: "User",
      type: "reference",
      to: [{ type: "user" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "dueDate",
      title: "Due date",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "open",
      options: {
        list: [
          { title: "Open", value: "open" },
          { title: "Done", value: "done" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
    }),
    defineField({
      name: "priority",
      title: "Priority",
      type: "string",
      initialValue: "medium",
      options: {
        list: [
          { title: "Low", value: "low" },
          { title: "Medium", value: "medium" },
          { title: "High", value: "high" },
        ],
      },
    }),
    defineField({
      name: "reminderEnabled",
      title: "Reminder enabled",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "reminderOffset",
      title: "Reminder offset",
      type: "string",
      initialValue: "1week",
      options: {
        list: [
          { title: "1 day early", value: "1day" },
          { title: "3 days early", value: "3days" },
          { title: "1 week early", value: "1week" },
          { title: "2 weeks early", value: "2weeks" },
        ],
      },
      hidden: ({ document }) => !document?.reminderEnabled,
    }),
    defineField({
      name: "reminderLastSentAt",
      title: "Reminder last sent at",
      type: "datetime",
      hidden: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "car.name",
    },
  },
});
