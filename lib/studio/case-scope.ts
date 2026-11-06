/** Shared by the server helper and the sidebar Case picker. */
export const STUDIO_CASE_COOKIE = "studio_case";

/** Studio sections that show one case at a time; they get `?case=` links. */
export const CASE_SCOPED_PATHS = [
  "/studio/checkpoints",
  "/studio/dossier",
  "/studio/scene-360",
  "/studio/phone",
  "/studio/store",
];

export function isCaseScopedPath(pathname: string): boolean {
  return CASE_SCOPED_PATHS.some((p) => pathname.startsWith(p));
}
