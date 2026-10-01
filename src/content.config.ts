import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';
import { load } from 'js-yaml';

// Astro sorts entries by id, so record each entry's position in its YAML
// file and sort on that when rendering.
const ordered = (path: string) =>
  file(path, {
    parser: (text) =>
      ((load(text) as Record<string, unknown>[] | null) ?? []).map((item, order) => ({ ...item, order })),
  });
const order = z.number().int();

const projects = defineCollection({
  loader: ordered('src/data/projects.yml'),
  schema: z.object({
    order,
    name: z.string(),
    tagline: z.string(),
    summary: z.string(),
    points: z.array(z.string()).default([]),
    stack: z.array(z.string()),
    repo: z.url(),
    live: z.string().optional(),
  }),
});

const lab = defineCollection({
  loader: ordered('src/data/lab.yml'),
  schema: z.object({
    order,
    name: z.string(),
    note: z.string(),
    lang: z.string(),
    repo: z.url(),
  }),
});

const music = defineCollection({
  loader: ordered('src/data/music.yml'),
  schema: z
    .object({
      order,
      title: z.string(),
      instrument: z.enum(['violin', 'guitar']),
      youtube: z.string().optional(),
      audio: z.string().optional(),
      date: z.union([z.string(), z.number()]).transform(String).optional(),
      note: z.string().optional(),
    })
    .refine((r) => Boolean(r.youtube) !== Boolean(r.audio), {
      message: 'Each recording needs exactly one of `youtube` or `audio`.',
    }),
});

export const collections = { projects, lab, music };
