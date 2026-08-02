import { createHash } from 'node:crypto'

// Approximates a unique visitor per day without ever storing (or being able
// to recover) a raw IP address — the hash isn't reversible, and rotates
// daily by design, so it can't be used to track someone across days either.
export function hashVisitor(ip: string, userAgent: string, day: string): string {
	return createHash('sha256').update(`${ip}:${userAgent}:${day}`).digest('hex')
}
