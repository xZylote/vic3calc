import { reactive } from 'vue';

import type { CalculationResult } from './calculator';
import { generatePreferenceMap, multipleProducerPreferenceMap } from './production-preferences';

export const store = reactive({
  calculation: { selection: {}, result: {} } as CalculationResult,
  productionPreferences: generatePreferenceMap(),
  multipleProducerPreferences: multipleProducerPreferenceMap(),
  setCalculation(calculation: CalculationResult) {
    this.calculation = calculation;
  },
});
