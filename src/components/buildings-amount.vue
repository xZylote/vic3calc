<template>
  <div class="w-full flex flex-wrap flex-row items-center gap-2">
    <div class="flex flex-row items-center gap-1" v-for="[buildingType, producer] in resultsSorted" :key="buildingType">
      <BuildingIcon :building="v3Data.buildings[buildingType]" :size="32" />
      <div class="w-20 flex justify-start">x {{ formatBuildingAmount(producer) }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';

import type { GoodsProducerMap } from '@/calculator';
import BuildingIcon from '@/components/building-icon.vue';
import { store } from '@/store';
import { entries } from '@/utils';
import v3Data from '@/v3-data';
const resultsSorted = computed(() => {
  const all = entries(store.calculation.result);
  // sort by totalBuildingsNeeded, descending
  all.sort(([, { totalBuildingsNeeded: neededA }], [, { totalBuildingsNeeded: neededB }]) => ((neededA ?? 0) > (neededB ?? 0) ? -1 : 1));
  return all;
});
function formatBuildingAmount(producer: GoodsProducerMap) {
  return producer.totalBuildingsNeeded.toFixed(2);
}
</script>
