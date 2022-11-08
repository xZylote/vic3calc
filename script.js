$ = function (x) {
    let y = document.querySelectorAll(x)
    if (y.length === 0) return null
    if (y.length === 1) return y[0]
    return y
}

_ = (x) => document.createElement(x)

//------------------------------------//

let data = { buildings: {}, goods: {}, production_methods: {}, production_method_groups: {} }

for (let type in files) {
    for (let path of files[type]) {
        jomini.Jomini.initialize().then((parser) => {
            let out = parser.parseText(readFile('./' + type + '/' + path))
            for (let prop in out) {
                data[type][prop] = out[prop]
            }
        })
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

function bar() {
    let selection = []
    let index = 0
    for (let div of document.querySelectorAll('.input-group')) {
        let a = div.querySelector('select')
        if (a.value !== 'null') {
            selection.push({ name: a.value, amount: div.querySelector('input').value, index: index })
        }
        index++
    }

    $('#info').innerHTML = ''

    for (let factory of selection) {
        createTable(factory)
    }
}

function joinTables() {
    $('#mask').remove()
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
}

function createTable(selection) {
    let table_container = _('div')
    let table = _('table')
    table.id = 'table_' + selection.index
    let table_production_method_groups = _('table')
    let tr_header = _('tr')
    let tr_selected = _('tr')
    let tr_production_method_groups = _('tr')
    let th_name = _('th'),
        th_multiplier = _('th'),
        th_technologies = _('th'),
        th_production_method_groups = _('th')
    let td_name = _('td'),
        td_multiplier = _('th'),
        td_technologies = _('td'),
        td_production_method_groups = _('td')
    let building_thumbnail = _('img')
    let mult_input = _('p')

    for (let production_method_group in data.buildings[selection.name].production_method_groups) {
        let th_production_method_group = _('th')
        let td_production_method_group = _('td')
        for (let production_method in data.buildings[selection.name].production_method_groups[production_method_group].production_methods) {
            let tr_production_methods = _('tr')
            let radio_wrapper = _('label')
            let production_method_radio = _('input')
            let production_method_thumbnail = _('img')
            production_method_radio.onclick = () => calculateSum(selection, table_container)
            production_method_radio.checked = true // Dirty, but will select all the last ones efficiently
            production_method_radio.type = 'radio'
            production_method_radio.name = data.buildings[selection.name].production_method_groups[production_method_group].name
            production_method_radio.value = data.buildings[selection.name].production_method_groups[production_method_group].production_methods[production_method].name
            production_method_thumbnail.title = data.buildings[selection.name].production_method_groups[production_method_group].production_methods[production_method].name
            production_method_thumbnail.src = data.buildings[selection.name].production_method_groups[production_method_group].production_methods[production_method].texture.replace('dds', 'jpg')

            radio_wrapper.append(production_method_radio, production_method_thumbnail)
            tr_production_methods.append(radio_wrapper)
            td_production_method_group.append(tr_production_methods)
        }
        th_production_method_group.innerText = data.buildings[selection.name].production_method_groups[production_method_group].name
        tr_production_method_groups.append(td_production_method_group)
        table_production_method_groups.append(th_production_method_group, tr_production_method_groups)
    }

    th_name.innerText = 'Building'
    th_technologies.innerText = 'Required Technologies'
    th_multiplier.innerText = '#'
    th_production_method_groups.innerText = 'Production Methods'
    building_thumbnail.title = selection.name
    building_thumbnail.src = data.buildings[selection.name].texture.replace('dds', 'jpg')
    mult_input.innerText = selection.amount
    td_technologies.innerText = data.buildings[selection.name].unlocking_technologies

    td_multiplier.append(mult_input)
    td_name.append(building_thumbnail)
    td_production_method_groups.append(table_production_method_groups)
    tr_header.append(th_multiplier, th_name, th_technologies, th_production_method_groups)
    tr_selected.append(td_multiplier, td_name, td_technologies, td_production_method_groups)
    table.append(tr_header)
    table.append(tr_selected)
    table_container.append(table)
    $('#info').append(table_container)

    calculateSum(selection, table_container)
}

function calculateSum(selection, table_container) {

    let i = 0
    let indices = [],
        balance = [],
        balanceobj = { input: {}, output: {}, employment: {} }
    let radioButtons = $('#table_' + selection.index).querySelectorAll('input[type="radio"]')

    for (let radioButton of radioButtons) {
        if (radioButton.checked) {
            indices.push(Array.prototype.indexOf.call(radioButton.parentElement.parentElement.parentElement.childNodes, radioButton.parentElement.parentElement))
        }
    }

    for (let e of $('#table_' + selection.index).querySelectorAll('input[type="radio"]:checked')) {
        if (data.buildings[selection.name].production_method_groups[i].production_methods[indices[i]].building_modifiers) {
            balance.push(data.buildings[selection.name].production_method_groups[i].production_methods[indices[i]].building_modifiers.unscaled)
            balance.push(data.buildings[selection.name].production_method_groups[i].production_methods[indices[i]].building_modifiers.workforce_scaled)
            balance.push(data.buildings[selection.name].production_method_groups[i].production_methods[indices[i]].building_modifiers.level_scaled)
        }
        i++
    }

    balance = balance.filter(Boolean)
    for (let element of balance) {
        for (let subelement in element) {
            let temp = subelement.split('_')
            if (temp.length === 5) {
                temp[2] = temp[2] + '_' + temp[3]
            }
            if (['input', 'output', 'employment'].includes(temp[1])) {
                if (balanceobj[temp[1]][temp[2]]) {
                    balanceobj[temp[1]][temp[2]] += element[subelement]
                } else {
                    balanceobj[temp[1]][temp[2]] = element[subelement]
                }
            }

        }
    }
    createSumTable(balanceobj, selection, table_container)
}

function createSumTable(balance, selection, table_container) {
    console.log(balance)
    let exists = $('#table_' + selection.index).parentElement.querySelector('.sum_table')
    if (exists) {
        exists.remove()
    }
    let sum = _('table')
    sum.classList.add('sum_table')
    let resources_header = _('tr')
    let resources = _('tr')
    let th_output = _('th'),
        th_input = _('th'),
        th_employment = _('th')
    let td_output = _('td'),
        td_input = _('td'),
        td_employment = _('td')

    th_output.innerText = 'Output'
    th_input.innerText = 'Input'
    th_employment.innerText = 'Employment'

    for (let item in balance.output) {
        let tr = _('tr')
        tr.innerText += item + ': ' + balance.output[item] * selection.amount
        td_output.append(tr)
    }
    for (let item in balance.input) {
        let tr = _('tr')
        tr.innerText += item + ': ' + balance.input[item] * selection.amount
        td_output.append(tr)
        td_input.append(tr)
    }
    for (let item in balance.employment) {
        let tr = _('tr')
        tr.innerText += item + ': ' + balance.employment[item] * selection.amount
        td_output.append(tr)
        td_employment.append(tr)
    }

    resources_header.append(th_output, th_input, th_employment)
    resources.append(td_output, td_input, td_employment)
    sum.append(resources_header, resources)
    //let details = _('details')
    //details.append(sum)
    //table_container.append(details)
    table_container.append(sum)
}

function addFactory() {
    let container = $('#header'),
        div = _('div'),
        select = _('select'),
        input = _('input'),
        option = _('option'),
        xbutton = _('button')

    select.classList.add('form-select')
    input.type = 'number'
    input.value = 1
    input.classList.add('form-control')
    option.setAttribute('value', null)
    option.innerHTML = '- Select Building -'
    select.onchange = () => bar()
    input.onchange = () => bar()
    xbutton.classList.add('btn', 'btn-danger')
    div.classList.add('input-group')
    xbutton.onclick = function () {
        this.parentElement.remove()
        bar()
    }

    for (let entry in data.buildings) {
        if (!(data.buildings[entry].buildable == false) && !(data.buildings[entry].expandable == false)) {
            let option = _('option')
            option.value = entry
            option.innerText = entry.substring(9).split('_').map(word => { return word.charAt(0).toUpperCase() + word.slice(1) }).join(' ')
            select.append(option)
        }
    }

    xbutton.append(document.createTextNode('Remove'))
    div.append(input)
    select.append(option)
    div.append(select)
    div.append(xbutton)
    container.append(div)
}

//value-lookup
//save preferred production methods
//default era production methods