/**
 * @deprecated Dùng `@/lib/cases/characters` thay thế.
 * File này được giữ tạm để tương thích ngược với các worktree khác chưa merge.
 */
export * from "./characters";
export {
  type SuspectCharacter,
  DEFAULT_AVATAR_PLACEHOLDER,
  getValidCaseCharacters,
  removeDiacritics,
  findValidCaseCharacter,
  buildDynamicSuspectCharacters,
  getCanonicalSuspectKey,
} from "./characters";
