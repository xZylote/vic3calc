<template>
  <div class="w-full flex flex-col gap-2 justify-center items-center">
    <div class="flex gap-2 items-center w-fit">
      <BuildingIcon :building="v3Data.buildings[props.modelValue.buildingType]" :size="64" />
      <select class="select select-bordered w-fit bg-amber-50" :value="props.modelValue.buildingType" @input="buildingChanged">
        <optgroup label="Urban">
          <option v-for="[buildingType, building] of urbanBuildings" :key="buildingType" :value="buildingType">
            {{ building.humanizedName }}
          </option>
        </optgroup>
        <optgroup label="Rural">
          <option v-for="[buildingType, building] of ruralBuildings" :key="buildingType" :value="buildingType">
            {{ building.humanizedName }}
          </option>
        </optgroup>
      </select>
    </div>
    <div class="flex gap-2 items-center w-full">
      <div class="w-full">
        <input type="range" min="0" max="500" :value="props.modelValue.amount" v-on:input="updateAmount(($event.target as any)?.value)" class="w-full" />
      </div>
      <div class="w-min">
        <input type="number" placeholder="Type here" class="input input-bordered w-28 bg-amber-50" :value="props.modelValue.amount" v-on:input="updateAmount(($event.target as any)?.value)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PropType, computed } from 'vue';

import BuildingIcon from '@/components/building-icon.vue';
import { entries } from '@/utils';
import type { ProductionBuildingType } from '@/v3-data';
import v3Data from '@/v3-data';

const props = defineProps({
  modelValue: {
    type: Object as PropType<{ amount: number; buildingType: ProductionBuildingType }>,
    required: true,
  },
  active: {
    type: Boolean,
    required: false,
    default: true,
  },
});

const urbanBuildings = computed(() => {
  return entries(v3Data.buildings).filter(([, building]) => !(building.city_type !== null ? ['farm', 'mine', 'wood'].includes(building.city_type) : false));
});
const ruralBuildings = computed(() => {
  return entries(v3Data.buildings).filter(([, building]) => (building.city_type !== null ? ['farm', 'mine', 'wood'].includes(building.city_type) : false));
});

const emit = defineEmits(['update:modelValue']);

function updateAmount(value: string) {
  emit('update:modelValue', { ...props.modelValue, amount: parseInt(value) });
}
function buildingChanged(event: Event) {
  emit('update:modelValue', { ...props.modelValue, buildingType: (event.target as HTMLSelectElement).value as ProductionBuildingType });
}
</script>

<style scoped></style>
