<template>
  <Tooltip hover :arrow="false" :open-delay="0" placement="right">
    <!-- img should not be resizable -->
    <div style="height: max-content; width: max-content" :class="props.class">
      <img :src="`${good[('texture' + (size || 25)) as keyof typeof v3Data['goods'][GoodType]]}`" class="building-icon" :class="{ active }" />
    </div>
    <template #content>
      <div class="font-semibold">{{ good.humanizedName }}</div>
    </template>
  </Tooltip>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

import v3Data, { type Good, type GoodType } from '@/v3-data';

import Tooltip from './tooltip.vue';

const props = defineProps({
  good: {
    type: Object as PropType<Good>,
    required: true,
  },
  size: {
    type: Number as PropType<25 | 32 | 40 | 64>,
    default: 25,
  },
  active: {
    type: Boolean,
    required: false,
    default: true,
  },
  class: {
    type: String,
    required: false,
    default: '',
  },
});
</script>
