// https://github.com/xZylote/vic3calc/

//---Common Functions---//
$ = function (x) {
    let y = document.querySelectorAll(x)
    if (y.length === 0) return null
    if (y.length === 1) return y[0]
    return y
}
_ = (x) => document.createElement(x)

function sortObject(unordered) {
    return Object.keys(unordered)
        .sort()
        .reduce((obj, key) => {
                obj[key] = unordered[key]; 
                return obj;
            },
            {}
        );
}

function humanizeBuildName(name) {
    let humanized = name
        .replace(/^building_/g, '')
        .replace(/_building_.*$/g, '')
        .replace(/_/g, ' ')
    if (humanized.includes('ownership')) {
        humanized = 'ownership'
    }
    humanized =  humanized.charAt(0).toUpperCase() + humanized.slice(1)
    return humanized;
}

function humanizeGroupName(name) {
    let humanized = name
        .replace(/^pmg_/g, '')
        .replace(/_building_.*$/g, '')
        .replace(/_/g, ' ')
    if (humanized.includes('ownership')) {
        humanized = 'ownership'
    }
    humanized =  humanized.charAt(0).toUpperCase() + humanized.slice(1)
    return humanized;
}

function humanizeMethodName(name) {
    let humanized = name
        .replace(/^pm_/g, '')
        .replace(/_building_.*$/g, '')
        .replace(/_/g, ' ')
    if (humanized.includes('ownership')) {
        humanized = 'ownership'
    }
    humanized =  humanized.charAt(0).toUpperCase() + humanized.slice(1)
    return humanized;
}

//---Read Data from Game Files---//
let data = { buildings: {}, goods: {}, production_methods: {}, production_method_groups: {}, max_group_size: 2 }
let production_method_preferences = {}
let precision = 10
let radio_id_count = 0
let radio_group_id_count = 0
const radio_inputs = []
const PRODUCTION_METHOD_LOCAL_STORAGE_KEY = 'production_method_preferences'

async function loadData() {
    for (let type in files) {
        for (let path of files[type]) {
            const parser = await jomini.Jomini.initialize()
            let out = parser.parseText(readFile('./' + type + '/' + path))
            for (let prop in out) {
                data[type][prop] = out[prop]
            }
        }
    }
}

function readFile(path) {
    let data
    rawFile = new XMLHttpRequest()
    rawFile.open('GET', path, false)
    rawFile.onreadystatechange = () => {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                data = rawFile.responseText
            }
        }
    }
    rawFile.send(null)
    return data
}

function preferencesUpdated() {
    const selection_table_container = '#production_method_preferences'
    const radioButtons = $(selection_table_container).querySelectorAll('input[type="radio"]:checked')
    for (let e of radioButtons) {
        const input_details = radio_inputs.find(r => r.input === e.id)
        const building = data.buildings[input_details.building];
        if (!building) {
            throw new Error('Could not find building for input "' + e.id + '"')
        }
        const group = building.production_method_groups.find(g => g.name === input_details.group)
        if (!group) {
            throw new Error('Could not find group for input "' + e.id + '"')
        }
        const method = group.production_methods.find(m => m.name === input_details.method);
        if (!method) {
            throw new Error('Could not find method for input "' + e.id + '"')
        }
        production_method_preferences[input_details.building][input_details.group] = method.name
    }
    // save the preference map to local storage
    localStorage.setItem(PRODUCTION_METHOD_LOCAL_STORAGE_KEY, JSON.stringify(production_method_preferences))
}

