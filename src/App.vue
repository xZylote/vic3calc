<template>
  <div class="justify-center w-full flex flex-col items-center">
    <div class="header w-full flex justify-center p-4">
      <div class="w-2/3 flex justify-center text-yellow-50 font-bold opacity-90">Victoria 3 Production Calculator</div>
    </div>
    <div class="flex flex-row w-full p-4">
      <div class="flex flex-col gap-2 w-full">
        <h1 class="font-semibold">Production methods</h1>
        <PmSelection></PmSelection>
      </div>
      <div class="divider divider-horizontal"></div>
      <div class="w-full flex flex-col">
        <div class="flex flex-col gap-2">
          <h1 class="font-semibold">Goods with multiple producer options</h1>
          <MultipleProducerSelection></MultipleProducerSelection>
        </div>
        <div class="divider"></div>
        <div v-if="error">
          <div class="font-semibold">{{ error }}</div>
        </div>
        <div class="flex flex-col gap-2">
          <h1 class="font-semibold">Select building and amount</h1>
          <div class="w-full flex flex-row">
            <BuildingSelection v-model="selection" />
            <div class="w-full flex flex-col text-center gap-2">
              <h1 class="font-semibold">Output</h1>
              <GoodAmount v-if="outputGoods" :goods="outputGoods" :multiplier="selection.amount"></GoodAmount>
            </div>
            <div class="w-full flex flex-col text-center gap-2">
              <h1 class="font-semibold">Input</h1>
              <GoodAmount v-if="inputGoods" :goods="inputGoods" :multiplier="selection.amount"></GoodAmount>
            </div>
          </div>
        </div>
        <div class="flex w-full flex-col gap-2 text-start justify-center">
          <h1 class="font-semibold">Calculated buildings counts</h1>
          <BuildingsAmount></BuildingsAmount>
        </div>
      </div>
    </div>
    <div class="w-full flex flex-col text-no-wrap gap-2 justify-center text-white my-footer h-32 p-4">
      <div class="w-full text-center">
        Disclaimer: all images displayed on the page are copyrighted by <a href="https://www.paradoxinteractive.com/" class="text-amber-800 hover:text-amber-500">Paradox Interactive</a>
      </div>
      <div class="w-full text-center">
        Favicon <img src="/favicon.ico" class="inline-block w-6" /> made by <a class="text-amber-800 hover:text-amber-500" href="https://www.steamgriddb.com/icon/24061" target="blank">TroyDaGamer</a>
      </div>
      <div class="w-full flex flex-row items-center justify-center">
        <div class="w-full flex gap-2 text-amber-800 hover:text-amber-500 justify-end">
          <a href="https://www.paradoxinteractive.com/games/victoria-3/about" target="blank">Victoria 3</a>
        </div>
        <div class="divider divider-horizontal gap-0"></div>
        <div class="w-full flex gap-2 text-amber-800 hover:text-amber-500 justify-start">
          <a href="https://github.com/xZylote/vic3calc" target="blank">Github</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import BuildingSelection from '@/components/building-selection.vue';
import GoodAmount from '@/components/goods-amount.vue';
import MultipleProducerSelection from '@/components/multiple-producer-selection.vue';
import PmSelection from '@/components/pm-selection.vue';
import { entries } from '@/utils';

import { type GoodsProducerMap, Calculator } from './calculator';
import BuildingsAmount from './components/buildings-amount.vue';
import { MULTIPLE_PRODUCER_PREFERENCE_LOCAL_STORAGE_KEY, PRODUCTION_METHOD_LOCAL_STORAGE_KEY } from './production-preferences';
import { store } from './store';
import type { GoodType, ProductionBuildingType } from './v3-data';

const selection = ref({ amount: 100, buildingType: 'building_coal_mine' as ProductionBuildingType });
const error = ref('');

const outputGoods = computed(() => {
  const output = store.calculation.result[selection.value.buildingType]?.output;
  let arr: { goodType: GoodType; amount: number }[] = [];
  if (output) {
    entries(output).forEach((entry) => {
      if (entry && Array.isArray(entry) && entry.length === 2) {
        arr.push({ goodType: entry[0], amount: entry[1].amount });
      }
    });
  }
  return arr;
});
const inputGoods = computed(() => {
  const map = store.calculation.result[selection.value.buildingType];
  return entries(map?.input || ({} as GoodsProducerMap['input'])).map(([goodType, { amount }]) => {
    return { goodType, amount };
  });
});

watch(store.productionPreferences, () => {
  // cache production preferences
  localStorage.setItem(PRODUCTION_METHOD_LOCAL_STORAGE_KEY, JSON.stringify(store.productionPreferences));
  calculate();
});
watch(store.multipleProducerPreferences, () => {
  // cache multiple producer preferences
  localStorage.setItem(MULTIPLE_PRODUCER_PREFERENCE_LOCAL_STORAGE_KEY, JSON.stringify(store.multipleProducerPreferences));
  calculate();
});

function calculate() {
  try {
    const ret = Calculator.calculate([selection.value]);
    store.setCalculation(ret);
    error.value = '';
    return ret;
  } catch (e: any) {
    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    error.value = e.message;
    console.error(e);
  }
}
watch(selection, () => calculate());
onMounted(() => calculate()); // initial calculation
</script>
<style scoped>
.header {
  background-image: url('/images/header-bg.jpg');
}
.my-footer {
  background-image: url('/images/header-bg.jpg');
}
.my-footer .divider:before,
.my-footer .divider:after {
  @apply bg-amber-800 bg-opacity-30;
}
</style>
