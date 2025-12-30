import { json } from "@sveltejs/kit";

export async function POST({ request }) {
  const { token, resourceId } = await request.json();

  const url = new URL(
    "https://www.lefrecce.it/Channels.Website.BFF.WEB/website/travel/reopen"
  );
  url.searchParams.append("resourceId", resourceId);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  return json(data);
}
