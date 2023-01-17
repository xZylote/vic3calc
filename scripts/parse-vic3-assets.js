import { readFile, writeFile } from 'fs/promises';
import { Jomini } from 'jomini';
import path from 'path';
import { fileURLToPath } from 'url';

const files = {
  buildings: [
    '01_industry.txt',
    '02_agro.txt',
    '03_mines.txt',
    '04_plantations.txt',
    '05_military.txt',
    '06_urban_center.txt',
    '07_government.txt',
    '08_monuments.txt',
    '09_misc_resource.txt',
    '10_canals.txt',
    '11_private_infrastructure.txt',
    '12_subsistence.txt',
    '13_construction.txt',
  ],
  goods: ['00_goods.txt'],
  production_methods: [
    '01_industry.txt',
    '02_agro.txt',
    '03_mines.txt',
    '04_plantations.txt',
    '05_military.txt',
    '06_urban_center.txt',
    '07_government.txt',
    '08_monuments.txt',
    '09_misc_resource.txt',
    '10_canals.txt',
    '11_private_infrastructure.txt',
    '12_subsistence.txt',
    '13_construction.txt',
  ],
  production_method_groups: [
    '01_industry.txt',
    '02_agro.txt',
    '03_mines.txt',
    '04_plantations.txt',
    '05_military.txt',
    '06_urban_center.txt',
    '07_government.txt',
    '08_monuments.txt',
    '09_misc_resource.txt',
    '10_canals.txt',
    '11_private_infrastructure.txt',
    '12_subsistence.txt',
    '13_construction.txt',
  ],
};

const VIC3_ASSET_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/assets/vic3');
const IMAGE_SIZES = [
  { h: 64, w: 64 },
  { h: 40, w: 40 },
  { h: 32, w: 32 },
  { h: 25, w: 25 },
];

function humanizeBuildingName(name) {
  let humanized = name
    .replace(/^building_/g, '')
    .replace(/_building_.*$/g, '')
    .replace(/_/g, ' ');
  if (humanized.includes('ownership')) {
    humanized = 'ownership';
  }
  humanized = humanized.charAt(0).toUpperCase() + humanized.slice(1);
  return humanized;
}

function humanizeGroupName(name) {
  let humanized = name
    .replace(/^pmg_/g, '')
    .replace(/_building_.*$/g, '')
    .replace(/_/g, ' ');
  if (humanized.includes('ownership')) {
    humanized = 'ownership';
  }
  humanized = humanized.charAt(0).toUpperCase() + humanized.slice(1);
  return humanized;
}

function humanizeMethodName(name) {
  let humanized = name
    .replace(/^pm_/g, '')
    .replace(/_building_.*$/g, '')
    .replace(/_/g, ' ');
  if (humanized.includes('ownership')) {
    humanized = 'ownership';
  }
  humanized = humanized.charAt(0).toUpperCase() + humanized.slice(1);
  return humanized;
}

function humanizeGoodName(name) {
  return (name.charAt(0).toUpperCase() + name.slice(1)).replace(/_/g, ' ');
}

function parseModifiers(method) {
  const inputRegex = /building_input_(.*)_add/;
  const outputRegex = /building_output_(.*)_add/;
  const employmentRegex = /building_employment_(.*)_add/;
  const inputs = [];
  const outputs = [];
  const workforce = [];
  for (const [key, value] of Object.entries(method.building_modifiers.workforce_scaled)) {
    if (key.startsWith('building_input')) {
      const matches = key.match(inputRegex);
      if (matches && matches.length > 1) {
        inputs.push({ good: matches[1], amount: value });
      }
    } else if (key.startsWith('building_output')) {
      const matches = key.match(outputRegex);
      if (matches && matches.length > 1) {
        outputs.push({ good: matches[1], amount: value });
      }
    }
  }
  for (const [key, value] of Object.entries(method.building_modifiers.level_scaled)) {
    const matches = key.match(employmentRegex);
    if (matches && matches.length > 1) {
      workforce.push({ good: matches[1], amount: value });
    }
  }
  return { inputs, outputs, workforce };
}

