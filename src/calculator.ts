import { store } from './store';
import { entries } from './utils';
import type { EmploymentType, Good, GoodType, ProductionBuildingType } from './v3-data';
import v3Data from './v3-data';

export type BuildingSelection = { buildingType: ProductionBuildingType; amount: number };
export type GoodsBalance = {
  input: Record<GoodType, number>;
  output: Record<GoodType, number>;
  employment: Record<EmploymentType, number>;
};
export type ProductionRequirement = {
  buildingType: ProductionBuildingType;
  goodType: GoodType; // for debugging
  goodsAmount: number; // for debugging
  buildingCount: number;
};
export type GoodsProducerMap = {
  input: Record<GoodType, { amount: number; producedBy: ProductionBuildingType; buildingsNeeded?: number }>;
  output: Record<GoodType, { amount: number; producedBy: ProductionBuildingType }>;
  employment: Record<EmploymentType, { amount: number }>;
  productionRequirements: {
    [buildingType in ProductionBuildingType]?: Array<ProductionRequirement>;
  };
  totalBuildingsNeeded: number;
};

export type CalculationResult = {
  selection: BuildingSelection[];
  result: { [buildingType in ProductionBuildingType]?: GoodsProducerMap };
};

export type MultipleProducerPreference = {
  [goodType in GoodType]?: {
    producers: {
      [buildingType in ProductionBuildingType]?: number;
    };
    preferredProducer: ProductionBuildingType;
  };
};

const GOOD_REQUIREMENT_ROUNDS = 10;

export class Calculator {
  private static findProducerBuilding(good: Good): ProductionBuildingType {
    const preferredProducer = store.multipleProducerPreferences[good.name]?.preferredProducer;
    const producer = preferredProducer || good.produced_by[0];
    if (!producer) {
      throw new Error(`Could not find producer for good ${good.name}`);
    }
    return producer;
  }

  private static calculateBuildingGoodBalance(buildingType: ProductionBuildingType): GoodsProducerMap {
    // get the balances for the selection
    const selectionBuildingPreferences = entries(store.productionPreferences[buildingType]).map(([groupType, methodType]) => {
      const group = v3Data.production_method_groups[groupType];
      if (!group) {
        throw new Error(`Could not find group ${groupType} for building ${buildingType}`);
      }
      const method = v3Data.production_methods[methodType];
      if (!method) {
        throw new Error(`Could not find method ${methodType} for building ${buildingType}`);
      }
      return {
        group,
        method,
      };
    });

    const selectionGoods: GoodsProducerMap = selectionBuildingPreferences.reduce(
      (goods, { method }) => {
        if (method.parsed_modifiers) {
          goods.input = Object.assign(
            goods.input,
            ...method.parsed_modifiers.inputs.map((i) => {
              const producerType = Calculator.findProducerBuilding(v3Data.goods[i.good]);
              return { [i.good]: { amount: i.amount + (goods.input[i.good]?.amount ?? 0), producedBy: producerType } };
            })
          );
          goods.output = Object.assign(
            goods.output,
            ...method.parsed_modifiers.outputs.map((i) => {
              const producerType = Calculator.findProducerBuilding(v3Data.goods[i.good]);
              return { [i.good]: { amount: i.amount + (goods.output[i.good]?.amount ?? 0), producedBy: producerType } };
            })
          );
          goods.employment = Object.assign(
            goods.employment,
            ...method.parsed_modifiers.workforce.map((i) => {
              return { [i.good]: { amount: i.amount + (goods.employment[i.good]?.amount ?? 0) } };
            })
          );
        }
        return goods;
      },
      {
        input: {} as GoodsProducerMap['input'],
        output: {} as GoodsProducerMap['output'],
        employment: {} as GoodsProducerMap['employment'],
        productionRequirements: {} as GoodsProducerMap['productionRequirements'],
        totalBuildingsNeeded: 0,
      }
    );
    return selectionGoods;
  }

  private static createProducerMap(producers: { [buildingType in ProductionBuildingType]?: GoodsProducerMap }, depth: number = 0) {
    if (depth > 10) {
      throw new Error('Too many recursive calls');
    }
    // find all of the input producers
    const inputProducerBuildingTypes: ProductionBuildingType[] = Array.from(
      new Set(
        entries(producers) // using set to remove duplicates
          .flatMap(([, producer]) => entries(producer.input).map(([, { producedBy }]) => producedBy))
      )
    );

    const newProducers: ProductionBuildingType[] = inputProducerBuildingTypes.filter((buildingType) => !producers[buildingType]);
    for (const buildingType of newProducers) {
      producers[buildingType] = Calculator.calculateBuildingGoodBalance(buildingType);
    }
    if (newProducers.length > 0) {
      Calculator.createProducerMap(producers, depth + 1);
    }
  }

