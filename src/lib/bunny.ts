// Server-only. Builds a Bunny Stream HLS playback URL for an episode.
// If BUNNY_TOKEN_KEY is set, the URL is signed (Bunny token-auth enabled).
// Otherwise returns the plain manifest URL (only works if token-auth is OFF in Bunny).

import crypto from "crypto";

const PULLZONE = process.env.BUNNY_PULLZONE_HOST || "vz-1952386c-8a4.b-cdn.net";
export { PULLZONE };

export const DEFAULT_SERIES_ID = "baby-at-her-door";

// series id -> (episode number -> Bunny Stream video GUID), library 712470.
// Keyed per series on purpose: episode numbers restart at 1 for every show, so a
// flat number->GUID map serves the WRONG video for any series added after the first.
export const SERIES_GUIDS: Record<string, Record<number, string>> = {
  "baby-at-her-door": {
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
    14: "4df204f5-dd60-4c0c-ae3b-0e9210b00a40",
    15: "4f3acedc-5991-42e7-b3f3-1e5844646d8b",
    16: "78b8fd86-cb61-4b34-98a6-db7dc2380c58",
    17: "fa4cc213-4c1c-434d-bc5a-8e4b7052a0a8",
    18: "8c48f450-9340-44ff-8c04-311e8a9fb91d",
  },
  // Uploaded to Bunny as IMG_2238.MOV / IMG_2334.MOV; order taken from upload time.
  // Ep 4 = IMG_2484.MOV (uploaded 2026-09-24, 9:48, 848x464).
  "the-daughter-he-never-knew": {
    1: "10fc3aa1-9972-433c-926b-1b5bd1948af7",
    2: "ee49cdad-bcfb-4989-b9d4-15b3cf7d2884",
    3: "7e050d78-d263-4747-8ecc-110801793ef4",
    4: "33ee6ada-0e00-4ea2-b029-94b9d83fb8cd",
  },
};

export function getEpisodeGuid(episode: number, seriesId: string = DEFAULT_SERIES_ID): string | null {
  return SERIES_GUIDS[seriesId]?.[episode] ?? null;
}

export function getBunnyManifestUrl(episode: number, seriesId: string = DEFAULT_SERIES_ID): string | null {
  const guid = getEpisodeGuid(episode, seriesId);
  if (!guid) return null;
  const base = `https://${PULLZONE}/${guid}/playlist.m3u8`;
  const key = process.env.BUNNY_TOKEN_KEY;
  if (!key) return base; // unsigned — requires token-auth OFF in Bunny dashboard
  // Bunny token auth: token = HMAC-SHA256(path + expires + key), hex
  const expires = Math.floor(Date.now() / 1000) + 2 * 60 * 60; // 2h
  const path = `/${guid}/playlist.m3u8`;
  const hmac = crypto.createHmac("sha256", key).update(`${path}${expires}`).digest("hex");
  return `${base}?token=${hmac}&expires=${expires}`;
}