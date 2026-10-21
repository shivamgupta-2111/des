<script setup>
import { computed } from 'vue'
import { normalizeMessage } from './normalizeMessage'
import { formatWhatsApp } from './whatsappFormat'

const props = defineProps({
  message: { type: Object, required: true }, // raw Libredesk message
  firstInGroup: { type: Boolean, default: true }, // draws the bubble tail
  dateLabel: { type: String, default: '' } // e.g. "Today" - shows a date chip above
})

const m = computed(() => normalizeMessage(props.message))
const isOut = computed(() => m.value.direction === 'out')
const bodyHtml = computed(() => formatWhatsApp(m.value.text || ''))

const time = computed(() =>
  m.value.createdAt
    ? new Date(m.value.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''
)

const images = computed(() => m.value.attachments.filter((a) => a.type.startsWith('image/')))
const audios = computed(() => m.value.attachments.filter((a) => a.type.startsWith('audio/')))
const videos = computed(() => m.value.attachments.filter((a) => a.type.startsWith('video/')))
const docs = computed(() =>
  m.value.attachments.filter((a) => !/^(image|audio|video)\//.test(a.type))
)

function prettySize(n) {
  if (!n) return ''
  if (n < 1024) return `${n} B`
  if (n < 1048576) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / 1048576).toFixed(1)} MB`
}
</script>

<template>
  <div class="wa-row" :class="isOut ? 'out' : 'in'">
    <div v-if="dateLabel" class="wa-date"><span>{{ dateLabel }}</span></div>

    <div
      class="wa-bubble"
      :class="[isOut ? 'out' : 'in', { tail: firstInGroup }]"
    >
      <!-- quoted reply strip -->
      <div v-if="m.replyTo" class="wa-quote">
        <div class="wa-quote-name">{{ m.replyTo.sender || 'Reply' }}</div>
        <div class="wa-quote-text">{{ m.replyTo.text }}</div>
      </div>

      <!-- images -->
      <a
        v-for="a in images"
        :key="a.url"
        :href="a.url"
        target="_blank"
        rel="noopener"
        class="wa-media"
      >
        <img :src="a.url" :alt="a.name" loading="lazy" />
      </a>

      <!-- video -->
      <video v-for="a in videos" :key="a.url" :src="a.url" controls class="wa-media" />

      <!-- voice notes -->
      <audio v-for="a in audios" :key="a.url" :src="a.url" controls class="wa-audio" />

      <!-- documents -->
      <a
        v-for="a in docs"
        :key="a.url"
        :href="a.url"
        target="_blank"
        rel="noopener"
        class="wa-doc"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
          <path
            fill="currentColor"
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm-1 7V3.5L18.5 9z"
          />
        </svg>
        <span class="wa-doc-info">
          <span class="wa-doc-name">{{ a.name }}</span>
          <span class="wa-doc-size">{{ prettySize(a.size) }}</span>
        </span>
      </a>

      <!-- text + time/ticks -->
      <div class="wa-text">
        <span v-if="m.text" v-html="bodyHtml" />
        <span class="wa-meta">
          <span class="wa-time">{{ time }}</span>
          <template v-if="isOut">
            <!-- pending -->
            <svg v-if="m.status === 'pending'" class="tick" viewBox="0 0 16 15" width="16" height="15">
              <circle cx="8" cy="7.5" r="5.5" fill="none" stroke="currentColor" stroke-width="1.3" />
              <path d="M8 4.5v3.2l2 1.3" fill="none" stroke="currentColor" stroke-width="1.3" />
            </svg>
            <!-- failed -->
            <svg v-else-if="m.status === 'failed'" class="tick failed" viewBox="0 0 16 15" width="16" height="15">
              <circle cx="8" cy="7.5" r="6" fill="currentColor" />
              <path d="M8 4.5v4M8 10.2v.6" stroke="#fff" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            <!-- sent: one tick -->
            <svg v-else-if="m.status === 'sent'" class="tick" viewBox="0 0 16 15" width="16" height="15">
              <path d="M11.1 3.3 5.7 9.9 3 7.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <!-- delivered / read: two ticks -->
            <svg v-else class="tick" :class="{ read: m.status === 'read' }" viewBox="0 0 16 15" width="16" height="15">
              <path d="M10.2 3.3 4.8 9.9 2.1 7.4M14 3.3 8.6 9.9 7.4 8.8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </template>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wa-row {
  display: flex;
  flex-direction: column;
  padding: 1px 4%;
}
.wa-row.out { align-items: flex-end; }
.wa-row.in { align-items: flex-start; }

.wa-date { align-self: center; margin: 10px 0; }
.wa-date span {
  background: var(--wa-chip);
  color: var(--wa-chip-text);
  font-size: 12.5px;
  padding: 5px 12px;
  border-radius: 8px;
  box-shadow: 0 1px 0.5px rgba(11, 20, 26, 0.13);
}

.wa-bubble {
  position: relative;
  max-width: min(65%, 520px);
  min-width: 64px;
  padding: 6px 7px 6px 9px;
  border-radius: 8px;
  font-size: 14.2px;
  line-height: 19px;
  box-shadow: 0 1px 0.5px rgba(11, 20, 26, 0.13);
  word-wrap: break-word;
  overflow-wrap: anywhere;
}
.wa-bubble.in { background: var(--wa-in); color: var(--wa-text); }
.wa-bubble.out { background: var(--wa-out); color: var(--wa-text); }

.wa-bubble.in.tail { border-top-left-radius: 0; margin-top: 6px; }
.wa-bubble.out.tail { border-top-right-radius: 0; margin-top: 6px; }
.wa-bubble.in.tail::before,
.wa-bubble.out.tail::before {
  content: '';
  position: absolute;
  top: 0;
  width: 8px;
  height: 13px;
}
.wa-bubble.in.tail::before {
  left: -8px;
  background: var(--wa-in);
  clip-path: polygon(100% 0, 100% 100%, 0 0);
}
.wa-bubble.out.tail::before {
  right: -8px;
  background: var(--wa-out);
  clip-path: polygon(0 0, 100% 0, 0 100%);
}

.wa-text { white-space: pre-wrap; }
.wa-text :deep(a) { color: var(--wa-link); text-decoration: underline; }
.wa-text :deep(.wa-mono) {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 13px;
}

/* time + ticks sit bottom-right, text wraps around them */
.wa-meta {
  float: right;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin: 6px -2px -4px 12px;
  font-size: 11px;
  line-height: 15px;
  color: var(--wa-meta);
  white-space: nowrap;
}
.tick { color: var(--wa-meta); }
.tick.read { color: #53bdeb; }
.tick.failed { color: #ea0038; }

.wa-quote {
  border-left: 4px solid #06cf9c;
  background: var(--wa-quote-bg);
  border-radius: 6px;
  padding: 4px 8px;
  margin-bottom: 4px;
  font-size: 13px;
}
.wa-quote-name { color: #06cf9c; font-weight: 500; }
.wa-quote-text {
  color: var(--wa-meta);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.wa-media { display: block; margin-bottom: 4px; }
.wa-media img, video.wa-media {
  display: block;
  max-width: 100%;
  max-height: 320px;
  border-radius: 6px;
}
.wa-audio { width: 240px; max-width: 100%; margin-bottom: 4px; }

.wa-doc {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--wa-quote-bg);
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 4px;
  color: inherit;
  text-decoration: none;
}
.wa-doc-info { display: flex; flex-direction: column; min-width: 0; }
.wa-doc-name { font-size: 13.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wa-doc-size { font-size: 11.5px; color: var(--wa-meta); }
</style>
