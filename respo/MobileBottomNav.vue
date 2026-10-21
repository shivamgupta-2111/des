<template>
  <nav
    class="mobile-nav relative z-40 shrink-0 border-t border-border bg-card/90 backdrop-blur-xl"
    aria-label="Main"
  >
    <ul class="mx-auto flex h-16 max-w-xl items-stretch justify-around px-2">
      <template v-for="(entry, i) in entries" :key="entry.key">
        <!-- Compose button -->
        <li v-if="entry.type === 'compose'" class="flex flex-1 items-center justify-center">
          <button
            type="button"
            class="compose-btn flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95"
            :aria-label="t('conversation.newConversation')"
            @click="openCompose"
          >
            <Plus class="h-6 w-6" aria-hidden="true" />
          </button>
        </li>

        <!-- Nav tab -->
        <li v-else class="flex flex-1">
          <router-link
            :to="entry.to"
            class="tab relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition-colors active:bg-accent"
            :class="entry.isActive ? 'text-primary' : 'text-muted-foreground'"
            :aria-current="entry.isActive ? 'page' : undefined"
          >
            <span
              class="absolute top-0 h-0.5 w-8 rounded-b-full bg-primary transition-opacity"
              :class="entry.isActive ? 'opacity-100' : 'opacity-0'"
              aria-hidden="true"
            />
            <component :is="entry.icon" class="h-5 w-5" :stroke-width="entry.isActive ? 2.4 : 2" aria-hidden="true" />
            <span class="max-w-full truncate px-1">{{ entry.label }}</span>
          </router-link>
        </li>
      </template>
    </ul>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStorage } from '@vueuse/core'
import { Inbox, Shield, FileLineChart, BookUser, Plus } from 'lucide-vue-next'
import { useUserStore } from '@main/stores/user'
import { useEmitter } from '@main/composables/useEmitter'
import { EMITTER_EVENTS } from '@main/constants/emitterEvents'
import { permissions } from '@main/constants/permissions'

const route = useRoute()
const { t } = useI18n()
const userStore = useUserStore()
const emitter = useEmitter()
const lastInboxPath = useStorage('lastInboxPath', '')

// Same destinations and permission checks as the desktop rail (PrimaryNavItems),
// but the inbox link always returns to the list, never into an open conversation.
const inboxTarget = computed(
  () => lastInboxPath.value.replace(/\/conversation\/[^/]+$/, '') || { name: 'inboxes' }
)

const tabs = computed(() =>
  [
    { key: 'inboxes', icon: Inbox, label: t('globals.terms.inbox', 2), to: inboxTarget.value,
      isActive: route.path.startsWith('/inboxes'), show: true },
    { key: 'contacts', icon: BookUser, label: t('globals.terms.contact', 2), to: { name: 'contacts' },
      isActive: route.path.startsWith('/contacts'), show: userStore.can('contacts:read_all') },
    { key: 'reports', icon: FileLineChart, label: t('globals.terms.report', 2), to: { name: 'reports' },
      isActive: route.path.startsWith('/reports'), show: userStore.hasReportTabPermissions },
    { key: 'admin', icon: Shield, label: t('globals.terms.admin'),
      to: { name: userStore.can('general_settings:manage') ? 'general' : 'admin' },
      isActive: route.path.startsWith('/admin'), show: userStore.hasAdminTabPermissions }
  ].filter((x) => x.show).map((x) => ({ ...x, type: 'tab' }))
)

const canCompose = computed(() => userStore.can(permissions.CONVERSATIONS_WRITE))

// Compose button sits in the middle of the bar.
const entries = computed(() => {
  const list = [...tabs.value]
  if (canCompose.value) {
    list.splice(Math.ceil(list.length / 2), 0, { key: 'compose', type: 'compose' })
  }
  return list
})

const openCompose = () => emitter.emit(EMITTER_EVENTS.OPEN_CREATE_CONVERSATION, {})
</script>

<style scoped>
/* Keeps the bar clear of the home indicator on phones that have one. */
.mobile-nav {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.compose-btn {
  box-shadow: 0 6px 20px hsl(var(--primary) / 0.45);
}
</style>
