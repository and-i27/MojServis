import { defineType, defineField } from "sanity";

export default defineType({
  name: "user",
  title: "User",
  type: "document",
  fields: [
    defineField({
      name: "name",
      type: "string",
    }),
    defineField({
      name: "email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      options: {
        list: [
          { title: "User", value: "user" },
          { title: "Admin", value: "admin" },
          { title: "Fleet Manager", value: "fleet_manager" },
        ],
      },
      initialValue: "user",
    }),
    defineField({
      name: "passwordHash",
      type: "string",
      hidden: true,
    }),
  ],
  preview: {
    select: {
        title: "name",
    },
  },
});