function generatePreferenceMap(data) {
    if (localStorage.getItem(PRODUCTION_METHOD_LOCAL_STORAGE_KEY)) {
        return JSON.parse(localStorage.getItem(PRODUCTION_METHOD_LOCAL_STORAGE_KEY))
    }
    const preferences = {}
    for (const [buildingName, building] of Object.entries(data.buildings)) {
        preferences[buildingName] = {}
        if (building.production_method_groups) {
            for (const group of building.production_method_groups) {
                if (group.name) {
                    preferences[buildingName][group.name] = {}
                    const methods = group.production_methods;
                    // set the last production method as the default
                    if (Array.isArray(methods)) {
                        preferences[buildingName][group.name] = methods[methods.length - 1].name;
                    }
                }
            }
        }
        
        if (
            // filter out buildings with 0 production methods   
            Object.keys(preferences[buildingName]).length === 0 || 
            // filter out non-production related buildings
            data.buildings[buildingName].buildable === false ||
            data.buildings[buildingName].expandable === false
        ) {
            delete preferences[buildingName]
        }
        
    }
    return preferences;
}



function generatePreferenceSelectionGrid(buildingName, methodPreferences, data, inputs, preferencesUpdatedCallback) {
    const grid = _('div')
    const header = _('div')
    header.classList.add('grid')
    
    const building = data.buildings[buildingName]
    for (const group of building.production_method_groups) {
        const div = _('div')
        div.classList.add('header')
        div.classList.add('fw-bold')
        div.innerHTML = humanizeGroupName(group.name)
        header.append(div)
    }

    if (header.children.length < data.max_group_size) {
        // pad the header div to data.max_group_size children
        for (let i = header.children.length; i < data.max_group_size; i++) {
            header.append(_('div'))
        }
    }

    const groups = _('div')
    groups.classList.add('grid')
    for (const group of building.production_method_groups) {
        const div = _('div')
        for (const method of group.production_methods) {
            const label = _('label')
            const input = _('input')
            input.type = 'radio'
            input.onclick = preferencesUpdatedCallback
            input.name = buildingName + '_' + group.name + '_' + radio_group_id_count
            input.id = 'radio_' + radio_id_count++
            input.value = method.name
            if (methodPreferences[buildingName][group.name] === method.name) {
                input.checked = true
            }
            inputs.push({
                building: buildingName,
                group: group.name,
                method: method.name,
                input: input.id
            })

            const method_thumbnail = _('img')
            method_thumbnail.title = humanizeMethodName(method.name)
            method_thumbnail.src = data.production_methods[method.name].texture.replace('dds', 'jpg')

            label.append(input)
            label.append(method_thumbnail)
            div.append(label, _('br'))
        }
        groups.append(div)
        radio_group_id_count++
    }

    if (groups.children.length < data.max_group_size) {
        // pad the header div to data.max_group_size children
        for (let i = groups.children.length; i < data.max_group_size; i++) {
            groups.append(_('div'))
        }
    }

    grid.append(header)
    grid.append(groups)
    return grid
}

function generateProductionPreferenceSelectionTable(preferences, data) {
    const table = _('table')
    const thead = _('thead')
    const tr_header = _('tr')
    const th_building = _('th')
    th_building.innerHTML = 'Building'
    const th_production_method = _('th')
    th_production_method.innerHTML = 'Production Methods'
    tr_header.append(th_building, th_production_method)
    thead.append(tr_header)
    table.append(thead)
    const tbody = _('tbody')
    for (const [building_name, building] of Object.entries(preferences)) {
        const row = _('tr')
        const building_col = _('td')
        const building_col_div = _('div')

        const name_span = _('span')
        name_span.classList.add('fw-bold')
        name_span.innerHTML = humanizeBuildName(building_name)

        const building_thumbnail = _('img')
        building_thumbnail.classList.add('mt-2')
        building_thumbnail.title = building_name
        building_thumbnail.src = data.buildings[building_name].texture.replace('dds', 'jpg')
        building_col_div.classList.add('text-center')
        
        building_col_div.append(name_span, _('br'), building_thumbnail)
        building_col.append(building_col_div)

        const method_col = _('td')
        method_col.append(generatePreferenceSelectionGrid(building_name, preferences, data, radio_inputs, () => {
            preferencesUpdated()
            changeSelection()
        }))

        row.append(building_col, method_col)
        tbody.append(row)
    }
    table.append(tbody)
    return table;
}

