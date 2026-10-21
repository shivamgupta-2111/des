<template>
  <div
    v-if="!isHidden"
    class="page-header shrink-0 max-lg:sticky max-lg:top-0 max-lg:z-30 max-lg:bg-background/90 max-lg:backdrop-blur-xl"
  >
    <div class="flex h-14 shrink-0 items-center gap-3 px-3 max-lg:h-[3.75rem] max-lg:px-4">
      <SidebarTrigger class="cursor-pointer max-lg:h-10 max-lg:w-10" />
      <h1 class="ui-heading min-w-0 truncate max-lg:text-xl max-lg:font-semibold max-lg:tracking-tight">
        {{ title }}
      </h1>
    </div>
    <Separator />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Separator } from '@shared-ui/components/ui/separator'
import { SidebarTrigger } from '@shared-ui/components/ui/sidebar'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t } = useI18n()
const title = computed(() => {
  const key = route.meta?.titleKey
  if (!key) return ''
  return t(key, route.meta?.titleCount || 1)
})
const isHidden = computed(() => route.meta.hidePageHeader === true)
</script>

<style scoped>
/* Keeps the header below the notch / status bar on phones that have one. */
@media (max-width: 1023px) {
  .page-header {
    padding-top: env(safe-area-inset-top, 0px);
  }
}
</style>
