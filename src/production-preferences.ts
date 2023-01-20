import type { MultipleProducerPreference } from './calculator';
import { type DeepPartial, entries } from './utils';
import v3Data, { type Buildings, type GoodType, type ProductionBuildingType, type ProductionMethod, type ProductionMethodGroups } from './v3-data';

/**
 * Mapping of building type -> group -> method
 */
export type ProductionPreferences<
  BuildingT extends ProductionBuildingType = ProductionBuildingType,
  GroupT extends Buildings[BuildingT]['production_method_groups'][number]['name'] = Buildings[BuildingT]['production_method_groups'][number]['name'],
  MethodT extends ProductionMethodGroups[GroupT]['production_methods'][number]['name'] = ProductionMethodGroups[GroupT]['production_methods'][number]['name']
> = {
  [building in BuildingT]: {
    [group in GroupT]: MethodT;
  };
};

export type BuildingInputOutputMap = {
  [building in ProductionBuildingType]: {
    input: {
      [goodType in GoodType]: number;
    };
    output: {
      [goodType in GoodType]: number;
    };
  };
};

export const PRODUCTION_METHOD_LOCAL_STORAGE_KEY = 'production_method_preferences';
export const MULTIPLE_PRODUCER_PREFERENCE_LOCAL_STORAGE_KEY = 'multiple_producer_preferences';

export function generatePreferenceMap(): ProductionPreferences {
  const savedPreferences = localStorage.getItem(PRODUCTION_METHOD_LOCAL_STORAGE_KEY);
  if (savedPreferences) {
    return JSON.parse(savedPreferences);
  }
  const preferences: DeepPartial<ProductionPreferences> = {};
  entries(v3Data.buildings).forEach(([buildingName, building]) => {
    preferences[buildingName] = {};
    if (building.production_method_groups) {
      for (const group of building.production_method_groups) {
        if (group.name) {
          const methods = group.production_methods;
          // set the last production method as the default
          if (Array.isArray(methods)) {
            preferences[buildingName] = Object.assign(preferences[buildingName] || {}, { [group.name]: methods[methods.length - 1].name });
          }
        }
      }
    }
  });
  return preferences as ProductionPreferences;
}

export function generateMultipleProducerPreferenceMap(): MultipleProducerPreference {
  const savedPreferences = localStorage.getItem(MULTIPLE_PRODUCER_PREFERENCE_LOCAL_STORAGE_KEY);
  if (savedPreferences) {
    return JSON.parse(savedPreferences);
  }
  const multipleProducerMap: MultipleProducerPreference = {};
  // fill up the multiple producer preferences
  entries(v3Data.buildings).forEach(([buildingType, building]) => {
    if (building.production_method_groups) {
      // select the most advance methods for all groups to determine the maximum output of each good.
      // this might not be the best way to do it, but it's a good enough approximation for the default preference
      const lastMethods: ProductionMethod[] = building.production_method_groups
        .map((group) => {
          return group.production_methods.length > 0 ? group.production_methods[group.production_methods.length - 1] : undefined;
        })
        .filter((method) => !!method) as ProductionMethod[];
      lastMethods.forEach((method) => {
        method.parsed_modifiers.outputs.forEach((output) => {
          if (!multipleProducerMap[output.good]) {
            multipleProducerMap[output.good] = {
              producers: {
                [buildingType]: output.amount ?? 0,
              },
              preferredProducer: buildingType,
            };
          }
          if (multipleProducerMap[output.good]!.producers![buildingType] === undefined) {
            multipleProducerMap[output.good]!.producers![buildingType] = output.amount;
          } else {
            multipleProducerMap[output.good]!.producers![buildingType]! += output.amount;
          }
        });
      });
    }
  });
  entries(multipleProducerMap).forEach(([goodType, pref]) => {
    // prefer building with the biggest amount of output of the good
    pref.preferredProducer = entries(pref.producers).reduce((prevBuildingType, [curBuildingType, curAmount]) => {
      return pref.producers![prevBuildingType]! > curAmount ? prevBuildingType : curBuildingType;
    }, pref.preferredProducer);
    // delete if only one producer
    if (Object.keys(pref.producers).length === 1) {
      delete multipleProducerMap[goodType as GoodType];
    }
  });
  return multipleProducerMap;
}

export function generateBuildingInputOutputMap(preferences: ProductionPreferences) {
  return entries(preferences).reduce((outerAcc, [buildingType, groupMap]) => {
    if (!outerAcc[buildingType]) {
      outerAcc[buildingType] = { input: {}, output: {} } as BuildingInputOutputMap[ProductionBuildingType];
    }
    // fill the input map
    entries(groupMap).reduce((acc, [, methodType]) => {
      v3Data.production_methods[methodType].parsed_modifiers.inputs.forEach(({ good, amount }) => {
        acc.input[good] = (acc.input[good] ?? 0) + amount;
      });
      return acc;
    }, outerAcc[buildingType]);
    // fill the output map
    entries(groupMap).reduce((acc, [, methodType]) => {
      v3Data.production_methods[methodType].parsed_modifiers.outputs.forEach(({ good, amount }) => {
        acc.output[good] = (acc.output[good] ?? 0) + amount;
      });
      return acc;
    }, outerAcc[buildingType]);
    return outerAcc;
  }, {} as BuildingInputOutputMap);
}
