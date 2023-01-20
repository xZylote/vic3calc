<template>
  <div class="flex w-full flex-col items-center">
    <div class="flex flex-row" v-for="{ goodType, amount } of props.goods" :key="goodType">
      <!--  -->
      <Tooltip>
        <div class="flex flex-row items-center gap-1">
          <div class="flex justify-end justify-items-end">
            <img :src="v3Data.goods[goodType]?.texture40" :alt="v3Data['goods'][goodType].humanizedName" />
          </div>
          <div class="flex justify-start">
            <span class="kbd bg-amber-50 bg-opacity-50">x {{ amount * multiplier }}</span>
          </div>
        </div>
        <template #content>
          {{ v3Data.goods[goodType]?.humanizedName }}
        </template>
      </Tooltip>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { PropType } from 'vue';

import Tooltip from '@/components/tooltip.vue';
import type { GoodType } from '@/v3-data';
import v3Data from '@/v3-data';

const props = defineProps({
  goods: {
    type: Object as PropType<
      {
        goodType: GoodType;
        amount: number;
      }[]
    >,
    required: true,
  },
  multiplier: {
    type: Number,
    required: false,
    default: 1,
  },
});
</script>