  private static generateProductionRequirementsForBuilding({
    producerMap,
    buildingType,
    requesterBuildingCount: requesterBuildingCount,
  }: {
    producerMap: { [buildingType in ProductionBuildingType]?: GoodsProducerMap };
    buildingType: ProductionBuildingType;
    requesterBuildingCount: number;
  }): ProductionRequirement[] {
    const requirements: ProductionRequirement[] = [];
    const building = producerMap[buildingType];
    if (!building) {
      throw new Error(`Could not find producer map for building ${buildingType}`);
    }
    entries(building.input).forEach(([goodType, inputBalance]) => {
      const producer = producerMap[inputBalance.producedBy];
      if (!producer || !producer.productionRequirements) {
        throw new Error(`Could not find producer map for building ${inputBalance.producedBy}`);
      }
      if (!producer.productionRequirements[buildingType]) {
        producer.productionRequirements[buildingType] = [];
      }
      if (producer.productionRequirements[buildingType]!.length === undefined) {
        throw new Error(`Invalid productionRequirements for building ${inputBalance.producedBy}`);
      }
      if (!producer.output[goodType]) {
        throw new Error(`Could not find a producer for "${goodType}" for ${v3Data.buildings[buildingType].humanizedName}. Change your production preferences to fix this.`);
      }
      const requirement = {
        buildingType: inputBalance.producedBy,
        goodType: goodType,
        goodsAmount: inputBalance.amount,
        buildingCount: (inputBalance.amount / producer.output[goodType].amount) * requesterBuildingCount,
      };
      producer.productionRequirements[buildingType]!.push(requirement);
      requirements.push(requirement);
    });
    return requirements;
  }

  /**
   * Round by round calculate the production input requirements for each of the input goods.
   * Because there can be co-dependent goods in the production pipeline eg coal -> tools -> coal, then we need
   * to calculate the production requirements for each round and limit the number of rounds.
   * "requesterBuildingCount" is the number of buildings of the good requester:
   * for ex: Coal mine produces 20 coal and consumes 10 tools. Tool factory produces 30 tools and consumes 5 coal.
   * The rounds for 5 coal mines will be:
   * 1. requesterBuildingCount 5: 5 coal mines creates requirement for 5 * 10 tools -> 50 tools
   * 2. requesterBuildingCount is 50/30=1,6667. tooling workshop creates requirement for 1,6667 * 5 coal = 8,3335 coal
   * 3. requesterBuildingCount is 8,3335/20=0,4167 coal mines creates requirement for 0,4167 * 10 tools -> 4,167 tools
   * 4. requesterBuildingCount is 4,167/30=0,1389 tooling workshop creates requirement for 0,1389 * 5 coal = 0,6945 coal
   * and so on... we can see that the requesterBuildingCount of coal mines and tooling workshop are ever decreasing
   * and they're nearing 0 so rapidly that at the end of 10 rounds we can assume that the requesterBuildingCount is nearly 0
   * and the production input requirements do no change much after that.
   */
  private static calculateProductionRequirements({
    producerMap,
    buildingType,
    requesterBuildingCount,
  }: {
    producerMap: { [buildingType in ProductionBuildingType]?: GoodsProducerMap };
    buildingType: ProductionBuildingType;
    requesterBuildingCount: number;
  }) {
    // calculate the production requirements for the initial building
    let roundRequirements = Calculator.generateProductionRequirementsForBuilding({
      producerMap,
      buildingType,
      requesterBuildingCount,
    });

    for (let i = 0; i < GOOD_REQUIREMENT_ROUNDS; ++i) {
      roundRequirements = roundRequirements.flatMap((requirement) =>
        Calculator.generateProductionRequirementsForBuilding({
          producerMap,
          buildingType: requirement.buildingType,
          requesterBuildingCount: requirement.buildingCount,
        })
      );
    }
    // calculate the building count for each building
    entries(producerMap).forEach(([, producer]) => {
      producer.totalBuildingsNeeded = 0;
      entries(producer.productionRequirements).forEach(([, requirements]) => {
        requirements.forEach((requirement) => {
          producer.totalBuildingsNeeded += requirement.buildingCount ?? 0;
        });
      });
    });
  }

  public static calculate(selection: BuildingSelection[]): CalculationResult {
    if (selection.length === 0) {
      throw new Error('No buildings selected');
    }
    const singleSelectedBuilding: BuildingSelection = selection[0] as BuildingSelection;
    const mainSelectionBalance = Calculator.calculateBuildingGoodBalance(singleSelectedBuilding.buildingType);
    const producerMap: { [buildingType in ProductionBuildingType]?: GoodsProducerMap } = { [singleSelectedBuilding.buildingType]: mainSelectionBalance };
    Calculator.createProducerMap(producerMap, 0);
    Calculator.calculateProductionRequirements({
      producerMap,
      buildingType: singleSelectedBuilding.buildingType,
      requesterBuildingCount: singleSelectedBuilding.amount,
    });
    // add the selection buildings to the result
    selection.forEach((building) => {
      if (producerMap[building.buildingType]) {
        producerMap[building.buildingType]!.totalBuildingsNeeded = (producerMap[building.buildingType]!.totalBuildingsNeeded ?? 0) + (building.amount ?? 0);
      }
    });
    return {
      selection,
      result: producerMap,
    };
  }
}
