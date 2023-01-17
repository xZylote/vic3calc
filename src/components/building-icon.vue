<template>
  <Tooltip hover :arrow="false" :open-delay="0" placement="right">
    <!-- img should not be resizable -->
    <div style="height: max-content; width: max-content">
      <img :src="`${building[('texture' + (size || 40)) as keyof Building]}`" class="building-icon" :class="{ active }" />
    </div>
    <template #content>
      <div class="font-semibold">{{ building.humanizedName }}</div>
      <div class="text-sm flex flex-col" v-if="store.calculation.result?.[building.name]">
        <div v-for="(value, goodType) in store.calculation.result[building.name]?.output" :key="goodType">
          <div class="flex">
            <img :src="v3Data['goods'][goodType].texture25" />:
            <p class="ml-2" :class="{ 'text-green-500': value.amount > 0, 'text-red-500': value.amount < 0 }">{{ (value.amount > 0 ? '+' : '') + value.amount }}</p>
          </div>
        </div>
        <div v-for="(value, goodType) in store.calculation.result[building.name]?.input" :key="goodType">
          <div class="flex">
            <img :src="v3Data['goods'][goodType].texture25" />:
            <p class="ml-2" :class="{ 'text-red-500': value.amount > 0, 'text-green-500': value.amount < 0 }">{{ (value.amount > 0 ? '+' : '') + value.amount }}</p>
          </div>
        </div>
      </div>
    </template>
  </Tooltip>
</template>
<script setup lang="ts">
import type { PropType } from 'vue';

import { store } from '@/store';
import type { Building } from '@/v3-data';
import v3Data from '@/v3-data';

import Tooltip from './tooltip.vue';

defineProps({
  building: {
    type: Object as PropType<Building>,
    required: true,
  },
  size: {
    type: Number as PropType<25 | 32 | 40 | 64>,
    default: 40,
  },
  active: {
    type: Boolean,
    required: false,
    default: true,
  },
  tooltip: {
    type: String,
    required: false,
    default: '',
  },
});
</script>
<style scoped>
img:not(.active).building-icon {
  opacity: 0.5;
  filter: grayscale(1);
}
img.building-icon {
  min-width: 20px;
  min-height: 20px;
}
</style>
