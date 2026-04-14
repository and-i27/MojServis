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
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "car.name",
    },
  },
});
