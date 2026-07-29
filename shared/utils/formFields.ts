import type { FormFieldDef } from '#shared/types/cms'

// Shared by the client-side step renderer (DynamicForm.vue) and the server
// submit handler, so "is this field visible/required right now" is decided
// identically in both places — a field hidden by a showIf condition must
// never be enforced as required server-side just because the client never
// rendered (and so never validated) it.
export function isFieldVisible(field: FormFieldDef, values: Record<string, string>): boolean {
	if (!field.showIf) return true
	return (values[field.showIf.field] ?? '') === field.showIf.equals
}

// Steps are derived from whatever step numbers are actually present on the
// fields (defaulting unset fields to step 1) rather than assuming a fixed
// range — so a form where every field is left on step 1 behaves as a
// single-step form with zero configuration.
export function getStepNumbers(fields: FormFieldDef[]): number[] {
	const numbers = new Set(fields.map((field) => field.step ?? 1))
	return [...numbers].sort((a, b) => a - b)
}
