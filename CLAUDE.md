# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Start development server at localhost:3000
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

## Architecture

This is a Next.js 16 app using the App Router with React 19.

**UI Components**: Uses shadcn/ui (new-york style) with Radix UI primitives. Components are in `components/ui/` and configured via `components.json`. Add new components with `npx shadcn@latest add <component>`.

**Styling**: Tailwind CSS v4 with CSS variables for theming (light/dark mode). Theme colors are defined in `app/globals.css` using oklch color space. The `cn()` utility in `lib/utils.ts` merges Tailwind classes.

**Path Aliases**: `@/*` maps to the project root (configured in tsconfig.json).

## Current App

A math exercise app for children (Dutch language) with addition and subtraction drills. The main logic is in `app/page.tsx` - generates 10 random exercises and tracks completion time.
