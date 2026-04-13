import { defineType, defineField } from "sanity";

export default defineType({
  name: "serviceType",
  title: "Service Type",
  type: "document",
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
    }),
    defineField({
      name: "defaultIntervalKm",
      title: "Default Interval (km)",
      type: "number",
    }),
    defineField({
      name: "defaultIntervalMonths",
      title: "Default Interval (months)",
      type: "number",
    }),
    defineField({
      name: "defaultCost",
      title: "Default Cost",
      type: "number",
    }),
  ],
  preview: {
    select: {
      title: "name",
    },
  },
});
