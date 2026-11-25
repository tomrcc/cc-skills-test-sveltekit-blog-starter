// CloudCannon's date input can save a timestamp; the post template prints YYYY-MM-DD.
export const formatDate = (value) => {
	if (value instanceof Date) return value.toISOString().slice(0, 10)
	if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) return value.slice(0, 10)
	return value
}
