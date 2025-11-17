/**
 * Output Schemas for rad-claude MCP Tools
 *
 * Defines Zod schemas for tool outputs to enable:
 * - Runtime validation of tool responses
 * - Type-safe structured content
 * - MCP client introspection
 * - Better documentation
 */

import { z } from 'zod'

/**
 * get_relevant_skills output schema
 */
export const getRelevantSkillsOutputSchema = z.object({
	matches: z.array(
		z.object({
			skill: z.object({
				name: z.string(),
				description: z.string(),
				keywords: z.array(z.string()),
				filePatterns: z.array(z.string()),
				skillPath: z.string(),
				skillMdPath: z.string(),
			}),
			confidence: z.number().min(0).max(100),
			matchedKeywords: z.array(z.string()),
			details: z
				.object({
					keywordMatches: z.array(z.string()),
					fileMatches: z.array(z.string()),
					contentMatches: z.array(z.string()),
					keywordScore: z.number().min(0).max(100),
					fileScore: z.number().min(0).max(100),
					contentScore: z.number().min(0).max(100),
				})
				.optional(),
		})
	),
	totalSkillsScanned: z.number().int().nonnegative(),
})

export type GetRelevantSkillsOutput = z.infer<
	typeof getRelevantSkillsOutputSchema
>

/**
 * suggest_agent output schema
 */
export const suggestAgentOutputSchema = z.object({
	recommendations: z.array(
		z.object({
			agent: z.object({
				name: z.string(),
				description: z.string(),
				whenToUse: z.string(),
				estimatedDuration: z.string(),
			}),
			confidence: z.number().min(0).max(100),
			reasoning: z.string(),
			matchedSignals: z.array(z.string()),
		})
	),
})

export type SuggestAgentOutput = z.infer<typeof suggestAgentOutputSchema>

/**
 * get_skill_resources output schema
 */
export const getSkillResourcesOutputSchema = z.object({
	recommendations: z.array(
		z.object({
			resource: z.object({
				fileName: z.string(),
				filePath: z.string(),
				topic: z.string(),
				skillName: z.string(),
			}),
			relevance: z.number().min(0).max(100),
			reasoning: z.string(),
		})
	),
	totalResources: z.number().int().nonnegative(),
})

export type GetSkillResourcesOutput = z.infer<
	typeof getSkillResourcesOutputSchema
>

/**
 * update_session_tracker output schema
 */
export const updateSessionTrackerOutputSchema = z.object({
	message: z.string(),
	checkpointStatus: z.enum(['none', 'suggested', 'recommended', 'urgent']),
})

export type UpdateSessionTrackerOutput = z.infer<
	typeof updateSessionTrackerOutputSchema
>

/**
 * create_continuation_brief output schema
 */
export const createContinuationBriefOutputSchema = z.object({
	briefPath: z.string(),
	message: z.string(),
})

export type CreateContinuationBriefOutput = z.infer<
	typeof createContinuationBriefOutputSchema
>

// Re-export session-related schemas from session-schemas
export { shouldCreateCheckpointOutputSchema } from './session-schemas.ts'