//---Integrate all Paradox-format Data into JSON---//
window.onload = async function () {
    await loadData()
    for (let production_method_group in data.production_method_groups) {
        for (let production_method1 of data.production_method_groups[production_method_group].production_methods) {
            for (let production_method2 in data.production_methods) {
                if (production_method1 === production_method2) {
                    let index = data.production_method_groups[production_method_group].production_methods.indexOf(production_method1)
                    data.production_method_groups[production_method_group].production_methods[index] = data.production_methods[production_method2]
                    data.production_method_groups[production_method_group].production_methods[index].name = production_method1
                }
            }
        }
    }
    for (let building in data.buildings) {
        // find the max number of production method groups for rendering purposes
        if (data.max_group_size < data.buildings[building].production_method_groups.length) {
            data.max_group_size = data.buildings[building].production_method_groups.length
        }
        for (let production_method_group1 of data.buildings[building].production_method_groups) {
            for (let production_method_group2 in data.production_method_groups) {
                if (production_method_group1 === production_method_group2) {
                    let index = data.buildings[building].production_method_groups.indexOf(production_method_group1)
                    data.buildings[building].production_method_groups[index] = data.production_method_groups[production_method_group2]
                    data.buildings[building].production_method_groups[index].name = production_method_group1
                }
            }
        }
    }

    data.buildings = sortObject(data.buildings)
    data.production_method_groups = sortObject(data.production_method_groups)

    production_method_preferences = generatePreferenceMap(data)

    createProductionMethodPreferencesSection()
}

function createProductionMethodPreferencesSection() {
    const resetButton = _('button')
    resetButton.classList.add('btn', 'btn-primary', 'mt-2')
    resetButton.innerHTML = 'Reset production methods to most efficient'
    resetButton.onclick = () => {
        localStorage.removeItem(PRODUCTION_METHOD_LOCAL_STORAGE_KEY)
        production_method_preferences = generatePreferenceMap(data)
        createProductionMethodPreferencesSection()
    }
    $('#production_method_preferences').innerHTML = ''
    $('#production_method_preferences').append(resetButton)
    $('#production_method_preferences').append(generateProductionPreferenceSelectionTable(production_method_preferences, data))
}


/**
 * For every building that is selected in the dropdowns, create a table showing inputs and outputs
 */
let index = 0
function changeSelection() {
    let selection = []
    for (let div of document.querySelectorAll('.input-group')) {
        let a = div.querySelector('select')
        if (a.value !== 'null') {
            selection.push({ name: a.value, amount: div.querySelector('input').value, index: index })
        }
        index++
    }

    $('#info').innerHTML = ''

    for (let building of selection) {
        createTable(building)
    }
}
/**
 * @param {*} selection Object that includes name, amount and index of a building for which a table is to be generated
 */
function createTable(selection) {
    let table_container = _('div')
    let table = _('table')
    table.id = 'table_' + selection.index
    let tr_header = _('tr')
    let tr_selected = _('tr')
    let th_name = _('th'),
        th_multiplier = _('th'),
        th_technologies = _('th'),
        th_production_method_groups = _('th')
    let td_name = _('td'),
        td_multiplier = _('td'),
        td_technologies = _('td'),
        td_production_method_groups = _('td')
    let building_thumbnail = _('img')
    let mult_input = _('p')

    th_multiplier.innerText = '#'
    th_name.innerText = 'Building'
    th_technologies.innerText = 'Required Technologies'
    th_production_method_groups.innerText = 'Production Methods'
    building_thumbnail.title = selection.name
    building_thumbnail.src = data.buildings[selection.name].texture.replace('dds', 'jpg')
    mult_input.innerText = selection.amount
    td_technologies.innerText = data.buildings[selection.name].unlocking_technologies ? data.buildings[selection.name].unlocking_technologies : 'none'

    td_multiplier.append(mult_input)
    td_name.classList.add('text-center')
    td_name.classList.add('fw-bold')
    td_name.append(document.createTextNode(humanizeBuildName(selection.name)), _('br'), building_thumbnail)
    td_production_method_groups.append(generatePreferenceSelectionGrid(selection.name, production_method_preferences, data, radio_inputs, () => {
        preferencesUpdated()
        calculateSum(selection, table_container)
    }))
    tr_header.append(th_multiplier, th_name, th_technologies, th_production_method_groups)
    tr_selected.append(td_multiplier, td_name, td_technologies, td_production_method_groups)
    table.append(tr_header)
    table.append(tr_selected)
    table_container.append(table)
    $('#info').append(table_container)

    calculateSum(selection, table_container)
}

