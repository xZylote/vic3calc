<template>
  <Tooltip hover :arrow="false" :open-delay="0" placement="right" :disabled="disableTooltip">
    <!-- img should not be resizable -->
    <div style="height: max-content; width: max-content">
      <img :src="`${building[('texture' + (size || 40)) as keyof Building]}`" class="building-icon" :alt="building.humanizedName" :class="{ active }" />
    </div>
    <template #content>
      <div class="font-semibold">{{ building.humanizedName }}</div>
      <template v-if="showInputOutput">
        <div class="flex flex-col text-sm" v-if="store.buildingInputOutputMap[building.name]">
          <div v-for="(value, goodType) in store.buildingInputOutputMap[building.name]?.output" :key="goodType">
            <div class="flex">
              <img :src="v3Data['goods'][goodType].texture25" :alt="v3Data['goods'][goodType].humanizedName" />:
              <p class="ml-2" :class="{ 'text-green-500': value > 0, 'text-red-500': value < 0 }">{{ (value > 0 ? '+' : '') + value }}</p>
            </div>
          </div>
          <div v-for="(value, goodType) in store.buildingInputOutputMap[building.name]?.input" :key="goodType">
            <div class="flex">
              <img :src="v3Data['goods'][goodType].texture25" :alt="v3Data['goods'][goodType].humanizedName" />:
              <p class="ml-2" :class="{ 'text-red-500': value > 0, 'text-green-500': value < 0 }">{{ (value > 0 ? '+' : '') + value }}</p>
            </div>
          </div>
        </div>
      </template>
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
  disableTooltip: {
    type: Boolean,
    required: false,
    default: false,
  },
  showInputOutput: {
    type: Boolean,
    required: false,
    default: false,
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
