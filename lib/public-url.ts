/** Resolve public files and local routes for both root and repository deployments. */
export function publicUrl(path: string): string {
  if (!path || /^(?:[a-z][a-z\d+.-]*:|\/\/|#|\?)/i.test(path)) return path;
  const base = (import.meta.env?.BASE_URL || '/').replace(/\/?$/, '/');
  if (base !== '/' && path.startsWith(base)) return path;
  return `${base}${path.replace(/^\/+/, '')}`;
}