/**
 * The radio-button indexing is kind of hacked together but works so far
 * @param {*} selection Object that includes name, amount and index of a building for which the sum of input and output goods is to be calculated
 * @param {*} table_container DOM-Element into which the total sum is to be inserted
 */
function calculateSum(selection, table_container) {
    $('#total').innerHTML = ''
    let balance = [],
        balanceobj = { input: {}, output: {}, employment: {} }
    const selection_table_container = '#table_' + selection.index
    const radioButtons = $(selection_table_container).querySelectorAll('input[type="radio"]:checked')
    for (let e of radioButtons) {
        const input_details = radio_inputs.find(r => r.input === e.id)
        const building = data.buildings[input_details.building];
        if (!building) {
            throw new Error('Could not find building for input "' + e.id + '"')
        }
        const group = building.production_method_groups.find(g => g.name === input_details.group)
        if (!group) {
            throw new Error('Could not find group for input "' + e.id + '"')
        }
        const method = group.production_methods.find(m => m.name === input_details.method);
        if (!method) {
            throw new Error('Could not find method for input "' + e.id + '"')
        }
        if (method.building_modifiers) {
            balance.push(method.building_modifiers.workforce_scaled)
            balance.push(method.building_modifiers.level_scaled)
        }
    }

    balance = balance.filter(Boolean)
    for (let element of balance) {
        for (let subelement in element) {
            let temp = subelement.split('_')
            if (temp.length === 5) {
                temp[2] = temp[2] + '_' + temp[3]
            }
            if (['input', 'output', 'employment'].includes(temp[1])) {
                if (balanceobj[temp[1]][temp[2]])
                    balanceobj[temp[1]][temp[2]] += element[subelement] * selection.amount
                else
                    balanceobj[temp[1]][temp[2]] = element[subelement] * selection.amount

            }

        }
    }
    createSumTable(balanceobj, selection, table_container)

    let goods_collection = [balanceobj]
    let temp = balanceobj
    let buildings_collection = []
    for (let i = 0; i < precision; i++) {
        let temp2 = addDependents(temp)
        buildings_collection.push(temp2)
        temp = iterate(temp2)
        goods_collection.push(temp)
    }

    let all_employment = {},
        all_input = {},
        all_output = {},
        all_buildings = {},
        additional_product = {}
    for (let entry of goods_collection) {
        for (let input in entry.input) {
            if (!all_input[input])
                all_input[input] = entry.input[input]
            else
                all_input[input] += entry.input[input]
        }
        for (let output in entry.output) {
            if (!all_output[output])
                all_output[output] = entry.output[output]
            else
                all_output[output] += entry.output[output]
        }
        for (let employment in entry.employment) {
            if (!all_employment[employment])
                all_employment[employment] = entry.employment[employment]
            else
                all_employment[employment] += entry.employment[employment]
        }
    }
    for (let entry of buildings_collection) {
        for (let subentry of entry) {
            if (!all_buildings[subentry.name])
                all_buildings[subentry.name] = subentry.amount
            else
                all_buildings[subentry.name] += subentry.amount
        }
    }
    for (let item in all_output) {
        if (!all_input[item]) {
            additional_product[item] = Math.round(all_output[item])
        } else {
            additional_product[item] = Math.round(all_output[item] - all_input[item])
        }
    }
    $('#total').append(_('br'), _('hr'), 'ALL BUILDINGS NEEDED', _('br'))
    const container = _('div')
    const sorted = Object.keys(all_buildings).sort((a, b) => all_buildings[b] - all_buildings[a])
    for (let entry of sorted) {
        const building_col_div = _('div')
        building_col_div.classList.add('container')
        building_col_div.classList.add('align-middle')
        const row = _('div')
        row.classList.add('align-items-center')
        row.classList.add('d-flex')
        row.classList.add('flex-row')

        const name_span = _('span')
        name_span.classList.add('fw-bold')
        name_span.innerHTML = humanizeBuildName(entry)

        const building_thumbnail = _('img')
        building_thumbnail.classList.add('mt-2')
        building_thumbnail.style = 'width: 50px; height: 50px;'
        building_thumbnail.title = entry
        building_thumbnail.src = data.buildings[entry].texture.replace('dds', 'jpg')

        const col1 = _('div')
        col1.classList.add('col-2')
        col1.append(name_span)
        const col2 = _('div')
        col2.classList.add('col-1')
        col2.classList.add('flex-shrink-1')
        col2.append(building_thumbnail)
        const col3 = _('div')
        col3.classList.add('col')
        col3.classList.add('flex-grow-1')
        col3.append('x  ' +all_buildings[entry].toFixed(4))
        row.append(col1, col2, col3)

        building_col_div.append(row)
        container.append(building_col_div)
    }
    $('#total').append(container)
    $('#total').append(_('br'), _('hr'), 'WORKERS', _('br'))
    for (let entry in all_employment) {
        $('#total').append(entry, ': ', Math.round(all_employment[entry]), _('br'))
    }
    $('#total').append(_('br'), _('hr'), 'TOTAL OUTPUT', _('br'))
    for (let entry in additional_product) {
        if (Math.round(additional_product[entry]) !== 0)
            $('#total').append(entry, ': ', Math.round(additional_product[entry]), _('br'))
    }
}

