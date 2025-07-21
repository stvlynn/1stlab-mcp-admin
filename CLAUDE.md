# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React + TypeScript admin panel for managing the 1stlab MCP directory. Features include secure authentication, project management, category management, and integration with Baidu's MCP marketplace API for crawling projects.

## Architecture

**Frontend Stack**: React 19 + TypeScript + Tailwind CSS + Vite
**Authentication**: Simple password-based auth stored in localStorage
**Backend**: Supabase for data storage
**API Integration**: Baidu MCP marketplace crawler service

## Key Components

- **Contexts**: AuthContext (authentication), CrawlerContext (crawler state)
- **Services**: Supabase client, BaiduCrawlerService (crawls MCP projects)
- **Pages**: Dashboard, Projects, Categories, Users, Settings, Login
- **UI**: Radix UI components with Tailwind styling

## Environment Setup

Required environment variables:
- `VITE_ADMIN_PASSWORD` - Admin password for login
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Key Files

- `src/services/baiduCrawler.ts` - Baidu MCP marketplace crawler
- `src/services/supabase.ts` - Supabase client configuration
- `src/contexts/AuthContext.tsx` - Authentication state management
- `src/contexts/CrawlerContext.tsx` - Crawler progress state
- `vite.config.ts` - Vite configuration with proxy for Baidu API

## Development Notes

- Uses path alias `@` for `src/` directory
- Proxy configured in vite.config.ts for `/api/baidu` → `https://sai.baidu.com/api/mcp-market`
- Crawler filters projects with `mcpSource === 'spider==github.com'`
- Chinese category names are normalized to English equivalents