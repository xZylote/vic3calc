import { reactive } from 'vue';

import type { CalculationResult, MultipleProducerPreference } from './calculator';
import type { BuildingInputOutputMap, ProductionPreferences } from './production-preferences';

export const store = reactive({
  calculation: { selection: {}, result: {} } as CalculationResult,
  multipleProducerPreferences: {} as MultipleProducerPreference,
  productionPreferences: {} as ProductionPreferences,
  buildingInputOutputMap: {} as BuildingInputOutputMap,
  setCalculation(calculation: CalculationResult) {
    this.calculation = calculation;
  },
  setMultipleProducerPreferences(multipleProducerPreferences: MultipleProducerPreference) {
    this.multipleProducerPreferences = multipleProducerPreferences;
  },
  setProductionPreferences(productionPreferences: ProductionPreferences) {
    this.productionPreferences = productionPreferences;
  },
  setBuildingInputOutputMap(buildingInputOutputMap: BuildingInputOutputMap) {
    this.buildingInputOutputMap = buildingInputOutputMap;
  },
});