/**
 * @param {*} balance Object of form {input: [wood: 23, steel: 12], output: [fabric: 2]}
 * @param {*} selection Object that includes name, amount and index of the building that the data is for
 * @param {*} table_container DOM-Element into which the total sum is to be inserted
 */
function createSumTable(balance, selection, table_container) {
    let exists = $('#table_' + selection.index).parentElement.querySelector('.sum_table')
    if (exists) exists.remove()
    let sum = _('table')
    let resources_header = _('tr')
    let resources = _('tr')
    let th_output = _('th'),
        th_input = _('th'),
        th_employment = _('th'),
        th_value = _('th')
    let td_output = _('td'),
        td_input = _('td'),
        td_employment = _('td'),
        td_value = _('td')
    let tr1 = _('tr'),
        tr2 = _('tr'),
        tr3 = _('tr')

    sum.classList.add('sum_table')
    th_output.innerText = 'Output'
    th_input.innerText = 'Input'
    th_employment.innerText = 'Employment'
    th_value.innerText = 'Value'

    let profit = 0, employees = 0
    for (let item in balance.output) {
        profit += data.goods[item].cost * balance.output[item]
        let tr = _('tr')
        tr.innerText += item + ': ' + balance.output[item]
        td_output.append(tr)
    }
    for (let item in balance.input) {
        profit -= data.goods[item].cost * balance.input[item]
        let tr = _('tr')
        tr.innerText += item + ': ' + balance.input[item]
        td_output.append(tr)
        td_input.append(tr)
    }
    for (let item in balance.employment) {
        employees += balance.employment[item]
        let tr = _('tr')
        tr.innerText += item + ': ' + balance.employment[item]
        td_output.append(tr)
        td_employment.append(tr)
    }

    tr1.innerText = 'profit: ' + profit + ' £'
    tr2.innerText = 'employees: ' + employees
    tr3.innerText = 'profit per employee: ' + (profit / employees).toFixed(3) + ' £'

    td_value.append(tr1, tr2, tr3)
    resources_header.append(th_output, th_input, th_employment, th_value)
    resources.append(td_output, td_input, td_employment, td_value)
    sum.append(resources_header, resources)
    // We could only show the input and output on demand
    //let details = _('details')
    //details.append(sum)
    //table_container.append(details)
    table_container.append(sum)
}

