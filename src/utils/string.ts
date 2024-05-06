export function titleize(str: string): string {
	return str.replaceAll(/\b\w/g, (match) => match.toLocaleUpperCase())
}