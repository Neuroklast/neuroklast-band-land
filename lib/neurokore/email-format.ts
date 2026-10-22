/** Text email serialization is explicit so the terms remain readable offline. */
export function contractDocumentText(sections: readonly { title: string; paragraphs: readonly string[] }[]): string {
  return sections.map(section => [section.title, ...section.paragraphs].join('\n')).join('\n\n')
}

export function contractEmailText(lines: readonly string[]): string {
  return lines.join('\n')
}
