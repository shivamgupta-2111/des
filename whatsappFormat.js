// whatsappFormat.js
// Converts WhatsApp-style text to safe HTML.
// *bold*  _italic_  ~strike~  ```mono```  + auto-links + line breaks.
// HTML is escaped FIRST, so this is safe to use with v-html.

export function escapeHtml(s = '') {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function formatWhatsApp(text = '') {
  let h = escapeHtml(text)

  h = h.replace(/```([\s\S]+?)```/g, '<code class="wa-mono">$1</code>')

  const edge = '(^|[\\s(])'
  const end = '(?=$|[\\s).,!?:;])'
  h = h.replace(new RegExp(`${edge}\\*([^*\\n]+)\\*${end}`, 'g'), '$1<strong>$2</strong>')
  h = h.replace(new RegExp(`${edge}_([^_\\n]+)_${end}`, 'g'), '$1<em>$2</em>')
  h = h.replace(new RegExp(`${edge}~([^~\\n]+)~${end}`, 'g'), '$1<s>$2</s>')

  h = h.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer nofollow">$1</a>'
  )

  return h.replace(/\n/g, '<br>')
}
