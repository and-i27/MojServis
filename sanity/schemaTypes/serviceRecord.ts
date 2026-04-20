import { defineType, defineField } from "sanity";

export default defineType({
  name: "serviceRecord",
  title: "Service Record",
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
      name: "serviceType",
      title: "Service Type",
      type: "reference",
      to: [{ type: "serviceType" }],
    }),
    defineField({
      name: "title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
    }),
    defineField({
      name: "date",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "odometer",
      title: "Odometer (km)",
      type: "number",
    }),
    defineField({
      name: "cost",
      title: "Cost",
      type: "number",
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      initialValue: "EUR",
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
      title: "title",
      subtitle: "car.name",
    },
  },
});
