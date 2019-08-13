export function extensionsAsRegex(extensions: string[]): string {
  return `\\.(${extensions.join('|')})$`
}
