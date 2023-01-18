import rawData from './assets/vic3/data';
import { entries } from './utils';

export type Buildings = (typeof rawData)['buildings'];
export type BuildingType = keyof Buildings;
export type Building = (typeof rawData)['buildings'][BuildingType];
export type ProductionMethodGroupType = keyof (typeof rawData)['production_method_groups'];
export type ProductionMethodGroups = (typeof rawData)['production_method_groups'];
export type ProductionMethodGroup = (typeof rawData)['production_method_groups'][ProductionMethodGroupType];
export type ProductionBuildingType = {
  [K in BuildingType]: Buildings[K] extends { buildable: false } ? never : Buildings[K] extends { expandable: false } ? never : K;
}[BuildingType];
export type ProductionMethodType = keyof (typeof rawData)['production_methods'];
export type ProductionMethod = (typeof rawData)['production_methods'][ProductionMethodType];
export type GoodType = keyof (typeof rawData)['goods'];
export type Good = (typeof rawData)['goods'][GoodType];
export type EmploymentType = ProductionMethod['parsed_modifiers']['workforce'][number]['good'];

/**
 * Static data from the game, transformed to be more useful
 */
export type TransformedV3Data = Omit<typeof rawData, 'buildings'> & {
  buildings: Record<ProductionBuildingType, Buildings[ProductionBuildingType]>;
};

function transformData(): TransformedV3Data {
  const transformed = {
    ...rawData,
    buildings: {
      ...rawData.buildings,
    } as Record<ProductionBuildingType, Buildings[ProductionBuildingType] & { name?: string; humanizedName?: string }>,
  };
  const buildingsWithNames = rawData.buildings as { [key in BuildingType]: Buildings[BuildingType] & { humanizedName: string } };
  entries(buildingsWithNames).forEach(([buildingType, building]) => {
    if ((building as { buildable?: false }).buildable === false || (building as { expandable?: false }).expandable === false) {
      // not a production building, so don't include it in the transformed data
      delete transformed.buildings[buildingType as ProductionBuildingType];
    }
  });
  return transformed as TransformedV3Data;
}

const v3Data: TransformedV3Data = transformData();
export default v3Data;
