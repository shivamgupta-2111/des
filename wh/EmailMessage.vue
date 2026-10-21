<script setup>
// Requires:  npm i dompurify
import { computed, ref } from 'vue'
import DOMPurify from 'dompurify'
import { normalizeMessage } from './normalizeMessage'
import { escapeHtml } from './whatsappFormat'

const props = defineProps({
  message: { type: Object, required: true }, // raw Libredesk message
  showSubject: { type: Boolean, default: false } // true for the first message in the thread
})

const m = computed(() => normalizeMessage(props.message))
const isOut = computed(() => m.value.direction === 'out')
const showQuoted = ref(false)
const showDetails = ref(false)

const initials = computed(() =>
  (m.value.sender.name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
)

const fullDate = computed(() =>
  m.value.createdAt
    ? new Date(m.value.createdAt).toLocaleString([], {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : ''
)

// Split the body into "what the person wrote" and "quoted history + signature"
const parts = computed(() => {
  const raw = m.value.html ?? `<p>${escapeHtml(m.value.text).replace(/\n/g, '<br>')}</p>`
  const clean = DOMPurify.sanitize(raw, {
    FORBID_TAGS: ['style', 'link', 'form', 'iframe'],
    FORBID_ATTR: ['srcset'],
    ADD_ATTR: ['target']
  })

  const doc = new DOMParser().parseFromString(clean, 'text/html')
  const sel =
    'blockquote, .gmail_quote, .gmail_extra, .yahoo_quoted, #divRplyFwdMsg, #appendonsend, div[type="cite"]'
  const first = doc.body.querySelector(sel)

  let quoted = ''
  if (first) {
    // take the quote and everything after it
    const nodes = [first]
    let n = first.nextSibling
    while (n) {
      nodes.push(n)
      n = n.nextSibling
    }
    quoted = nodes.map((x) => x.outerHTML || x.textContent || '').join('')
    nodes.forEach((x) => x.remove())
  }

  // open links in a new tab, safely
  doc.body.querySelectorAll('a').forEach((a) => {
    a.setAttribute('target', '_blank')
    a.setAttribute('rel', 'noopener noreferrer nofollow')
  })

  return { main: doc.body.innerHTML, quoted }
})

function prettySize(n) {
  if (!n) return ''
  if (n < 1024) return `${n} B`
  if (n < 1048576) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / 1048576).toFixed(1)} MB`
}
</script>

<template>
  <article class="em-card" :class="{ out: isOut }">
    <h2 v-if="showSubject && m.subject" class="em-subject">{{ m.subject }}</h2>

    <header class="em-head">
      <div class="em-avatar" :class="{ out: isOut }">{{ initials }}</div>

      <div class="em-from">
        <div class="em-from-line">
          <strong>{{ m.sender.name }}</strong>
          <span v-if="m.sender.email" class="em-addr">&lt;{{ m.sender.email }}&gt;</span>
        </div>
        <button class="em-to" type="button" @click="showDetails = !showDetails">
          to {{ m.to.length ? m.to.join(', ') : 'me' }}
          <span class="em-caret">{{ showDetails ? '▴' : '▾' }}</span>
        </button>
      </div>

      <time class="em-date">{{ fullDate }}</time>
    </header>

    <dl v-if="showDetails" class="em-details">
      <dt>from:</dt><dd>{{ m.sender.name }} &lt;{{ m.sender.email }}&gt;</dd>
      <dt>to:</dt><dd>{{ m.to.join(', ') }}</dd>
      <template v-if="m.cc.length"><dt>cc:</dt><dd>{{ m.cc.join(', ') }}</dd></template>
      <dt>date:</dt><dd>{{ fullDate }}</dd>
      <template v-if="m.subject"><dt>subject:</dt><dd>{{ m.subject }}</dd></template>
    </dl>

    <div class="em-body" v-html="parts.main" />

    <template v-if="parts.quoted">
      <button
        class="em-dots"
        type="button"
        :aria-expanded="showQuoted"
        title="Show trimmed content"
        @click="showQuoted = !showQuoted"
      >
        •••
      </button>
      <div v-if="showQuoted" class="em-body em-quoted" v-html="parts.quoted" />
    </template>

    <footer v-if="m.attachments.length" class="em-files">
      <a
        v-for="a in m.attachments"
        :key="a.url"
        :href="a.url"
        target="_blank"
        rel="noopener"
        class="em-file"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path fill="currentColor" d="M16.5 6v11.5a4 4 0 0 1-8 0V5a2.5 2.5 0 0 1 5 0v10.5a1 1 0 0 1-2 0V6H10v9.5a2.5 2.5 0 0 0 5 0V5a4 4 0 0 0-8 0v12.5a5.5 5.5 0 0 0 11 0V6z" />
        </svg>
        <span class="em-file-name">{{ a.name }}</span>
        <span class="em-file-size">{{ prettySize(a.size) }}</span>
      </a>
    </footer>
  </article>
</template>

<style scoped>
.em-card {
  background: var(--em-bg, #fff);
  color: var(--em-text, #202124);
  border: 1px solid var(--em-border, #dadce0);
  border-radius: 8px;
  padding: 16px 20px 14px;
  margin: 10px 12px;
}
.em-card.out { border-left: 3px solid #1a73e8; }
:global(.dark) .em-card {
  --em-bg: #1f1f1f;
  --em-text: #e8eaed;
  --em-border: #3c4043;
}

.em-subject { font-size: 20px; font-weight: 400; margin: 0 0 14px; line-height: 1.3; }

.em-head { display: flex; align-items: flex-start; gap: 12px; }
.em-avatar {
  flex: none;
  width: 40px; height: 40px;
  border-radius: 50%;
  display: grid; place-items: center;
  background: #8e24aa; color: #fff;
  font-size: 15px; font-weight: 500;
}
.em-avatar.out { background: #1a73e8; }

.em-from { flex: 1; min-width: 0; }
.em-from-line { font-size: 14px; }
.em-addr { color: #5f6368; font-size: 12.5px; margin-left: 6px; }
.em-to {
  background: none; border: 0; padding: 0; cursor: pointer;
  font-size: 12.5px; color: #5f6368;
}
.em-caret { font-size: 10px; }
.em-date { flex: none; font-size: 12.5px; color: #5f6368; white-space: nowrap; }

.em-details {
  display: grid; grid-template-columns: auto 1fr; gap: 2px 10px;
  margin: 10px 0 0 52px; padding: 8px 12px;
  font-size: 12.5px; color: #5f6368;
  border: 1px solid var(--em-border, #dadce0); border-radius: 6px;
}
.em-details dt { text-align: right; }
.em-details dd { margin: 0; color: var(--em-text, #202124); }

.em-body {
  margin: 14px 0 0 52px;
  font-size: 14px; line-height: 1.55;
  overflow-x: auto;
  word-wrap: break-word;
}
.em-body :deep(img) { max-width: 100%; height: auto; }
.em-body :deep(a) { color: #1a73e8; }
.em-body :deep(table) { max-width: 100%; }
.em-body :deep(p) { margin: 0 0 0.8em; }
.em-quoted :deep(blockquote) {
  margin: 0 0 0 4px; padding-left: 12px; border-left: 2px solid #dadce0; color: #5f6368;
}

.em-dots {
  margin: 10px 0 0 52px;
  background: #e8eaed; border: 0; border-radius: 10px;
  padding: 0 8px; height: 14px; line-height: 10px;
  font-size: 11px; letter-spacing: 1px; color: #5f6368; cursor: pointer;
}
:global(.dark) .em-dots { background: #3c4043; color: #bdc1c6; }

.em-files { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0 0 52px; }
.em-file {
  display: inline-flex; align-items: center; gap: 8px;
  max-width: 260px; padding: 8px 12px;
  border: 1px solid var(--em-border, #dadce0); border-radius: 8px;
  font-size: 12.5px; color: inherit; text-decoration: none;
}
.em-file:hover { background: rgba(128, 128, 128, 0.1); }
.em-file-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.em-file-size { color: #5f6368; }

@media (max-width: 600px) {
  .em-body, .em-files, .em-dots, .em-details { margin-left: 0; }
  .em-head { flex-wrap: wrap; }
}
</style>
