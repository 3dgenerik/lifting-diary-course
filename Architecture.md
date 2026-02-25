# ARCHITECTURE

## Tech stack
- React
- Next JS
- postgress DB
- Drizzle ORM
- tRPC
- TailwindCSS
- shadcn UI

## Clerk
- for autentification and user management

## Data base
- postgress
- hosted on Neon
- ORM (Drizzle ili Prisma)


# COMMANDS

## DRIZZLE ORM
- npx drizzle-kit push
- npx drizzle-kit generate
- npx drizzle-kit migrate


## PROCESS
- create nextjs app
- setup Clerk for auth
- create project in Neon (hosting postgress DB)
- Setup Drizzle ORM
- Install shadcn/ui
- create db schema structure in db/schema.ts (CC)
- create dummy data and push it to Neon (CC)
- install Neon MCP server for Claude Code (go to https://neon.com/docs/ai/neon-mcp-server and follow steps, or simple run "npx add-mcp https://mcp.neon.tech/mcp")
