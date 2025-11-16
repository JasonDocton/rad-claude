/**
 * Session tracking schemas for Phase 9: Intelligent Context Management
 *
 * Milestone-based approach: Track natural checkpoints instead of estimating tokens.
 * Recommends saves at phase completions, git commits, or significant file changes.
 */

import { z } from 'zod'

/**
 * Checkpoint status levels
 */
export const checkpointStatusSchema = z.enum([
	'none', // No checkpoint needed yet
	'suggested', // Phase completed OR 2+ commits
	'recommended', // 3+ commits OR 10+ files modified
	'urgent', // 5+ commits OR 20+ files modified
])

export type CheckpointStatus = z.infer<typeof checkpointStatusSchema>

/**
 * Session tracker state
 *
 * Tracks progress at natural milestones (phases, commits, file changes)
 * instead of attempting to estimate token usage.
 */
export const sessionTrackerSchema = z.object({
	sessionStart: z.string(), // ISO timestamp
	lastCheckpoint: z.string(), // ISO timestamp of last save
	currentPhase: z.string(), // e.g., "Phase 8 - Security Audit"
	completedSinceCheckpoint: z.array(z.string()), // Major accomplishments
	inProgress: z.string(), // Current task
	filesModified: z.array(z.string()), // Files changed this session
	commitsSinceCheckpoint: z.number().int().nonnegative(),
	lastCommit: z.string().optional(), // Git hash
	checkpointStatus: checkpointStatusSchema,
})

export type SessionTracker = z.infer<typeof sessionTrackerSchema>

/**
 * Input schema for update_session_tracker tool
 */
export const updateSessionTrackerInputSchema = z.object({
	currentPhase: z.string().optional(),
	completedWork: z.string().optional(), // Add to completedSinceCheckpoint
	inProgress: z.string().optional(),
	filesModified: z.array(z.string()).optional(), // Append to existing
	commitMade: z.boolean().optional(), // Increment commit count
	lastCommit: z.string().optional(), // Git hash
})

export type UpdateSessionTrackerInput = z.infer<
	typeof updateSessionTrackerInputSchema
>

/**
 * Output schema for should_create_checkpoint tool
 */
export const shouldCreateCheckpointOutputSchema = z.object({
	status: checkpointStatusSchema,
	shouldSave: z.boolean(),
	reasoning: z.string(),
	stats: z.object({
		sessionDuration: z.string(), // Human-readable (e.g., "2h 15m")
		commitsSinceCheckpoint: z.number(),
		filesModified: z.number(),
		workCompleted: z.number(),
	}),
})

export type ShouldCreateCheckpointOutput = z.infer<
	typeof shouldCreateCheckpointOutputSchema
>

/**
 * Input schema for create_continuation_brief tool
 */
export const createContinuationBriefInputSchema = z.object({
	reason: z.string(), // Why saving now (e.g., "Phase 8 complete, 3 commits made")
	contextToLoad: z.array(z.string()), // Files to load first in next session
	completedWork: z.array(z.string()), // What was accomplished
	inProgressFile: z.string().optional(), // File being worked on
	inProgressDescription: z.string().optional(), // Current state
	nextSteps: z.array(z.string()), // How to resume
	estimatedCompletion: z.string().optional(), // Time estimate to finish
})

export type CreateContinuationBriefInput = z.infer<
	typeof createContinuationBriefInputSchema
>

/**
 * Constants for checkpoint logic
 */
export const CHECKPOINT_THRESHOLDS = {
	SUGGESTED: {
		commits: 2,
		filesModified: 5,
	},
	RECOMMENDED: {
		commits: 3,
		filesModified: 10,
	},
	URGENT: {
		commits: 5,
		filesModified: 20,
	},
} as const

/**
 * Session state file location
 */
export const SESSION_STATE_FILE = 'SESSION_TRACKER.json'
