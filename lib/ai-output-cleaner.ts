/**
 * AI Output Cleaner
 *
 * Strips markdown formatting that AI models sometimes inject even when
 * explicitly told not to. Applied to all text-based AI responses before
 * they are sent to the frontend.
 *
 * Does NOT touch JSON strings — call this only on plain-text fields.
 */
export function cleanAIOutput(text: string): string {
  return text
    .replace(/\*\*/g, '')        // bold
    .replace(/\*/g, '')          // italic / bullet asterisk
    .replace(/__/g, '')          // underline
    .replace(/`/g, '')           // inline code
    .replace(/^#+\s*/gm, '')     // headings
    .replace(/^[-•]\s*/gm, '')   // bullet prefixes
    .trim()
}
