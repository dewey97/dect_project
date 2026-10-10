# Changelog

All notable changes to the Detective Case System (dect_project) will be documented in this file.

## [Unreleased] - 2026-10-10

### Added

- Created `PhoneApp` (`components/investigation/iphone/apps/phone-app.tsx`) covering:
  - **Recents Tab (Figma Frame 22:582)**: Call history list with missed call highlights in red (`#BA1A1A`), contact names, call types, timestamps, call durations, and detail info triggers.
  - **Keypad Tab (Figma Frame 22:453)**: 75px circular keypad buttons with light weight numbers & sub-letter subtitles, numeric input display, green call button (`#34C759`), delete button, and bottom tab bar navigation.
- Added Phone Evidence Node (`c0-pin-victim-phone`) to interactive Canvas & Hero boards (`HeroInteractive` & `MainInvestigationCanvas`) with direct modal click integration.
- Added comprehensive documentation & handover specs (`FIGMA_HANDOVER_SPEC.md`, `10_figma_design_workflow.md`, updated `ASSET_CATALOG.md` & `04_ux_ui_design_system.md`).

### Enhanced

- **Interactive Walkthrough (`interactive-walkthrough.tsx`)**:
  - Implemented SVG cutout masking (`#walkthrough-spotlight-mask`) for sharp, 100% crisp highlight over target pins without muddy backdrop blurring.
  - Added golden ambient illumination border and pulsating radar target indicator.
  - Connected `onStepChange` callback to live canvas state for synchronised pin highlighting.
- **Investigation Board Auto-Sync (`main-investigation-canvas.tsx`)**:
  - Upgraded layout cache version to `2026.10.10_v6_phone_node` to auto-invalidate stale localStorage coordinates for new forensic nodes.
- **Lock Screen (Figma Frame 22:389)**:
  - Aligned time font to 80px font weight 200 (Extra Light) with exact line-height and letter-spacing.
  - Aligned date text font size (17px, Regular) and letter-spacing.
  - Rendered Ocean Waves Ambient music player widget (320x56px, blur 40px, rounded-12px) per Figma specifications.
  - Added Control Center drag indicator (36x4px, blur 12px) and circular camera action shortcut button (44x44px).
  - Shimmering "slide to unlock" action row.
- **Messages App (Figma Frame 22:755)**:
  - Updated conversation thread item list row height to exact 86px with padding `[12px, 16px, 12px, 24px]`.
  - Applied 17px semi-bold sender name typography and 15px subtext preview font size.
