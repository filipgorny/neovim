export default (variable: string, defaultValue: string | null = null): string | null => process.env[variable] || defaultValue
