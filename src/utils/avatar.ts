export function getAvatarUrl(name: string, url?: string | null): string {
  if (url?.trim()) return url;

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff&size=128&bold=true`;
}
