<template>
  <div class="flex w-full flex-col items-center justify-center gap-2">
    <div class="indicator flex w-fit items-center gap-2">
      <span class="indicator-start indicator-item">
        <span v-if="!noDelete" @click="!noDelete && emit('deleteClicked', props.modelValue)" :class="{ 'cursor-pointer hover:opacity-70': !noDelete }">
          <Icon class="h-6 w-6" icon="ic:baseline-remove-circle" />
        </span>
      </span>
      <BuildingIcon :building="v3Data.buildings[props.modelValue.buildingType]" :size="40" />
      <select class="select-bordered select bg-amber-50" :value="props.modelValue.buildingType" @input="buildingChanged">
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
    <div class="flex w-full items-center gap-2">
      <div class="w-full">
        <input type="range" min="1" max="500" :value="props.modelValue.amount" v-on:input="updateAmount(($event.target as any)?.value)" class="w-full" />
      </div>
      <div class="w-min">
        <input
          type="number"
          min="1"
          max="5000"
          placeholder="Type here"
          class="input-bordered input w-28 bg-amber-50"
          :value="props.modelValue.amount"
          v-on:input="enforceMinMax($event.target as HTMLInputElement)"
          v-on:keyup="enforceMinMax($event.target as HTMLInputElement)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
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
  noDelete: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const urbanBuildings = computed(() => {
  return entries(v3Data.buildings).filter(([, building]) => !(building.city_type !== null ? ['farm', 'mine', 'wood'].includes(building.city_type) : false));
});
const ruralBuildings = computed(() => {
  return entries(v3Data.buildings).filter(([, building]) => (building.city_type !== null ? ['farm', 'mine', 'wood'].includes(building.city_type) : false));
});

const emit = defineEmits(['update:modelValue', 'deleteClicked']);

function updateAmount(value: string) {
  emit('update:modelValue', { ...props.modelValue, amount: parseInt(value) });
}
function buildingChanged(event: Event) {
  emit('update:modelValue', { ...props.modelValue, buildingType: (event.target as HTMLSelectElement).value as ProductionBuildingType });
}
function enforceMinMax(el: HTMLInputElement) {
  if (el.value != '' || !isNaN(parseInt(el.value))) {
    const value = parseInt(el.value);
    const min = parseInt(el.min);
    const max = parseInt(el.max);
    if (value < min) {
      el.value = el.min;
      emit('update:modelValue', { ...props.modelValue, amount: min });
    } else if (value > max) {
      el.value = el.max;
      emit('update:modelValue', { ...props.modelValue, amount: max });
    } else {
      emit('update:modelValue', { ...props.modelValue, amount: value });
    }
  } else {
    el.value = el.min;
  }
}
</script>

<style scoped></style>
