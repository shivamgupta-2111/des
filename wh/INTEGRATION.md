# Integration steps

I could not open the Libredesk source, so these files are new components plus
one adapter. You only wire them into your existing message list.

## 1. Copy files

Put all of these in one folder, e.g. `frontend/src/features/conversation/channel-views/`:

- normalizeMessage.js   (edit this to match your real message JSON)
- whatsappFormat.js
- WhatsAppMessage.vue
- WhatsAppThread.vue
- EmailMessage.vue

Then:  `npm i dompurify`

## 2. Find your existing message list

Search the frontend for the component that loops over messages, e.g.:

    grep -rn "messages" frontend/src --include=*.vue | grep -i "v-for"

That `v-for` renders each message bubble today. Replace the inner bubble with
the switch below.

## 3. The switch (edit your existing message list component)

```vue
<script setup>
import WhatsAppThread from './channel-views/WhatsAppThread.vue'
import WhatsAppMessage from './channel-views/WhatsAppMessage.vue'
import EmailMessage from './channel-views/EmailMessage.vue'
import { computed } from 'vue'

// `conversation.inbox_channel` is a guess. Check your conversation JSON for the
// field that says whether it is 'email', 'livechat' or 'whatsapp'.
const props = defineProps({ conversation: Object, messages: Array })
const channel = computed(() => props.conversation?.inbox_channel)

// date chip + bubble-tail helpers for WhatsApp
function dateLabel(i) {
  const cur = new Date(props.messages[i].created_at)
  const prev = i > 0 ? new Date(props.messages[i - 1].created_at) : null
  if (prev && cur.toDateString() === prev.toDateString()) return ''
  const today = new Date()
  const y = new Date(); y.setDate(today.getDate() - 1)
  if (cur.toDateString() === today.toDateString()) return 'Today'
  if (cur.toDateString() === y.toDateString()) return 'Yesterday'
  return cur.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })
}
function firstInGroup(i) {
  return i === 0 || props.messages[i].type !== props.messages[i - 1].type
}
</script>

<template>
  <WhatsAppThread v-if="channel === 'whatsapp'">
    <WhatsAppMessage
      v-for="(msg, i) in messages"
      :key="msg.uuid || msg.id"
      :message="msg"
      :first-in-group="firstInGroup(i)"
      :date-label="dateLabel(i)"
    />
  </WhatsAppThread>

  <div v-else-if="channel === 'email'">
    <EmailMessage
      v-for="(msg, i) in messages"
      :key="msg.uuid || msg.id"
      :message="msg"
      :show-subject="i === 0"
    />
  </div>

  <!-- everything else: keep your existing rendering -->
  <template v-else>
    <!-- your current v-for goes here unchanged -->
  </template>
</template>
```

Skip activity/system messages (assignments, status changes) in the loop, or
render them as a small centred grey line, the same way WhatsApp does.

## 4. Backend (Go) - only needed for WhatsApp ticks

The UI shows ticks from `message.status`. Make sure the API returns one of
`pending | sent | delivered | read | failed`, and that your WhatsApp
status webhook updates that column. If you have no WhatsApp channel yet, you
must add it first (inbox type + webhook + send function); the Libredesk docs
only describe Email and Live Chat inboxes.

## 5. Reply box

Switch the editor by channel too:

- whatsapp: plain textarea, Send button, no subject/Cc/signature
- email: keep the existing rich editor with subject, Cc/Bcc

## Known limits

- Email CSS inside HTML mails is partly stripped (style tags removed) so it
  cannot break your UI. If you need pixel-exact mail rendering, render the
  body in a sandboxed iframe instead.
- WhatsApp only allows free-form replies within 24h of the customer's last
  message; after that you must send an approved template.
