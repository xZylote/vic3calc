<template>
  <div class="flex flex-wrap">
    <div class="flex w-28 items-center gap-0" v-for="[goodType, multipleProducer] in entries(store.multipleProducerPreferences)" :key="goodType" @mouseleave="expanded[goodType] = false">
      <div class="flex flex-col">
        <TransitionGroup name="list" tag="div" @before-enter="onBeforeEnter" @enter="onEnter" @leave="onLeave" class="m-1">
          <div
            v-show="buildingType === multipleProducer.preferredProducer || expanded[goodType]"
            v-for="(amount, buildingType) in multipleProducer.producers"
            :key="buildingType"
            class="cursor-pointer hover:opacity-90"
          >
            <BuildingIcon
              :building="v3Data.buildings[buildingType]"
              @click="
                () => {
                  if (!expanded[goodType]) {
                    expanded[goodType] = !expanded[goodType];
                  } else {
                    multipleProducer.preferredProducer = buildingType;
                  }
                }
              "
              :active="buildingType === multipleProducer.preferredProducer"
              show-input-output
            />
          </div>
        </TransitionGroup>
      </div>
      <Icon icon="material-symbols:arrow-right-alt"></Icon>
      <GoodIcon :good="v3Data.goods[goodType]" :size="32" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import gsap from 'gsap';
import { ref } from 'vue';

import BuildingIcon from '@/components/building-icon.vue';
import GoodIcon from '@/components/good-icon.vue';
import { store } from '@/store';
import { entries } from '@/utils';
import v3Data, { type GoodType } from '@/v3-data';

const expanded = ref<Record<GoodType, boolean>>({} as Record<GoodType, boolean>);

function onBeforeEnter(el: any) {
  el.style.opacity = 0;
  el.style.height = 0;
}
function onEnter(el: any, done: any) {
  gsap.to(el, {
    opacity: 1,
    height: '42px',
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
</script>
