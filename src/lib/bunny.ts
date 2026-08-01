// Server-only. Builds a Bunny Stream HLS playback URL for an episode.
// If BUNNY_TOKEN_KEY is set, the URL is signed (Bunny token-auth enabled).
// Otherwise returns the plain manifest URL (only works if token-auth is OFF in Bunny).

import crypto from "crypto";

const PULLZONE = process.env.BUNNY_PULLZONE_HOST || "vz-1952386c-8a4.b-cdn.net";

// episode number -> Bunny Stream video GUID (library 712470)
export const EPISODE_GUIDS: Record<number, string> = {
  1: "13b9d773-7639-4a2c-9444-14b6c4759b60",
  2: "9476b98f-5a99-4b54-8922-4ac1a564019d",
  3: "e6b6fab3-5ad5-4518-8422-c39433c4dd9a",
  4: "acb55e7d-ee93-4b29-ba87-73323b1633a5",
  5: "cdafd605-228d-44ff-8e31-b2ebc36f479d",
  6: "0b09be80-08bd-4f05-af77-c3ea4e2874de",
  7: "d577043d-af65-4182-8ae0-b23c2f7c9dcf",
  8: "b91f25e5-0ee7-42df-8f47-d80a66f55903",
  9: "4c0f5c4f-0b69-4e30-bd83-3dbc09c4b86d",
  10: "5ccc09bd-09ad-4530-8a62-f8e3ef21e31f",
  11: "8bbac460-280c-48c9-acb1-e2a4d9d4b07a",
  12: "83a60fcf-06a1-4b7c-bf65-3a9604fb1f1d",
  13: "e4d2fb6b-5e48-4fe0-9651-bd17a9348e00",
};

export function getBunnyManifestUrl(episode: number): string | null {
  const guid = EPISODE_GUIDS[episode];
  if (!guid) return null;
  const base = `https://${PULLZONE}/${guid}/play.m3u8`;
  const key = process.env.BUNNY_TOKEN_KEY;
  if (!key) return base; // unsigned — requires token-auth OFF in Bunny dashboard
  // Bunny token auth: token = HMAC-SHA256(path + expires + key), hex
  const expires = Math.floor(Date.now() / 1000) + 2 * 60 * 60; // 2h
  const path = `/${guid}/play.m3u8`;
  const hmac = crypto.createHmac("sha256", key).update(`${path}${expires}`).digest("hex");
  return `${base}?token=${hmac}&expires=${expires}`;
}
