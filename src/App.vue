<template>
  <div class="flex w-full flex-col items-center justify-center">
    <div class="header flex h-14 w-full justify-center p-4">
      <div class="flex w-2/3 justify-center font-bold text-yellow-50 opacity-90">Victoria 3 Production Calculator</div>
    </div>
    <div class="container">
      <div class="flex w-full flex-row justify-center justify-items-center gap-8 p-4">
        <div class="flex w-full flex-col gap-2 overflow-y-scroll">
          <h1 class="font-semibold">Production methods</h1>
          <PmSelection></PmSelection>
        </div>
        <div class="flex w-full flex-col">
          <div class="flex flex-col gap-2">
            <h1 class="font-semibold">Goods with multiple producer options</h1>
            <MultipleProducerSelection></MultipleProducerSelection>
          </div>
          <div class="divider"></div>
          <div v-if="error" class="alert alert-error">
            <div class="font-semibold">{{ error }}</div>
          </div>
          <div class="flex flex-col gap-2">
            <h1 class="font-semibold">Select building and amount</h1>
            <TransitionGroup name="list" tag="div" @before-enter="onBeforeEnter" @enter="onEnter" @leave="onLeave" class="flex flex-col gap-2">
              <div class="flex w-full flex-row" v-for="(item, index) in selections" :key="index">
                <div class="flex flex-col gap-2">
                  <BuildingSelection v-model="item.selection" @deleteClicked="deleteBuildingClicked" :no-delete="Object.keys(selections).length < 2" />
                  <div v-if="index === selections.length - 1" class="flex w-full justify-center">
                    <span class="cursor-pointer text-green-700 hover:opacity-70" @click="addBuilding">
                      <Icon class="h-6 w-6" icon="material-symbols:add-circle-rounded" />
                    </span>
                  </div>
                </div>
                <div class="flex w-full flex-col gap-2 text-center">
                  <h1 class="font-semibold">Output</h1>
                  <GoodAmount :goods="outputGoods(item.selection.buildingType)" :multiplier="item.selection.amount"></GoodAmount>
                </div>
                <div class="flex w-full flex-col gap-2 text-center">
                  <h1 class="font-semibold">Input</h1>
                  <GoodAmount :goods="inputGoods(item.selection.buildingType)" :multiplier="item.selection.amount"></GoodAmount>
                </div>
              </div>
            </TransitionGroup>
          </div>
          <div class="flex w-full flex-col justify-center gap-2 text-start">
            <h1 class="font-semibold">Calculated buildings counts</h1>
            <BuildingsAmount></BuildingsAmount>
          </div>
        </div>
      </div>
    </div>
    <div class="text-no-wrap my-footer flex h-32 w-full flex-col justify-center gap-2 p-4 text-white">
      <div class="w-full text-center">
        Disclaimer: all images displayed on this page are copyrighted by <a href="https://www.paradoxinteractive.com/" class="text-amber-800 hover:text-amber-500">Paradox Interactive</a>
      </div>
      <div class="flex w-full flex-row items-center justify-center">
        <div class="flex w-full justify-end gap-2 text-amber-800 hover:text-amber-500">
          <a href="https://www.paradoxinteractive.com/games/victoria-3/about" target="blank">Victoria 3</a>
        </div>
        <div class="divider divider-horizontal gap-0"></div>
        <div class="flex w-full justify-start gap-2 text-amber-800 hover:text-amber-500">
          <a href="https://github.com/xZylote/vic3calc" target="blank">Github</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import gsap from 'gsap';
import { onMounted, reactive, ref, watch } from 'vue';

import BuildingSelection from '@/components/building-selection.vue';
import GoodAmount from '@/components/goods-amount.vue';
import MultipleProducerSelection from '@/components/multiple-producer-selection.vue';
import PmSelection from '@/components/pm-selection.vue';
import { entries } from '@/utils';

import { type BuildingSelectionMap, type CalculationResult, Calculator } from './calculator';
import BuildingsAmount from './components/buildings-amount.vue';
import { MULTIPLE_PRODUCER_PREFERENCE_LOCAL_STORAGE_KEY, PRODUCTION_METHOD_LOCAL_STORAGE_KEY } from './production-preferences';
import { store } from './store';
import type { ProductionBuildingType } from './v3-data';
import v3Data from './v3-data';

const cachedSelections = localStorage.getItem('selections');
const selections = reactive<{ selection: { buildingType: ProductionBuildingType; amount: number } }[]>(
  cachedSelections
    ? JSON.parse(cachedSelections)
    : [
        {
          selection: {
            buildingType: 'building_coal_mine' as ProductionBuildingType,
            amount: 100,
          },
        },
      ]
);
const error = ref('');

function addBuilding() {
  const selectedKeys = selections.map((item) => item.selection.buildingType);
  const nextBuilding = entries(v3Data.buildings).find(([buildingType]) => !selectedKeys.includes(buildingType));
  if (nextBuilding) {
    selections.push({
      selection: {
        buildingType: nextBuilding[0],
        amount: 100,
      },
    });
  }
}

function deleteBuildingClicked(selection: { buildingType: ProductionBuildingType }) {
  if (Object.keys(selections).length === 1) {
    return;
  }
  const index = selections.findIndex((item) => item.selection.buildingType === selection.buildingType);
  if (index !== -1) {
    selections.splice(index, 1);
  }
}

function outputGoods(buildingType: ProductionBuildingType) {
  if (!store.calculation.result[buildingType]?.output) {
    return [];
  }
  const output = entries(store.calculation.result[buildingType]!.output)
    .filter(Boolean)
    .map(([goodType, { amount }]) => ({ goodType, amount }));
  return output;
}

function inputGoods(buildingType: ProductionBuildingType) {
  if (!store.calculation.result[buildingType]?.output) {
    return [];
  }
  const input = entries(store.calculation.result[buildingType]!.input)
    .filter(Boolean)
    .map(([goodType, { amount }]) => ({ goodType, amount }));
  return input;
}

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
    const selectionMap = selections.reduce((acc, { selection }) => {
      acc[selection.buildingType] = selection.amount;
      return acc;
    }, {} as BuildingSelectionMap);
    store.setCalculation(Calculator.calculate(selectionMap));
    error.value = '';
  } catch (e: any) {
    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    error.value = e.message;
    console.error(e);
    store.setCalculation({ selection: {}, result: {} } as CalculationResult);
  }
}
function onBeforeEnter(el: any) {
  el.style.opacity = 0;
  el.style.height = 0;
}
function onEnter(el: any, done: any) {
  gsap.to(el, {
    opacity: 1,
    height: 'auto',
    delay: el.dataset.index * 0.15,
    onComplete: done,
  });
}
function onLeave(el: any, done: any) {
  gsap.to(el, {
    opacity: 0,
    height: 0,
    delay: el.dataset.index * 0.15,
    onComplete: done,
  });
}
watch(selections, () => {
  calculate();
  localStorage.setItem('selections', JSON.stringify(selections));
});
onMounted(() => calculate()); // initial calculation
</script>
<style scoped>
.container > div {
  height: calc(100vh - 3.5rem);
}
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
