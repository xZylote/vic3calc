// These are all goods that can be produced by multiple buildings
const conflicts = [
    'building_output_sugar_add',
    'building_output_oil_add',
    'building_output_fabric_add',
    'building_output_grain_add',
    'building_output_silk_add',
    'building_output_dye_add',
    'building_output_fertilizer_add',
    'building_output_fruit_add',
    'building_output_liquor_add',
    'building_output_wine_add'
]

// These are the buildings that will be chosen in the above context
// It would be appropiate to let the user change his preferences (e.g. playing as sweden, you can have no silk farms)
let preferences = new Map();
preferences.set('building_output_sugar_add', 'building_sugar_plantation')
preferences.set('building_output_oil_add', 'building_oil_rig')
preferences.set('building_output_fabric_add', 'building_cotton_plantation')
preferences.set('building_output_grain_add', 'building_wheat_farm')
preferences.set('building_output_silk_add', 'building_silk_plantation')
preferences.set('building_output_dye_add', 'building_dye_plantation')
preferences.set('building_output_fertilizer_add', 'building_chemical_plants')
preferences.set('building_output_fruit_add', 'building_wheat_farm')
preferences.set('building_output_liquor_add', 'building_food_industry')
preferences.set('building_output_wine_add', 'building_wheat_farm')