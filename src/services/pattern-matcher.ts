/**
 * Pattern Matcher Service
 *
 * Matches user prompts against skill keywords and calculates confidence scores.
 *
 * Phase 1: Simple keyword matching with confidence scoring
 * Phase 2: Weighted scoring with file patterns and context awareness
 * - Keywords: 40% weight
 * - File patterns: 30% weight
 * - Content patterns: 30% weight (future)
 */

import type { DiscoveredSkill, SkillMatch } from '../types/schemas.ts'
import { calculateConfidence } from './confidence-scorer.ts'

/**
 * Context for skill matching
 * Phase 2: Added to support file-based and content-based matching
 */
export interface MatchContext {
	openFiles?: readonly string[]
	workingDirectory?: string
	fileContents?: readonly string[]
}

/**
 * Match a prompt against all skills and return ranked results
 *
 * Phase 2: Enhanced with context support (open files, working directory)
 *
 * @param prompt - User's prompt
 * @param skills - All discovered skills
 * @param context - Optional context (open files, working directory)
 * @param minConfidence - Minimum confidence threshold (default: 70%)
 * @returns Array of skill matches sorted by confidence (highest first)
 */
export function matchPromptToSkills(
	prompt: string,
	skills: readonly DiscoveredSkill[],
	context?: MatchContext,
	minConfidence = 70
): readonly SkillMatch[] {
	const matches: SkillMatch[] = []

	for (const skill of skills) {
		const { confidence, details } = calculateConfidence(prompt, skill, context)

		// Only include matches above threshold
		if (confidence >= minConfidence) {
			matches.push({
				skill,
				confidence,
				matchedKeywords: [...details.keywordMatches],
				details,
			})
		}
	}

	// Sort by confidence (highest first)
	matches.sort((a, b) => b.confidence - a.confidence)

	return matches
}
