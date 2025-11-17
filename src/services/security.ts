/**
 * Security Service
 *
 * Implements path validation, symlink resolution, and sandboxing
 * to prevent directory traversal and unauthorized file access.
 *
 * Phase 3: Production-grade security layer
 */

import { existsSync, realpathSync, statSync } from 'node:fs'
import { normalize, resolve, sep } from 'node:path'
import type { Result } from '../types/schemas.ts'

/**
 * Security error with helpful context
 */
export class SecurityError extends Error {
	constructor(
		message: string,
		public readonly attemptedPath: string,
		public readonly reason: string
	) {
		super(message)
		this.name = 'SecurityError'
	}
}

/**
 * Validate that a path is within the allowed .claude/ directory
 *
 * Security measures:
 * 1. Check that unresolved path is within .claude/ (symlinks allowed)
 * 2. Resolve symlinks and validate they stay within project directory
 * 3. Normalize path to prevent ../ traversal
 *
 * @param targetPath - Path to validate (relative or absolute)
 * @param allowedDir - Allowed directory (should be absolute path to .claude/)
 * @returns Result with validated absolute path or security error
 */
export function validatePath(
	targetPath: string,
	allowedDir: string
): Result<string, SecurityError> {
	// Step 1: Normalize the allowed directory (resolve symlinks)
	let resolvedAllowedDir: string
	try {
		resolvedAllowedDir = realpathSync(allowedDir)
	} catch {
		return {
			ok: false,
			error: new SecurityError(
				`Allowed directory does not exist: ${allowedDir}`,
				allowedDir,
				'allowed_dir_not_found'
			),
		}
	}

	// Step 2: Normalize and resolve the target path
	const normalizedPath = normalize(targetPath)
	const absolutePath = resolve(normalizedPath)

	// Step 3: Check that the UNRESOLVED path is within .claude/
	// This allows symlinks within .claude/ even if they point outside
	const allowedPrefix = resolvedAllowedDir.endsWith(sep)
		? resolvedAllowedDir
		: resolvedAllowedDir + sep

	if (!absolutePath.startsWith(allowedPrefix)) {
		return {
			ok: false,
			error: new SecurityError(
				`Access denied: Path is outside allowed directory (.claude/)`,
				targetPath,
				'outside_allowed_directory'
			),
		}
	}

	// Step 4: Check if path exists (if it doesn't, we can't resolve symlinks)
	if (!existsSync(absolutePath)) {
		return {
			ok: false,
			error: new SecurityError(
				`Path does not exist: ${targetPath}`,
				targetPath,
				'path_not_found'
			),
		}
	}

	// Step 5: Resolve symlinks in the target path
	let resolvedPath: string
	try {
		resolvedPath = realpathSync(absolutePath)
	} catch {
		return {
			ok: false,
			error: new SecurityError(
				`Cannot resolve path: ${targetPath}`,
				targetPath,
				'path_resolution_failed'
			),
		}
	}

	// Step 6: Ensure symlink target is within project directory (not system-wide)
	// Get project root (parent of .claude/)
	const projectRoot = resolve(resolvedAllowedDir, '..')
	const projectPrefix = projectRoot.endsWith(sep)
		? projectRoot
		: projectRoot + sep

	if (!resolvedPath.startsWith(projectPrefix)) {
		return {
			ok: false,
			error: new SecurityError(
				`Access denied: Symlink points outside project directory`,
				targetPath,
				'symlink_outside_project'
			),
		}
	}

	// Step 7: Additional check - ensure no path traversal sequences remain in normalized path
	if (normalizedPath.includes('..')) {
		return {
			ok: false,
			error: new SecurityError(
				`Path traversal detected: ${targetPath}`,
				targetPath,
				'path_traversal_detected'
			),
		}
	}

	return { ok: true, value: resolvedPath }
}

/**
 * Validate that a path is a directory
 *
 * @param path - Path to check (must already be validated)
 * @returns Result with success or error
 */
export function validateIsDirectory(path: string): Result<void, SecurityError> {
	try {
		const stats = statSync(path)
		if (!stats.isDirectory()) {
			return {
				ok: false,
				error: new SecurityError(
					`Path is not a directory: ${path}`,
					path,
					'not_a_directory'
				),
			}
		}
		return { ok: true, value: undefined }
	} catch {
		return {
			ok: false,
			error: new SecurityError(
				`Cannot stat path: ${path}`,
				path,
				'stat_failed'
			),
		}
	}
}

/**
 * Validate that a path is a file
 *
 * @param path - Path to check (must already be validated)
 * @returns Result with success or error
 */
export function validateIsFile(path: string): Result<void, SecurityError> {
	try {
		const stats = statSync(path)
		if (!stats.isFile()) {
			return {
				ok: false,
				error: new SecurityError(
					`Path is not a file: ${path}`,
					path,
					'not_a_file'
				),
			}
		}
		return { ok: true, value: undefined }
	} catch {
		return {
			ok: false,
			error: new SecurityError(
				`Cannot stat path: ${path}`,
				path,
				'stat_failed'
			),
		}
	}
}

/**
 * Sanitize error messages for logging
 * Removes potentially sensitive information from error messages
 *
 * @param error - Error to sanitize
 * @returns Sanitized error message safe for logging
 */
export function sanitizeErrorForLogging(error: Error): string {
	// Remove absolute paths, keep only relative portions
	let message = error.message

	// Replace absolute paths with [PATH]
	message = message.replace(/\/[^\s]+/g, '[PATH]')

	// Remove potential PII patterns
	message = message.replace(
		/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
		'[EMAIL]'
	)
	message = message.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')

	return message
}
