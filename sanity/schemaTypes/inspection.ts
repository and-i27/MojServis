import { defineType, defineField } from "sanity";

export default defineType({
  name: "inspection",
  title: "Inspection",
  type: "document",
  fields: [
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
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "odometer",
      title: "Odometer (km)",
      type: "number",
    }),
    defineField({
      name: "result",
      title: "Result",
      type: "string",
      options: {
        list: [
          { title: "Passed", value: "passed" },
          { title: "Failed", value: "failed" },
          { title: "Conditional", value: "conditional" },
        ],
      },
    }),
    defineField({
      name: "validUntil",
      title: "Valid Until",
      type: "date",
    }),
    defineField({
      name: "cost",
      title: "Cost",
      type: "number",
    }),
    defineField({
      name: "notes",
      title: "Notes",
      type: "text",
    }),
    defineField({
      name: "documents",
      title: "Documents",
      type: "array",
      of: [{ type: "file" }, { type: "image" }],
    }),
  ],
  preview: {
    select: {
      title: "car.name",
      subtitle: "date",
    },
  },
});
