<template>
  <div class="auth-root overflow-y-auto overscroll-contain bg-[#0a0f1a] lg:bg-background">
    <div class="flex min-h-full flex-col lg:grid lg:grid-cols-[1.05fr_1fr]">
      <!-- Brand panel: compact hero on phones/tablets, full side panel on desktop. Always dark. -->
      <aside class="brand-panel relative overflow-hidden px-6 pb-16 sm:px-10 sm:pb-20 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div class="brand-glow-a absolute" aria-hidden="true" />
        <div class="brand-glow-b absolute" aria-hidden="true" />

        <div class="relative mx-auto w-full max-w-sm sm:max-w-md lg:mx-0 lg:max-w-none">
          <!-- Logo -->
          <div class="flex items-center gap-2.5">
            <img v-if="logoSrc" :src="logoSrc" :alt="siteName" class="logo-on-dark h-8 w-auto lg:h-9" />
            <template v-else>
              <span class="brand-dot" aria-hidden="true" />
              <span class="text-lg font-semibold tracking-tight text-white lg:text-xl">{{ siteName }}</span>
            </template>
          </div>
        </div>

        <div class="relative mx-auto mt-8 w-full max-w-sm space-y-4 sm:mt-10 sm:max-w-md lg:mx-0 lg:mt-0 lg:max-w-md lg:space-y-6">
          <h2 class="text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
            {{ headline }}
          </h2>
          <p class="hidden text-base leading-relaxed brand-muted sm:block">{{ subline }}</p>
          <ul class="hidden space-y-3 pt-2 lg:block">
            <li v-for="point in points" :key="point" class="flex items-center gap-3 text-sm text-white/90">
              <Check class="h-4 w-4 shrink-0 text-[#e87722]" aria-hidden="true" />
              {{ point }}
            </li>
          </ul>
        </div>

        <p class="relative hidden text-xs brand-muted lg:block">&copy; {{ year }} {{ siteName }}</p>
      </aside>

      <!-- Form panel: rounded sheet that slides up over the hero on phones/tablets -->
      <div
        class="form-panel relative isolate -mt-8 flex flex-1 flex-col overflow-hidden rounded-t-[2rem] bg-background dark:bg-card lg:mt-0 lg:rounded-none lg:dark:bg-background"
      >
        <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div class="form-glow" />
        </div>

        <main class="relative flex flex-1 items-start justify-center px-5 pb-6 pt-9 sm:px-8 sm:pt-12 lg:items-center lg:px-6 lg:py-10">
          <div class="auth-content w-full max-w-sm">
            <slot />
          </div>
        </main>
        <footer class="footer-safe relative flex justify-center px-4 pb-6">
          <PoweredBy />
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Check } from 'lucide-vue-next'
import PoweredBy from '@shared-ui/components/PoweredBy.vue'
import { useAppSettingsStore } from '@main/stores/appSettings'

const appSettingsStore = useAppSettingsStore()
const siteName = computed(() => appSettingsStore.public_config?.['app.site_name'] || 'libredesk')
const year = new Date().getFullYear()

// ---- LOGO -------------------------------------------------------------
// Option A (no code): Admin > Settings > General > Logo URL. It is picked up here.
// Option B: put a file in frontend/public/images/ and set its path below,
//           e.g. const LOCAL_LOGO = '/images/my-logo.png'
const LOCAL_LOGO = ''
const logoSrc = computed(() => LOCAL_LOGO || appSettingsStore.public_config?.['app.logo_url'] || '')

// ---- COPY (edit freely) -----------------------------------------------
const headline = 'Every customer conversation, in one calm inbox.'
const subline = 'Answer email, live chat and WhatsApp from a single place, on your own infrastructure.'
const points = [
  'Email, live chat and WhatsApp',
  'SLAs, automations and canned replies',
  'Open source and self-hosted'
]
</script>

<style scoped>
/* dvh keeps the layout correct when mobile browser bars show/hide */
.auth-root {
  height: 100vh;
  height: 100dvh;
}

/* ---------- Brand panel (fixed dark palette, no lines) ---------- */
.brand-panel {
  background: #0a0f1a; /* --dark-bg */
  padding-top: max(1.75rem, env(safe-area-inset-top));
}
@media (min-width: 1024px) {
  .brand-panel {
    padding-top: 3rem;
  }
}
.brand-muted {
  color: rgba(255, 255, 255, 0.55);
}
.brand-glow-a {
  width: 520px;
  height: 520px;
  top: -200px;
  left: -140px;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(232, 119, 34, 0.4), transparent 65%);
  filter: blur(20px);
}
.brand-glow-b {
  width: 420px;
  height: 420px;
  bottom: -220px;
  right: -120px;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(212, 95, 26, 0.28), transparent 65%);
  filter: blur(20px);
}
.brand-dot {
  width: 12px;
  height: 12px;
  border-radius: 9999px;
  background: #e87722; /* --orange-brand */
}
/* Turns any single-colour logo white so it shows on the dark panel.
   Remove this rule if your logo already works on dark. */
.logo-on-dark {
  filter: brightness(0) invert(1);
}

/* ---------- Form panel (follows light / dark theme) ---------- */
.form-glow {
  position: absolute;
  top: -10%;
  left: 50%;
  width: 520px;
  height: 520px;
  transform: translateX(-50%);
  border-radius: 9999px;
  background: radial-gradient(circle, hsl(var(--primary) / 0.1), transparent 65%);
  filter: blur(30px);
}
.footer-safe {
  padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
}

/* No card: the form sits directly on the page */
.auth-content > :deep(*) {
  background: transparent;
  border: 0;
  box-shadow: none;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}

/* Borderless, softly filled inputs */
.auth-content :deep(input) {
  background: hsl(var(--secondary));
  border-color: transparent;
  box-shadow: none;
}
.auth-content :deep(input:focus),
.auth-content :deep(input:focus-visible) {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--primary) / 0.55);
}

/* Touch-friendly on phones and tablets: 16px stops iOS zooming on focus,
   taller controls are easier to tap. */
@media (max-width: 1023px) {
  .auth-content :deep(input) {
    font-size: 16px;
    min-height: 2.75rem;
  }
  .auth-content :deep(button) {
    min-height: 2.75rem;
  }
}
</style>
