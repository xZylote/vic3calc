<template>
  <Tooltip hover :arrow="false" :open-delay="0" placement="right">
    <span :class="[active ? 'active hover:opacity-70' : 'hover:opacity-50', props.class].filter(Boolean).join(' ')">
      <img :src="`${(method[('texture' + (size || 40)) as keyof ProductionMethod])}`" class="method-icon" :class="{ active }" />
    </span>
    <template #content>
      <div class="font-bold">{{ props.method.humanizedName }}</div>
      <div class="flex flex-col text-sm">
        <h3>Modifiers</h3>
        <div class="ml-2">
          <p>production:</p>
          <div v-for="[modifierType, value] in Object.entries(props.method.building_modifiers.workforce_scaled).filter(([key]) => key.startsWith('building_output'))" :key="modifierType">
            <div class="flex">
              <img :src="getModifierIconUrl(modifierType)" />:
              <p class="ml-2" :class="{ 'text-green-500': value > 0, 'text-red-500': value < 0 }">{{ (value > 0 ? '+' : '') + value }}</p>
            </div>
          </div>
          <p>consumption:</p>
          <div v-for="[modifierType, value] in Object.entries(props.method.building_modifiers.workforce_scaled).filter(([key]) => key.startsWith('building_input'))" :key="modifierType">
            <div class="flex">
              <img :src="getModifierIconUrl(modifierType)" />:
              <p class="ml-2" :class="{ 'text-red-500': value > 0, 'text-green-500': value < 0 }">{{ (value > 0 ? '+' : '') + value }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Tooltip>
</template>
<script setup lang="ts">
import type { PropType } from 'vue';

import type { ProductionMethod } from '@/v3-data';
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

function getModifierIconUrl(modifierType: string) {
  const inputOutput = modifierType.replace(/_add/g, ' ');
  let good = '';
  // let employment = '';
  if (inputOutput.startsWith('building_input_')) {
    good = inputOutput.replace('building_input_', '').trim();
  } else if (inputOutput.startsWith('building_output_')) {
    good = inputOutput.replace('building_output_', '').trim();
  } else if (inputOutput.startsWith('building_employment_')) {
    // employment = inputOutput.replace('building_employment_', '').trim();
  }
  const texture = good ? v3Data['goods'][good as keyof (typeof v3Data)['goods']].texture25 : '';
  return texture;
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
