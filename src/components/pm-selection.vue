<template>
  <div class="w-full">
    <div class="flex flex-col w-full justify-center items-center gap-2">
      <!-- <div class="flex flex-row gap-2 items-center">expand all <input type="checkbox" class="toggle" v-model="expanded" @change="expandedChanged($event)" /></div> -->
      <!-- <div class="tabs">
        <a class="tab tab-bordered" :class="{ 'tab-active': selectedCategory === 'all' }">All</a>
        <a class="tab tab-bordered" :class="{ 'tab-active': selectedCategory === 'one' }">Tab 2</a>
        <a class="tab tab-bordered" :class="{ 'tab-active': selectedCategory === 'two' }">Tab 3</a>
      </div> -->
    </div>
    <div v-for="[buildingType, building] in buildingListInOrder" :key="buildingType" class="flex flex-row gap-2">
      <div class="items-center flex flex-col gap-2 w-2/5 text-sm">
        <div class="font-semibold w-full text-center">{{ building.humanizedName }}</div>
        <div class="flex flex-row w-full gap-4">
          <BuildingIcon :building="building" :size="40" :active="!!store.calculation.result[buildingType]" />
          <div class="text-sm flex flex-col" v-if="store.calculation.result[building.name]">
            <p>produces:</p>
            <div v-for="(value, goodType) in store.calculation.result[building.name]?.output" :key="goodType">
              <div class="flex">
                <GoodIcon :good="v3Data.goods[goodType]"></GoodIcon>
                <p class="ml-2" :class="{ 'text-green-500': value.amount > 0, 'text-red-500': value.amount < 0 }">{{ (value.amount > 0 ? '+' : '') + value.amount }}</p>
              </div>
            </div>
          </div>
          <div class="text-sm flex flex-col" v-if="store.calculation.result[building.name]">
            <p>consumes:</p>
            <div v-for="(value, goodType) in store.calculation.result[building.name]?.input" :key="goodType">
              <div class="flex">
                <GoodIcon :good="v3Data.goods[goodType]"></GoodIcon>
                <p class="ml-2" :class="{ 'text-red-500': value.amount > 0, 'text-green-500': value.amount < 0 }">{{ (value.amount > 0 ? '+' : '') + value.amount }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-row items-start justify-center gap-1 w-full">
        <div
          v-for="group of building.production_method_groups.map((group) => group).filter((group) => !group.name.includes('ownership'))"
          :key="group.name"
          class="flex flex-col justify-center items-center justify-items-center w-full"
        >
          <div class="w-full justify-center text-center text-sm" :key="group.name">{{ group.humanizedName }}</div>
          <template v-for="method of group.production_methods" :key="method.name">
            <!-- eslint-disable-next-line vue/valid-v-for, prettier/prettier, vue/no-v-for-template-key-on-child -->
              <div
              @click="
                () => {
                  store.productionPreferences[buildingType][group.name] = method.name;
                }
              "
              class="flex justify-center"
            >
              <input
                type="radio"
                :id="`${buildingType}-${group.name}-${method.name}`"
                :checked="method.name === store.productionPreferences[buildingType][group.name]"
                v-model="store.productionPreferences[buildingType][group.name]"
                class="hidden radio"
                :class="{ active: method.name === store.productionPreferences[buildingType][group.name] }"
              />
              <MethodIcon :method="method" :active="method.name === store.productionPreferences[buildingType][group.name]" :size="32" />
            </div>
          </template>
        </div>
        <!-- eslint-disable vue/no-use-v-if-with-v-for -->
        <div v-for="u in 5 - building.production_method_groups.map((group) => group).filter((group) => !group.name.includes('ownership')).length" :key="u" class="flex flex-col w-full"></div>
        <!-- eslint-enable vue/no-use-v-if-with-v-for -->
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import BuildingIcon from '@/components/building-icon.vue';
import GoodIcon from '@/components/good-icon.vue';
import MethodIcon from '@/components/method-icon.vue';
import { store } from '@/store';
import { entries } from '@/utils';
import v3Data from '@/v3-data';

const buildingListInOrder = computed(() => {
  const all = entries(v3Data.buildings);
  const calcBuildingKeys = Object.keys(store.calculation.result);
  const selectedBuildingTypes = store.calculation.selection.map((s) => s.buildingType);
  all.sort(([buildingTypeA], [buildingTypeB]) => {
    if (selectedBuildingTypes.includes(buildingTypeA)) {
      return -1;
    } else if (calcBuildingKeys.includes(buildingTypeA) && !calcBuildingKeys.includes(buildingTypeB)) {
      return -1;
    } else {
      return 1;
    }
  });
  return all;
});
</script>
<style scoped></style>
