// Copies text to the clipboard. Returns true on success and false if the browser
// refuses (insecure page, blocked permission), so the caller can say so honestly.
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
