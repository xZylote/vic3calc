<template>
  <div class="flex w-full flex-col gap-2">
    <input type="text" placeholder="type building name to filter" class="input w-full max-w-xs bg-amber-50 py-0" v-model="nameFilter" />
    <div v-for="[buildingType, building] in buildingListInOrder" :key="buildingType" class="flex flex-row gap-2" v-show="shown[buildingType]">
      <div class="flex w-2/5 flex-col items-center gap-2 text-sm">
        <div class="flex w-full flex-row gap-2">
          <BuildingIcon :building="building" :size="40" :active="!!store.calculation.result[buildingType]" disableTooltip />
          <div class="flex w-full flex-col">
            <div class="w-full text-center font-semibold">{{ building.humanizedName }}</div>
            <div class="flex w-full flex-row gap-3">
              <div class="flex w-full flex-col items-end text-sm" v-if="store.buildingInputOutputMap[building.name]">
                <div v-for="(value, goodType) in store.buildingInputOutputMap[building.name]?.output" :key="goodType">
                  <div class="flex">
                    <GoodIcon :good="v3Data.goods[goodType]" :size="32"></GoodIcon>
                    <p class="ml-2" :class="{ 'text-green-500': value > 0, 'text-red-500': value < 0 }">{{ (value > 0 ? '+' : '') + value }}</p>
                  </div>
                </div>
              </div>
              <div class="flex w-full flex-col text-sm" v-if="store.buildingInputOutputMap[building.name]">
                <div v-for="(value, goodType) in store.buildingInputOutputMap[building.name]?.input" :key="goodType">
                  <div class="flex">
                    <GoodIcon :good="v3Data.goods[goodType]" :size="32"></GoodIcon>
                    <p class="ml-2" :class="{ 'text-red-500': value > 0, 'text-green-500': value < 0 }">{{ (value > 0 ? '+' : '') + value }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex w-full flex-row items-start justify-center gap-1">
        <div
          v-for="group of building.production_method_groups.map((group) => group).filter((group) => !group.name.includes('ownership'))"
          :key="group.name"
          class="flex w-full flex-col items-center justify-center justify-items-center rounded-md bg-amber-50 bg-opacity-50 py-2"
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
                class="radio hidden"
                :class="{ active: method.name === store.productionPreferences[buildingType][group.name] }"
              />
              <MethodIcon :method="method" :active="method.name === store.productionPreferences[buildingType][group.name]" :size="32" class="cursor-pointer" />
            </div>
          </template>
        </div>
        <!-- eslint-disable vue/no-use-v-if-with-v-for -->
        <div v-for="u in 5 - building.production_method_groups.map((group) => group).filter((group) => !group.name.includes('ownership')).length" :key="u" class="flex w-full flex-col"></div>
        <!-- eslint-enable vue/no-use-v-if-with-v-for -->
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';

import BuildingIcon from '@/components/building-icon.vue';
import GoodIcon from '@/components/good-icon.vue';
import MethodIcon from '@/components/method-icon.vue';
import { store } from '@/store';
import { entries } from '@/utils';
import v3Data, { type ProductionBuildingType } from '@/v3-data';

const nameFilter = ref('');

const shown = computed(() => {
  const filterWord = nameFilter.value.toLowerCase();
  return buildingListInOrder.value.reduce((acc, [buildingType, building]) => {
    acc[buildingType] = filterWord.length === 0 || building.humanizedName.toLowerCase().includes(filterWord);
    return acc;
  }, {} as Record<ProductionBuildingType, boolean>);
});

const buildingListInOrder = computed(() => {
  const all = entries(v3Data.buildings);
  const calcBuildingKeys = Object.keys(store.calculation.result);
  const selectedBuildingTypes = Object.keys(store.calculation.selection) as ProductionBuildingType[];
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