/**
 * When clicking on the 'Add Building'-button, we create a new dropdown menu
 */
function addBuilding() {
    let container = $('header'),
        div = _('div'),
        select = _('select'),
        input = _('input'),
        default_option = _('option'),
        xbutton = _('button')

    select.classList.add('form-select')
    input.type = 'number'
    input.value = 1
    input.classList.add('form-control')
    default_option.setAttribute('value', null)
    default_option.innerHTML = '- Select Building -'

    select.onchange = () => changeSelection()
    input.onchange = () => changeSelection()
    xbutton.classList.add('btn', 'btn-danger')
    div.classList.add('input-group')
    xbutton.onclick = function () {
        this.parentElement.remove()
        $('#initial').style.display = 'inline'
        changeSelection()
    }

    select.append(default_option)
    xbutton.append(document.createTextNode('Remove'))
    div.append(input)
    div.append(select)
    div.append(xbutton)
    container.append(div)

    for (let entry in data.buildings) {
        if (!(data.buildings[entry].buildable == false) && !(data.buildings[entry].expandable == false)) {
            let option = _('option')
            option.value = entry
            option.innerText = entry.substring(9).split('_').map(word => { return word.charAt(0).toUpperCase() + word.slice(1) }).join(' ')
            if (entry == 'building_coal_mine') option.setAttribute('selected', 'selected')
            select.append(option)
        }
    }
    $('#initial').style.display = 'none'
    changeSelection()
}

/**
 * This is the beginning of the function that is supposed to calculate what buildings need to be added in order to form a supply chain
 * @TODO Only works for one building (the most recently changed one)
 * @TODO
 * CURRENT:
 *
 * Take pm that produces most of wanted good
 * There will be duplicate buildings in max object because one building supports multiple pms
 * Remove duplicates by using first match and combining outputs of all pmgs
 * Calculate how many are necessary
 *
 *
 * OPTIMAL:
 *
 * Take best possible pm per pmg (maybe tech has not been unlocked)
 * Maybe save preferred production methods (will also fix that on adding/removing buildings, pms are reset)
 * Maybe set default production methods per era (data in /technologies/)
 *
 * Sum up output of all pmgs AND THEN again recalculate which one is the best, then use this metric to remove duplicates/make a good choice (e.g. do not use rye farms for sugar)
 *
 * Output excess goods as well
 *
 * Iterate n times by adding newly required buildings to the list, until almost only basic goods are left,
 * this works only if rye farms are not used for sugar since great inefficiency in circular processes lead to infinite byproducts and ever larger input requirements
 * 
 * @param {*} balance Object that stores input and output goods of the processes
 */
