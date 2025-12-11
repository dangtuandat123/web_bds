/**
 * Simple HTML sanitizer - removes dangerous tags without external dependencies
 * Use this for rendering user-provided HTML content
 */

// Tags that are completely removed (including content)
const REMOVE_WITH_CONTENT = ['script', 'style', 'iframe', 'frame', 'object', 'embed', 'applet', 'form', 'input', 'button', 'select', 'textarea']

// Attributes that are removed from all tags
const DANGEROUS_ATTRS = ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'onkeydown', 'onkeyup', 'onkeypress', 'onmousedown', 'onmouseup', 'ondblclick', 'oncontextmenu', 'ondrag', 'ondrop', 'onscroll']

export function sanitizeHtml(html: string): string {
    if (!html) return ''

    let sanitized = html

    // Remove tags with content
    for (const tag of REMOVE_WITH_CONTENT) {
        const regex = new RegExp(`<${tag}[^>]*>[\\s\\S]*?</${tag}>`, 'gi')
        sanitized = sanitized.replace(regex, '')
        // Also remove self-closing versions
        const selfClosingRegex = new RegExp(`<${tag}[^>]*\\/?>`, 'gi')
        sanitized = sanitized.replace(selfClosingRegex, '')
    }

    // Remove dangerous attributes
    for (const attr of DANGEROUS_ATTRS) {
        const attrRegex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, 'gi')
        sanitized = sanitized.replace(attrRegex, '')
        // Also match unquoted values
        const unquotedRegex = new RegExp(`\\s${attr}\\s*=\\s*[^\\s>]+`, 'gi')
        sanitized = sanitized.replace(unquotedRegex, '')
    }

    // Remove javascript: URLs
    sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
    sanitized = sanitized.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""')

    // Remove data: URLs (can contain JS)
    sanitized = sanitized.replace(/href\s*=\s*["']data:[^"']*["']/gi, 'href="#"')
    sanitized = sanitized.replace(/src\s*=\s*["']data:(?!image\/)[^"']*["']/gi, 'src=""')

    // Remove expression() in style attributes (IE)
    sanitized = sanitized.replace(/expression\s*\([^)]*\)/gi, '')

    return sanitized
}
