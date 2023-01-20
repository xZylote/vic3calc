<template>
  <Tooltip hover :arrow="false" :open-delay="0" placement="right">
    <span :class="[active ? 'active hover:opacity-70' : 'hover:opacity-50', props.class].filter(Boolean).join(' ')">
      <img :src="`${(method[('texture' + (size || 40)) as keyof ProductionMethod])}`" :alt="method.humanizedName" class="method-icon" :class="{ active }" />
    </span>
    <template #content>
      <div class="font-bold">{{ props.method.humanizedName }}</div>
      <div class="flex flex-col text-sm">
        <h3>Modifiers</h3>
        <div class="ml-2">
          <p>production:</p>
          <div v-for="good of outputGoods" :key="good.name">
            <div class="flex">
              <img :src="good.texture25" :alt="good.humanizedName" />:
              <p class="ml-2" :class="{ 'text-green-500': good.value > 0, 'text-red-500': good.value < 0 }">{{ (good.value > 0 ? '+' : '') + good.value }}</p>
            </div>
          </div>
          <p>consumption:</p>
          <div v-for="good of inputGoods" :key="good.name">
            <div class="flex">
              <img :src="good.texture25" :alt="good.humanizedName" />:
              <p class="ml-2" :class="{ 'text-red-500': good.value > 0, 'text-green-500': good.value < 0 }">{{ (good.value > 0 ? '+' : '') + good.value }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Tooltip>
</template>
<script setup lang="ts">
import { type PropType, computed } from 'vue';

import type { Good, ProductionMethod } from '@/v3-data';
import v3Data from '@/v3-data';

import Tooltip from './tooltip.vue';

const props = defineProps({
  method: {
    type: Object as PropType<ProductionMethod>,
    required: true,
  },
  active: {
    type: Boolean,
    required: false,
    default: true,
  },
  size: {
    type: Number as PropType<25 | 32 | 40 | 64>,
    required: false,
    default: 40,
  },
  class: {
    type: String,
    required: false,
    default: '',
  },
});

const outputGoods = computed(() => {
  return Object.entries(props.method.building_modifiers.workforce_scaled)
    .filter(([key]) => key.startsWith('building_output'))
    .map(([modifierType, value]) => {
      const good = getGoodFromModifierType(modifierType);
      if (good) {
        return {
          ...good,
          value,
        };
      }
    })
    .filter(Boolean) as (Good & { value: number })[];
});

const inputGoods = computed(() => {
  return Object.entries(props.method.building_modifiers.workforce_scaled)
    .filter(([key]) => key.startsWith('building_input'))
    .map(([modifierType, value]) => {
      const good = getGoodFromModifierType(modifierType);
      if (good) {
        return {
          ...good,
          value,
        };
      }
    })
    .filter(Boolean) as (Good & { value: number })[];
});

function getGoodFromModifierType(modifierType: string) {
  const inputOutput = modifierType.replace(/_add/g, ' ');
  let good;
  if (inputOutput.startsWith('building_input_')) {
    good = inputOutput.replace('building_input_', '').trim();
  } else if (inputOutput.startsWith('building_output_')) {
    good = inputOutput.replace('building_output_', '').trim();
  }
  return good ? v3Data['goods'][good as keyof (typeof v3Data)['goods']] : undefined;
}
</script>
<style scoped>
img:not(.active).method-icon {
  opacity: 0.5;
  filter: grayscale(1);
}
img.method-icon {
  min-width: 20px;
  min-height: 20px;
}
</style>
