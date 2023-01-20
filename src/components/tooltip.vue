<template>
  <Popper hover :arrow="false" :open-delay="0" placement="right" :disabled="disabled">
    <slot name="default"></slot>
    <template #content>
      <div class="box text-amber-50">
        <div class="relative p-3">
          <slot name="content"></slot>
        </div>
      </div>
    </template>
  </Popper>
</template>

<script setup lang="ts">
import Popper from 'vue3-popper';

defineProps({
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
});
</script>
<style scoped>
:deep(.popper) {
  padding: 20px;
  border-radius: 0px;
  color: #fff;
}
:deep(.popper #arrow::before) {
  background: #703c00;
}
.box {
  position: relative;
  --mask: radial-gradient(8px at 8px 8px, #0000 98%, #000) -8px -8px;
  -webkit-mask: var(--mask);
  mask: var(--mask);
}
.box:before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('/images/header-bg.jpg');
  -webkit-mask: var(--mask);
  mask: var(--mask);
}
</style>
