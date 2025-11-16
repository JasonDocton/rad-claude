/**
 * Confidence Scoring Service
 *
 * Implements weighted confidence scoring algorithm for skill matching:
 * - Keywords: 40% weight
 * - File patterns: 30% weight
 * - Content patterns: 30% weight
 *
 * Phase 2: Intelligent confidence scoring with multiple signals
 */

import { minimatch } from 'minimatch'
import type { DiscoveredSkill, MatchDetails } from '../types/schemas.ts'

/**
 * Weights for confidence scoring components
 */
const WEIGHTS = {
	keywords: 0.4,
	files: 0.3,
	content: 0.3,
} as const

/**
 * Calculate keyword match score (0-100)
 *
 * Base: 70% for first match
 * +5% for each additional match (capped at 100%)
 */
function calculateKeywordScore(
	prompt: string,
	keywords: readonly string[]
): { score: number; matches: readonly string[] } {
	const normalizedPrompt = prompt.toLowerCase()
	const matches: string[] = []

	for (const keyword of keywords) {
		if (normalizedPrompt.includes(keyword)) {
			matches.push(keyword)
		}
	}

	if (matches.length === 0) {
		return { score: 0, matches: [] }
	}

	const baseScore = 70
	const bonusPerMatch = 5
	const score = Math.min(100, baseScore + (matches.length - 1) * bonusPerMatch)

	return { score, matches }
}

/**
 * Calculate file pattern match score (0-100)
 *
 * Checks if any open files match the skill's file patterns
 * Score: (matchedFiles / totalPatterns) * 100
 */
function calculateFileScore(
	openFiles: readonly string[],
	filePatterns: readonly string[]
): { score: number; matches: readonly string[] } {
	if (filePatterns.length === 0 || openFiles.length === 0) {
		return { score: 0, matches: [] }
	}

	const matches: string[] = []

	for (const file of openFiles) {
		for (const pattern of filePatterns) {
			if (minimatch(file, pattern, { dot: true })) {
				matches.push(file)
				break // Count each file only once
			}
		}
	}

	if (matches.length === 0) {
		return { score: 0, matches: [] }
	}

	// Score based on match ratio, with bonus for multiple matches
	const baseScore = 80
	const bonusPerMatch = 10
	const score = Math.min(100, baseScore + (matches.length - 1) * bonusPerMatch)

	return { score, matches }
}

/**
 * Semantic patterns for content matching (30% weight)
 *
 * Maps common user intents to regex patterns that detect related concepts
 * without requiring exact keyword matches
 */
const SEMANTIC_PATTERNS: Record<string, RegExp> = {
	'webhook/callback':
		/\b(webhook|callback|event.*handler|api.*endpoint|http.*action|external.*api|payload|signature.*verif)/i,
	'payment/stripe':
		/\b(stripe|payment|checkout|charge|subscription|invoice|billing|transaction|card)/i,
	'auth/session':
		/\b(auth|login|signup|session|jwt|oauth|token|credentials|password|user.*management)/i,
	'database/schema':
		/\b(schema|table|query|mutation|database|data.*model|field|index|migration)/i,
	'validation/security':
		/\b(validat|sanitiz|xss|sql.*inject|csrf|rate.*limit|audit|pii|encrypt)/i,
	'realtime/convex':
		/\b(realtime|live.*query|subscri|reactive|websocket|sse|push.*notif)/i,
	'forms/input':
		/\b(form|input|textarea|checkbox|radio|select|validation|submit|field)/i,
	'api/http':
		/\b(api|rest|endpoint|route|request|response|fetch|axios|http.*client)/i,
}

/**
 * Calculate content pattern match score (0-100)
 *
 * Uses semantic regex patterns to detect user intent beyond explicit keywords
 * Enables: "create a webhook" → matches 'webhook/callback' pattern → suggests convex-patterns
 */
function calculateContentScore(
	prompt: string,
	skillName: string
): { score: number; matches: readonly string[] } {
	const matches: string[] = []
	const normalizedPrompt = prompt.toLowerCase()

	// Skill-specific semantic pattern mapping
	const skillPatterns: Record<string, string[]> = {
		'convex-patterns': [
			'webhook/callback',
			'database/schema',
			'realtime/convex',
			'api/http',
		],
		'security-patterns': [
			'validation/security',
			'auth/session',
			'payment/stripe',
		],
		'react-patterns': ['forms/input', 'realtime/convex'],
		'typescript-patterns': ['database/schema', 'validation/security'],
	}

	const relevantPatterns = skillPatterns[skillName] ?? []

	for (const patternName of relevantPatterns) {
		const pattern = SEMANTIC_PATTERNS[patternName]
		if (pattern?.test(normalizedPrompt)) {
			matches.push(patternName)
		}
	}

	if (matches.length === 0) {
		return { score: 0, matches: [] }
	}

	// Score: 70% base + 10% per additional match (capped at 100)
	const baseScore = 70
	const bonusPerMatch = 10
	const score = Math.min(100, baseScore + (matches.length - 1) * bonusPerMatch)

	return { score, matches }
}

/**
 * Calculate overall confidence score for a skill match
 *
 * Uses weighted average:
 * - Keywords: 40%
 * - Files: 30%
 * - Content: 30%
 *
 * If only some signals are present, weights are redistributed proportionally
 */
export function calculateConfidence(
	prompt: string,
	skill: DiscoveredSkill,
	context?: {
		openFiles?: readonly string[]
		fileContents?: readonly string[]
	}
): { confidence: number; details: MatchDetails } {
	const keywordResult = calculateKeywordScore(prompt, skill.keywords)
	const fileResult = calculateFileScore(
		context?.openFiles ?? [],
		skill.filePatterns
	)
	const contentResult = calculateContentScore(prompt, skill.name)

	// Determine which signals are active
	const activeWeights: number[] = []
	const activeScores: number[] = []

	if (keywordResult.score > 0) {
		activeWeights.push(WEIGHTS.keywords)
		activeScores.push(keywordResult.score)
	}

	if (fileResult.score > 0) {
		activeWeights.push(WEIGHTS.files)
		activeScores.push(fileResult.score)
	}

	if (contentResult.score > 0) {
		activeWeights.push(WEIGHTS.content)
		activeScores.push(contentResult.score)
	}

	// If no signals matched, return 0 confidence
	if (activeWeights.length === 0) {
		return {
			confidence: 0,
			details: {
				keywordMatches: [],
				fileMatches: [],
				contentMatches: [],
				keywordScore: 0,
				fileScore: 0,
				contentScore: 0,
			},
		}
	}

	// Normalize weights to sum to 1.0
	const totalWeight = activeWeights.reduce((sum, w) => sum + w, 0)
	const normalizedWeights = activeWeights.map((w) => w / totalWeight)

	// Calculate weighted average
	const confidence = activeScores.reduce(
		(sum, score, i) => sum + score * (normalizedWeights[i] ?? 0),
		0
	)

	return {
		confidence: Math.round(confidence),
		details: {
			keywordMatches: [...keywordResult.matches],
			fileMatches: [...fileResult.matches],
			contentMatches: [...contentResult.matches],
			keywordScore: keywordResult.score,
			fileScore: fileResult.score,
			contentScore: contentResult.score,
		},
	}
}
