<!-- Wrap the message list of a WhatsApp conversation in this component.
     It sets the chat wallpaper colour and the colour variables the bubbles use.
     Dark mode follows the `.dark` class on <html> (shadcn/Tailwind default). -->
<template>
  <div class="wa-thread"><slot /></div>
</template>

<style>
.wa-thread {
  --wa-bg: #efeae2;
  --wa-in: #ffffff;
  --wa-out: #d9fdd3;
  --wa-text: #111b21;
  --wa-meta: #667781;
  --wa-link: #027eb5;
  --wa-chip: #ffffffe6;
  --wa-chip-text: #54656f;
  --wa-quote-bg: rgba(11, 20, 26, 0.06);

  background-color: var(--wa-bg);
  padding: 12px 0 16px;
  min-height: 100%;
}
.dark .wa-thread {
  --wa-bg: #0b141a;
  --wa-in: #202c33;
  --wa-out: #005c4b;
  --wa-text: #e9edef;
  --wa-meta: #ffffff99;
  --wa-link: #53bdeb;
  --wa-chip: #182229e6;
  --wa-chip-text: #8696a0;
  --wa-quote-bg: rgba(0, 0, 0, 0.2);
}
</style>
