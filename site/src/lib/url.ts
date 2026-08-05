/** Prefixes an in-site absolute path with the deploy base (see astro.config.mjs
 *  `base`). Pass paths as written in the design, e.g. '/' or '/corporate/'. */
export const withBase = (path: string): string => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return path === '/' ? `${base}/` : `${base}/${path.replace(/^\//, '')}`;
};
