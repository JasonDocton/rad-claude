---
name: bun-patterns
description: Bun runtime and package manager patterns. Applies to package management, Bun.file, Bun.write, Bun.Glob, bun test, scripts, workspaces, or migrating from npm/yarn/pnpm.
---

# Bun Patterns

## Rules

| Pattern      | Do                          | Don't                      |
| ------------ | --------------------------- | -------------------------- |
| Packages     | `bun add <pkg>`             | manually edit package.json |
| Node imports | `node:` protocol always     | bare `fs`, `path`          |
| File I/O     | `Bun.file()`, `Bun.write()` | Node.js fs sync methods    |
| Globs        | `new Bun.Glob()`            | `readdirSync` + `statSync` |
| Regex        | top-level const             | inline in functions        |

## Commands

| Task          | Command                        |
| ------------- | ------------------------------ |
| Install all   | `bun install`                  |
| Add package   | `bun add <pkg>`                |
| Add dev       | `bun add -d <pkg>`             |
| Exact version | `bun add --exact react@19.2.0` |
| Remove        | `bun remove <pkg>`             |
| Run script    | `bun run <script>`             |
| Execute TS    | `bun <file.ts>`                |
| Test          | `bun test`                     |
| Outdated      | `bun outdated`                 |
| Why installed | `bun pm ls <pkg>`              |

## Node.js → Bun API

| Node.js                        | Bun Native                      |
| ------------------------------ | ------------------------------- |
| `readFileSync(path, 'utf-8')`  | `await Bun.file(path).text()`   |
| `JSON.parse(readFileSync())`   | `await Bun.file(path).json()`   |
| `writeFileSync(path, data)`    | `await Bun.write(path, data)`   |
| `existsSync(path)`             | `await Bun.file(path).exists()` |
| `readdirSync()` + `statSync()` | `new Bun.Glob(pattern)`         |

## File I/O

```ts
// ✅ Bun native
const data = await Bun.file("data.json").json()
await Bun.write("output.json", JSON.stringify(data))
if (await Bun.file("config.json").exists()) { /* ... */ }

// ❌ Node.js fs
const content = readFileSync("data.json", "utf-8")
const data = JSON.parse(content)
```

## Glob Pattern

```ts
// ✅ Bun.Glob
const glob = new Bun.Glob("*/SKILL.md")
for (const file of glob.scanSync({ cwd: "skills" })) {
  const dirName = file.split("/")[0]
}

// ❌ readdirSync + statSync (many syscalls)
```

## Node Protocol

```ts
// ✅ always use node: protocol
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

// ❌ bare imports
import { readFileSync } from "fs"
```

## Top-Level Regex

```ts
// ✅ compiled once
const MD_REGEX = /\.md$/
function extractTopic(fileName: string) {
  return fileName.replace(MD_REGEX, "")
}

// ❌ recreated each call
function extractTopic(fileName: string) {
  return fileName.replace(/\.md$/, "")
}
```

## Testing

```ts
import { describe, it, expect } from "bun:test"

describe("math", () => {
  it("adds", () => expect(1 + 1).toBe(2))
})
```

`bun test` · `bun test --watch` · `bun test --coverage`

## Scripts

```json
{
	"scripts": {
		"dev": "bun --hot src/index.ts",
		"build": "bun build src/index.ts --outdir ./dist",
		"test": "bun test",
		"typecheck": "tsc --noEmit"
	}
}
```

## Workspaces

```json
{ "workspaces": ["packages/*", "apps/*"] }
```

`bun install` installs all. `bun run --filter @myapp/web dev` targets one.

## Migration from npm/yarn/pnpm

```bash
rm package-lock.json yarn.lock pnpm-lock.yaml
bun install
git add bun.lockb
```

## Other APIs

```ts
// Password hashing
const hash = await Bun.password.hash("pwd")
const valid = await Bun.password.verify("pwd", hash)

// HTTP server
Bun.serve({ port: 3000, fetch: () => new Response("Hello") })

// Env (auto-loads .env)
const key = process.env.API_KEY
```

## Troubleshooting

Binary packages failing: `bun install --backend=hardlink`
