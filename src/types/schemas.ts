/**
 * Zod validation schemas for rad-claude MCP server
 *
 * Phase 1: Basic skill metadata and keyword matching
 * Phase 2: File patterns, content patterns, weighted confidence scoring
 */

import { z } from 'zod'

/**
 * Basic skill frontmatter schema
 * Phase 1: name + description only
 */
export const skillFrontmatterSchema = z.object({
	name: z.string().min(1),
	description: z.string().min(1),
})

export type SkillFrontmatter = z.infer<typeof skillFrontmatterSchema>

/**
 * Discovered skill metadata
 * Combines frontmatter + parsed keywords + file patterns
 * Phase 2: Added file patterns for matching
 */
export const discoveredSkillSchema = z.object({
	name: z.string().min(1),
	description: z.string().min(1),
	keywords: z.array(z.string()),
	filePatterns: z.array(z.string()).default([]),
	skillPath: z.string().min(1),
	skillMdPath: z.string().min(1),
})

export type DiscoveredSkill = z.infer<typeof discoveredSkillSchema>

/**
 * Match details for debugging/transparency
 * Phase 2: Track what contributed to confidence score
 */
export const matchDetailsSchema = z.object({
	keywordMatches: z.array(z.string()).default([]),
	fileMatches: z.array(z.string()).default([]),
	contentMatches: z.array(z.string()).default([]),
	keywordScore: z.number().min(0).max(100).default(0),
	fileScore: z.number().min(0).max(100).default(0),
	contentScore: z.number().min(0).max(100).default(0),
})

export type MatchDetails = z.infer<typeof matchDetailsSchema>

/**
 * Skill match result with confidence score
 * Phase 2: Added match details for transparency
 */
export const skillMatchSchema = z.object({
	skill: discoveredSkillSchema,
	confidence: z.number().min(0).max(100),
	matchedKeywords: z.array(z.string()), // Kept for backward compatibility
	details: matchDetailsSchema.optional(),
})

export type SkillMatch = z.infer<typeof skillMatchSchema>

/**
 * get_relevant_skills tool input schema
 * Phase 2: Added optional context (open files, working directory)
 * Phase 8: Added .trim() for security (prevent whitespace-only inputs)
 */
export const getRelevantSkillsInputSchema = z.object({
	prompt: z.string().trim().min(1).max(10000),
	openFiles: z.array(z.string()).optional(),
	workingDirectory: z.string().optional(),
})

export type GetRelevantSkillsInput = z.infer<
	typeof getRelevantSkillsInputSchema
>

/**
 * get_relevant_skills tool output schema
 */
export const getRelevantSkillsOutputSchema = z.object({
	matches: z.array(skillMatchSchema),
	totalSkillsScanned: z.number().int().nonnegative(),
})

export type GetRelevantSkillsOutput = z.infer<
	typeof getRelevantSkillsOutputSchema
>

/**
 * Result type for operations that can fail
 */
export type Result<T, E = Error> =
	| { ok: true; value: T }
	| { ok: false; error: E }
