function escapeHTML(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/>/g, '&gt;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;')
}

/**
 * Template handler that does basic HTML escaping for substitutions
 */
export function safeHtml(literals: TemplateStringsArray, ...substitutions: Array<string | number | string[]>) {
  const raw = literals.raw

  let result = raw[0]

  for (let index = 1; index < raw.length; index++) {
    const literal = raw[index]
    let substitution = substitutions[index - 1]
    if (Array.isArray(substitution)) {
      substitution = substitution.join('')
    } else if (typeof substitution === 'number') {
      substitution = substitution.toString()
    }
    substitution = escapeHTML(substitution)
    result += substitution + literal
  }

  return result
}
