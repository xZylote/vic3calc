<template>
  <div class="flex w-full flex-row flex-wrap items-center gap-2">
    <div class="flex flex-row items-center gap-1" v-for="[buildingType, producer] in resultsSorted" :key="buildingType">
      <BuildingIcon :building="v3Data.buildings[buildingType]" :size="40" show-input-output />
      <div class="flex w-20 justify-start">
        <div class="kbd flex flex-row whitespace-nowrap bg-amber-50 bg-opacity-50">x {{ formatBuildingAmount(producer) }}</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';

import type { ProductionBuildingData } from '@/calculator';
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
function formatBuildingAmount(producer: ProductionBuildingData) {
  return producer.totalBuildingsNeeded.toFixed(2);
}
</script>
