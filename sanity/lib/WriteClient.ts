import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

// Server-only client: uses token for mutations.
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_EDIT_TOKEN,
});
