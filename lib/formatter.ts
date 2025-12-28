export function formatAnalysis(analysisText: string): string {
  // Remove markdown formatting if present
  let html = analysisText
    .replace(/^```html\n?/gm, '')
    .replace(/\n?```$/gm, '')
    .replace(/^```\n?/gm, '')

  // Ensure it's wrapped in a container
  if (!html.includes('<div')) {
    // If no HTML detected, wrap the text
    html = `<div style="padding: 20px; background: #f8fafc; border-radius: 8px;">
      <p style="font-size: 16px; line-height: 1.6; color: #333;">${html.replace(/\n/g, '<br/>')}</p>
    </div>`
  }

  // Add basic styling if missing
  if (!html.includes('style')) {
    html = `<div style="padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b;">
      ${html}
    </div>`
  }

  return html
}