function addDependents(balance) {
    var output = []
    let good_buildings = [] // Will include all production method groups that share an output with the demanded input good, always uses the production method that generates most of this good
    let unique_good_buildings = [] // Same, but will not include duplicates by summing over production method groups or in case multiple buildings are candidates, chooses one depending on preferences
    for (let building in data.buildings) {
        for (let production_method_group of data.buildings[building].production_method_groups) {
            if (production_method_group !== 'pmg_dummy') {
                for (let production_method of production_method_group.production_methods) {
                    if (production_method.building_modifiers && production_method.building_modifiers.workforce_scaled) {
                        let max = { building: '', pmg: '', pm: '', amount: -1000 }

                        for (let output in production_method.building_modifiers.workforce_scaled) {
                            let temp = output.split('_')
                            if (temp.length === 5) {
                                temp[2] = temp[2] + '_' + temp[3]
                            }
                            if (temp[1] === 'output' && balance.input[temp[2]]) {
                                // if (default_pms.includes(production_method.name)) {
                                if (production_method_preferences[building] && production_method_preferences[building][production_method_group.name] === production_method.name) {
                                    if (max.amount <= production_method.building_modifiers.workforce_scaled[output]) {
                                        max.amount = production_method.building_modifiers.workforce_scaled[output]
                                        max.building = building
                                        max.pmg = production_method_group.name
                                        max.pm = production_method.name
                                        max.good = output

                                    }
                                }
                            }
                        }
                        if (max.amount !== -1000) good_buildings.push(max)
                    }
                }
            }
        }
    }
    let checkedGoods = [] // Goods whose supply has already been established by adding an appropriate building
    // THE BELOW CODE IS WRONG, BECAUSE THERE CAN BE MORE THAN 2 PMGs and also it will compare the building to itself
    for (let building1 of good_buildings) {
        for (let building2 of good_buildings) {
            if (building1.good === building2.good && !checkedGoods.includes(building1.good) && (!conflicts.includes(building2.good) || building1.building === preferences.get(building2.good))) {
                if (building1.building === building2.building && building1.pmg !== building2.pmg) {
                    unique_good_buildings.push({ building: building1.building, good: building1.good, output: building1.amount + building2.amount })
                } else {
                    unique_good_buildings.push({ building: building1.building, good: building1.good, output: building1.amount })
                }
                checkedGoods.push(building1.good)
            }
        }
    }

    for (let requested_good in balance.input) {
        for (let building of unique_good_buildings) {
            if (building.good.includes(requested_good)) {
                output.push({ name: building.building, amount: balance.input[requested_good] / building.output })
            }
        }
    }
    return output
}

/**
 * @param {*} input Object containing buildings {name: 'building_logging_camp', amount: 0.3}
 * @returns Input and outputs of these buildings
 */
function iterate(input) {
    balance = { input: {}, output: {}, employment: {} }
    let aaa = []
    for (let entry of input) {
        for (let pmg of data.buildings[entry.name].production_method_groups) {
            if (data.buildings[entry.name].production_method_groups.at(-1).production_methods.at(-1).building_modifiers) {
                for (let entry2 of pmg.production_methods) {
                    if (production_method_preferences[entry.name] && production_method_preferences[entry.name][pmg.name] === entry2.name) {
                        if (entry2.building_modifiers) {
                            if (entry2.building_modifiers.workforce_scaled)
                                aaa.push({ good: entry2.building_modifiers.workforce_scaled, amount: entry.amount })
                            if (entry2.building_modifiers.level_scaled)
                                aaa.push({ employment: entry2.building_modifiers.level_scaled, amount: entry.amount })
                        }
                    }
                }
            }
        }
    }
    aaa = aaa.filter(Boolean)
    for (let element of aaa) {
        for (let subelement in element.good) {
            let temp = subelement.split('_')
            if (temp.length === 5) {
                temp[2] = temp[2] + '_' + temp[3]
            }
            if (['input', 'output', 'employment'].includes(temp[1])) {
                if (balance[temp[1]][temp[2]]) {
                    balance[temp[1]][temp[2]] += element.good[subelement] * element.amount
                } else {
                    balance[temp[1]][temp[2]] = element.good[subelement] * element.amount
                }
            }

        }
        for (let subelement in element.employment) {
            let temp = subelement.split('_')
            if (temp.length === 5) {
                temp[2] = temp[2] + '_' + temp[3]
            }
            if (['input', 'output', 'employment'].includes(temp[1])) {
                if (balance[temp[1]][temp[2]]) {
                    balance[temp[1]][temp[2]] += element.employment[subelement] * element.amount
                } else {
                    balance[temp[1]][temp[2]] = element.employment[subelement] * element.amount
                }
            }

        }
    }
    return balance
}

$('#building_prefs').addEventListener("keydown", function f(event) {
    if ((event.keyCode == 10 || event.keyCode == 13) && event.ctrlKey) {
        for (let entry in $('#building_prefs').innerHTML.replace(/(\r\n|\n|\r)/gm, "").replace(/\s/g, "").split(';')) {
            let temp = entry.split(',')
            preferences.set(temp[0], temp[1])
        }
        $('#pm_prefs').style.color = 'black'
    } else $('#pm_prefs').style.color = 'darkred'
})
