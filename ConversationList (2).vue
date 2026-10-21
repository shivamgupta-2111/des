frontend\apps\main\src\features\conversation\list\ConversationList.vu

<template>
  <div class="flex h-full min-h-0 flex-col">
    <!-- Header -->
    <div
      class="list-header flex h-14 shrink-0 items-center gap-3 border-b border-border px-3 max-lg:h-[3.75rem] max-lg:bg-background/90 max-lg:px-4 max-lg:backdrop-blur-xl"
    >
      <SidebarTrigger class="cursor-pointer max-lg:h-10 max-lg:w-10" />
      <h1
        class="ui-heading min-w-0 truncate max-lg:text-xl max-lg:font-semibold max-lg:tracking-tight"
        :title="title"
      >
        {{ title }}
      </h1>
    </div>

    <!-- Quick filter chips (hidden when bulk selecting) -->
    <div
      v-if="!hasSelection"
      class="quick-filters flex shrink-0 gap-2 overflow-x-auto border-b border-border px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-lg:px-4 max-lg:py-2.5"
      role="group"
      aria-label="Quick filters"
    >
      <button
        v-for="chip in chips"
        :key="chip.key"
        type="button"
        class="inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-xs font-medium transition-colors active:scale-95 max-lg:h-9 max-lg:text-[13px]"
        :class="
          isChipActive(chip.key)
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-muted-foreground can-hover:hover:bg-accent can-hover:hover:text-foreground'
        "
        :aria-pressed="isChipActive(chip.key)"
        @click="selectChip(chip.key)"
      >
        <component :is="chip.icon" v-if="chip.icon" class="size-3.5 shrink-0" aria-hidden="true" />
        <span>{{ chip.label }}</span>
        <span
          v-if="chip.count"
          class="min-w-[1.25rem] rounded-full px-1.5 text-center text-[10px] font-semibold tabular-nums leading-5"
          :class="
            isChipActive(chip.key)
              ? 'bg-primary-foreground/20 text-primary-foreground'
              : 'bg-primary text-primary-foreground'
          "
        >
          {{ chip.count > 99 ? '99+' : chip.count }}
        </span>
      </button>
    </div>

    <!-- Bulk Action Toolbar (when items selected) -->
    <ConversationBulkActionToolbar v-if="hasSelection && canBulkAct" />

    <!-- Filters (hidden when bulk selecting) -->
    <div v-else class="flex shrink-0 items-center justify-between gap-2 border-b border-border p-2">
      <!-- Status dropdown-menu, hidden when a view is selected as views are pre-filtered -->
      <DropdownMenu v-if="!route.params.viewID">
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="sm" :class="FILTER_TRIGGER_CLASS">
            <div class="min-w-0 truncate">
              <span class="mr-1 tabular-nums">{{ conversationStore.conversations.total }}</span>
              <span>{{ conversationStore.getListStatus }}</span>
            </div>
            <ChevronDown class="size-3.5 shrink-0 opacity-50" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            v-for="status in conversationStore.statusOptions"
            :key="status.value"
            @click="handleStatusChange(status)"
          >
            {{ status.label }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div v-else>
        <Button type="button" variant="ghost" size="sm" class="text-xs">
          <span class="tabular-nums">{{ conversationStore.conversations.total }}</span>
        </Button>
      </div>

      <!-- Sort dropdown-menu -->
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="sm" :class="FILTER_TRIGGER_CLASS">
            <span class="truncate" :title="conversationStore.getListSortField">{{
              conversationStore.getListSortField
            }}</span>
            <ChevronDown class="size-3.5 shrink-0 opacity-50" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem @click="handleSortChange('oldest')">
            {{ $t('conversation.sort.oldestActivity') }}
          </DropdownMenuItem>
          <DropdownMenuItem @click="handleSortChange('newest')">
            {{ $t('conversation.sort.newestActivity') }}
          </DropdownMenuItem>
          <DropdownMenuItem @click="handleSortChange('started_first')">
            {{ $t('conversation.sort.startedFirst') }}
          </DropdownMenuItem>
          <DropdownMenuItem @click="handleSortChange('started_last')">
            {{ $t('conversation.sort.startedLast') }}
          </DropdownMenuItem>
          <DropdownMenuItem @click="handleSortChange('waiting_longest')">
            {{ $t('conversation.sort.waitingLongest') }}
          </DropdownMenuItem>
          <DropdownMenuItem @click="handleSortChange('next_sla_target')">
            {{ $t('conversation.sort.nextSLATarget') }}
          </DropdownMenuItem>
          <DropdownMenuItem @click="handleSortChange('priority_first')">
            {{ $t('conversation.sort.priorityFirst') }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <!-- Content -->
    <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <EmptyList
        v-if="showEmpty"
        key="empty"
        class="px-4 py-8"
        :title="t('conversation.noConversationsFound')"
        :message="t('conversation.tryAdjustingFilters')"
        :icon="Inbox"
      />

      <EmptyList
        v-if="hasErrored"
        key="error"
        class="px-4 py-8"
        :title="t('conversation.couldNotFetch')"
        :message="conversationStore.conversations.errorMessage"
        :icon="MessageCircleWarning"
      />

      <div
        v-if="!hasErrored && !conversationStore.conversations.loading"
        class="divide-y divide-border"
        :class="{ 'border-b border-border': hasConversations }"
      >
        <ConversationListItem
          v-for="conversation in visibleConversations"
          :key="conversation.uuid"
          :conversation="conversation"
          :currentConversation="conversationStore.current"
          :contactFullName="conversationStore.getContactFullName(conversation.uuid)"
          class="transition-colors duration-200"
        />
      </div>

      <div v-if="conversationStore.conversations.loading">
        <ConversationListItemSkeleton v-for="i in 12" :key="i" :index="i - 1" />
      </div>

      <!-- Load More -->
      <div
        v-if="!hasErrored && (conversationStore.conversations.hasMore || hasConversations)"
        class="flex justify-center items-center p-5"
      >
        <Button
          v-if="conversationStore.conversations.hasMore"
          type="button"
          variant="ghost"
          size="sm"
          @click="conversationStore.fetchNextConversations"
          :disabled="conversationStore.conversations.fetching"
          :aria-busy="conversationStore.conversations.fetching || undefined"
          class="text-muted-foreground max-md:h-11 [&_svg]:size-3.5"
        >
          <Loader2
            v-if="conversationStore.conversations.fetching"
            class="animate-spin"
            aria-hidden="true"
          />
          {{
            conversationStore.conversations.fetching
              ? t('globals.terms.loading')
              : t('globals.terms.loadMore')
          }}
        </Button>
        <p
          class="text-sm text-muted-foreground"
          v-else-if="conversationStore.conversationsList.length > 10"
        >
          {{ $t('conversation.allLoaded') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
const FILTER_TRIGGER_CLASS = 'min-w-0 justify-start gap-1.5 px-2 text-xs'

import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  Inbox,
  MessageCircleWarning,
  ChevronDown,
  Loader2,
  Mail,
  UserCheck,
  UserX,
  Hourglass,
  Flag,
  AlarmClock
} from 'lucide-vue-next'
import { Button } from '@shared-ui/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@shared-ui/components/ui/dropdown-menu'
import { SidebarTrigger } from '@shared-ui/components/ui/sidebar'
import { useConversationStore } from '@/stores/conversation'
import { useTeamStore } from '@/stores/team'
import { useInboxStore } from '@/stores/inbox'
import { useUserStore } from '@/stores/user'
import { CHANNEL_ICONS } from '@main/constants/channelIcons.js'
import { useBulkActionPermissions } from '@/composables/useBulkActionPermissions'
import EmptyList from '@/features/conversation/list/ConversationEmptyList.vue'
import ConversationBulkActionToolbar from '@/features/conversation/list/ConversationBulkActionToolbar.vue'
import ConversationListItem from '@/features/conversation/list/ConversationListItem.vue'
import ConversationListItemSkeleton from '@/features/conversation/list/ConversationListItemSkeleton.vue'

const conversationStore = useConversationStore()
const teamStore = useTeamStore()
const inboxStore = useInboxStore()
const userStore = useUserStore()
const { canBulkAct } = useBulkActionPermissions()
const route = useRoute()
const { t } = useI18n()

watch(
  () => conversationStore.conversationsList
    .filter((conversation) => !conversation.assigned_user_id)
    .map((conversation) => conversation.assigned_team_id),
  teamStore.ensureTeamIDs,
  { immediate: true }
)

const hasSelection = computed(() => conversationStore.selectedCount > 0)

const title = computed(() => {
  const typeKey = route.meta?.typeKey?.(route)
  if (typeKey) {
    return t(typeKey)
  }
  const key = route.meta?.titleKey
  if (!key) return ''
  return t(key, route.meta?.titleCount || 1)
})

const handleStatusChange = (status) => {
  conversationStore.setListStatus(status.label)
}

const handleSortChange = (order) => {
  conversationStore.setListSortField(order)
}

// ---- Quick filter chips -------------------------------------------------
// Chips can be combined (e.g. Unread + WhatsApp + Assigned to me). Selected channels are OR-ed
// together, every other chip narrows the result further (AND). They filter the rows already
// loaded in the list; status and sort stay server-side. Channel chips only appear for channels
// you actually have an inbox for.
const activeChips = ref([])
const MIN_VISIBLE = 12 // keep fetching pages until this many rows match...
const MAX_AUTO_LOADS = 4 // ...but never more than this many extra pages per change
const SLA_RISK_WINDOW_MS = 60 * 60 * 1000 // overdue, or due within the next hour
const HIGH_PRIORITIES = ['high', 'urgent']
const CHANNEL_KEYS = ['email', 'whatsapp', 'livechat']
let autoLoads = 0

const hasSlaRisk = (c) => {
  if (c.resolved_at) return false
  const now = Date.now()
  return [
    [c.first_response_deadline_at, c.first_reply_at],
    [c.resolution_deadline_at, c.resolved_at],
    [c.next_response_deadline_at, c.next_response_met_at]
  ].some(([due, done]) => due && !done && Date.parse(due) - now <= SLA_RISK_WINDOW_MS)
}

const predicates = {
  unread: (c) => c.unread_message_count > 0,
  mine: (c) => !!userStore.userID && String(c.assigned_user_id) === String(userStore.userID),
  unassigned: (c) => !c.assigned_user_id,
  waiting: (c) => !!c.waiting_since,
  priority: (c) => HIGH_PRIORITIES.includes(String(c.priority || '').toLowerCase()),
  sla: hasSlaRisk
}

const availableChannels = computed(() => new Set(inboxStore.inboxes.map((inbox) => inbox.channel)))
const countOf = (key) => conversationStore.conversationsList.filter(predicates[key]).length

const chips = computed(() => [
  { key: 'all', label: t('globals.messages.all') },
  { key: 'unread', label: 'Unread', count: countOf('unread') },
  ...[
    { key: 'email', label: t('globals.terms.email', 1), icon: Mail },
    { key: 'whatsapp', label: t('globals.terms.whatsapp'), icon: CHANNEL_ICONS.whatsapp },
    { key: 'livechat', label: t('globals.terms.liveChat'), icon: CHANNEL_ICONS.livechat }
  ].filter((c) => availableChannels.value.has(c.key)),
  { key: 'mine', label: 'Assigned to me', icon: UserCheck },
  { key: 'unassigned', label: t('globals.terms.unassigned'), icon: UserX },
  { key: 'waiting', label: t('globals.terms.waiting'), icon: Hourglass, count: countOf('waiting') },
  { key: 'priority', label: t('globals.terms.priority', 1), icon: Flag },
  { key: 'sla', label: t('globals.terms.sla', 1), icon: AlarmClock, count: countOf('sla') }
])

const isChipActive = (key) =>
  key === 'all' ? activeChips.value.length === 0 : activeChips.value.includes(key)

const visibleConversations = computed(() => {
  const list = conversationStore.conversationsList
  const active = activeChips.value
  if (active.length === 0) return list
  const channels = active.filter((k) => CHANNEL_KEYS.includes(k))
  const others = active.filter((k) => !CHANNEL_KEYS.includes(k))
  return list.filter(
    (c) =>
      (channels.length === 0 || channels.includes(c.inbox_channel)) &&
      others.every((k) => predicates[k](c))
  )
})

const selectChip = (key) => {
  if (key === 'all') activeChips.value = []
  else if (activeChips.value.includes(key)) activeChips.value = activeChips.value.filter((k) => k !== key)
  else activeChips.value = [...activeChips.value, key]
  autoLoads = 0
}

// Start fresh when switching to a different inbox / team / view (not when opening a conversation).
watch(
  () => route.path.replace(/\/conversation\/.*$/, ''),
  () => {
    activeChips.value = []
    autoLoads = 0
  }
)

// If the chips leave the screen nearly empty, quietly load a few more pages.
watch(
  () => [
    visibleConversations.value.length,
    conversationStore.conversations.hasMore,
    conversationStore.conversations.fetching,
    activeChips.value.length
  ],
  ([count, hasMore, fetching, activeCount]) => {
    if (activeCount === 0 || fetching || !hasMore || count >= MIN_VISIBLE || autoLoads >= MAX_AUTO_LOADS) return
    autoLoads++
    conversationStore.fetchNextConversations()
  }
)

const hasConversations = computed(() => visibleConversations.value.length !== 0)
const hasErrored = computed(() => !!conversationStore.conversations.errorMessage)
const showEmpty = computed(
  () =>
    !hasConversations.value &&
    !hasErrored.value &&
    !conversationStore.conversations.loading &&
    conversationStore.conversations.initialized &&
    !(activeChips.value.length > 0 && conversationStore.conversations.fetching)
)
</script>
