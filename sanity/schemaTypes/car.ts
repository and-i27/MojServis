import { defineField, defineType } from "sanity";

export default defineType({
  name: "car",
  title: "Car",
  type: "document",
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "owner",
      title: "Owner",
      type: "reference",
      to: [{ type: "user" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "makeModel",
      title: "Make / Model",
      type: "string",
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "number",
    }),
    defineField({
      name: "vin",
      title: "VIN",
      type: "string",
    }),
    defineField({
      name: "plate",
      title: "License Plate",
      type: "string",
    }),
    defineField({
      name: "odometer",
      title: "Odometer (km)",
      type: "number",
    }),
    defineField({
      name: "notes",
      title: "Notes",
      type: "text",
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [{ type: "image" }],
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "plate",
    },
  },
});