async function loadData() {
  const data = {};
  for (const type in files) {
    if (!data[type]) {
      data[type] = {};
    }
    for (const filename of files[type]) {
      const parser = await Jomini.initialize();
      // read file and replace .dds with .dds
      const fileData = (await readFile(path.join(VIC3_ASSET_PATH, type, filename))).toString().replace(/\.dds/g, '.webp');
      let out = parser.parseText(fileData);
      for (let prop in out) {
        data[type][prop] = out[prop];
      }
    }
  }
  // transform data a bit to be handy
  for (let production_method_group in data.production_method_groups) {
    for (let production_method1 of data.production_method_groups[production_method_group].production_methods) {
      for (let production_method2 in data.production_methods) {
        if (production_method1 === production_method2) {
          const method = data.production_methods[production_method2];
          method.name = production_method1;
          method.humanizedName = humanizeMethodName(production_method1);
          IMAGE_SIZES.forEach((size) => {
            method['texture' + size.w] = path.join(path.dirname(method.texture), `${size.w}x${size.h}`, path.basename(method.texture).replace('.dds', '.webp'));
          });
          if (!method.building_modifiers) {
            method.building_modifiers = {};
          }
          if (!method.building_modifiers.workforce_scaled) {
            method.building_modifiers.workforce_scaled = {};
          }
          if (!method.building_modifiers.level_scaled) {
            method.building_modifiers.level_scaled = {};
          }
          method.parsed_modifiers = parseModifiers(method);
          const index = data.production_method_groups[production_method_group].production_methods.indexOf(production_method1);
          data.production_method_groups[production_method_group].production_methods[index] = method;
        }
      }
    }
  }
  for (let buildingType in data.buildings) {
    const building = data.buildings[buildingType];
    if (building.buildable === false || building.expandable === false) {
      delete data.buildings[buildingType];
      continue;
    }
    building.name = buildingType;
    building.humanizedName = humanizeBuildingName(buildingType);
    building.city_type = building.city_type || null;
    if (building.texture) {
      IMAGE_SIZES.forEach((size) => {
        building['texture' + size.w] = path.join(path.dirname(building.texture), `${size.w}x${size.h}`, path.basename(building.texture).replace('.dds', '.webp'));
      });
    }
    // filter out pmg_dummy as it has no representation in data.production_method_groups
    building.production_method_groups = building.production_method_groups.filter((pmg) => pmg !== 'pmg_dummy');
    for (let buildingMethodGroup of building.production_method_groups) {
      for (let rootMethodGroup in data.production_method_groups) {
        if (buildingMethodGroup === rootMethodGroup) {
          let index = building.production_method_groups.indexOf(buildingMethodGroup);
          const group = data.production_method_groups[rootMethodGroup];
          group.name = buildingMethodGroup;
          group.humanizedName = humanizeGroupName(buildingMethodGroup);
          IMAGE_SIZES.forEach((size) => {
            group['texture' + size.w] = path.join(path.dirname(group.texture), `${size.w}x${size.h}`, path.basename(group.texture).replace('.dds', '.webp'));
          });
          building.production_method_groups[index] = group;
        }
      }
    }
  }

  for (let goodType in data.goods) {
    const good = data.goods[goodType];
    good.name = goodType;
    good.humanizedName = humanizeGoodName(goodType);

    IMAGE_SIZES.forEach((size) => {
      good['texture' + size.w] = path.join(path.dirname(good.texture), `${size.w}x${size.h}`, path.basename(good.texture).replace('.dds', '.webp'));
    });
    // for each good, find all buildings that produce it
    good.produced_by = [];
    for (let buildingType in data.buildings) {
      const building = data.buildings[buildingType];
      for (let methodGroup of building.production_method_groups) {
        for (let method of methodGroup.production_methods) {
          if (method.parsed_modifiers.outputs.find((output) => output.good === goodType)) {
            if (good.produced_by.includes(buildingType) === false) {
              good.produced_by.push(buildingType);
            }
          }
        }
      }
    }
  }

  // data.buildings = sortObject(data.buildings);
  // data.production_method_groups = sortObject(data.production_method_groups);

  return data;
}

loadData().then(async (data) => {
  const jsonPath = path.join(VIC3_ASSET_PATH, 'data.ts');
  await writeFile(jsonPath, `export default ${JSON.stringify(data, null, 2)} as const;`);
  console.log(`Parsed vic3 game data to ${jsonPath}`);
});
