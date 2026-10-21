// normalizeMessage.js
//
// The ONLY file you should need to edit to match Libredesk's real message shape.
// Open your browser DevTools -> Network, click a conversation, look at the
// messages JSON, and fix the field names below if they differ.

export function normalizeMessage(m) {
  const isHtml = (m.content_type || '').toLowerCase() === 'html'
  const meta = typeof m.meta === 'string' ? safeJson(m.meta) : m.meta || {}

  return {
    id: m.uuid ?? m.id,

    // 'out' = sent by agent, 'in' = sent by customer
    direction: m.type === 'outgoing' ? 'out' : 'in',

    html: isHtml ? m.content : null,
    text: m.text_content ?? (isHtml ? '' : m.content ?? ''),

    createdAt: m.created_at,

    // WhatsApp ticks. Expected: pending | sent | delivered | read | failed
    // (Libredesk's own values may be pending/sent/received/failed - map them here)
    status: mapStatus(m.status),

    sender: {
      name: m.sender?.first_name
        ? `${m.sender.first_name} ${m.sender.last_name || ''}`.trim()
        : meta.from_name || meta.from || 'Unknown',
      email: m.sender?.email || meta.from || ''
    },

    // Email-only
    subject: meta.subject || m.subject || '',
    to: toList(meta.to),
    cc: toList(meta.cc),

    attachments: (m.attachments || []).map((a) => ({
      name: a.filename || a.name,
      url: a.url,
      type: a.content_type || a.type || '',
      size: a.size || 0
    })),

    // Optional: message this one replies to (WhatsApp quoted reply)
    replyTo: m.reply_to || meta.reply_to || null
  }
}

function mapStatus(s) {
  switch ((s || '').toLowerCase()) {
    case 'read':
      return 'read'
    case 'delivered':
    case 'received':
      return 'delivered'
    case 'sent':
      return 'sent'
    case 'failed':
      return 'failed'
    default:
      return 'pending'
  }
}

function toList(v) {
  if (!v) return []
  return Array.isArray(v) ? v : String(v).split(',').map((s) => s.trim())
}

function safeJson(s) {
  try {
    return JSON.parse(s)
  } catch {
    return {}
  }
}
