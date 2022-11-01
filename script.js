let $ = (x) => document.getElementById(x)
let _ = (x) => document.createElement(x)
let multiplier = 1

const data = { buildings: {}, goods: {}, production_methods: {}, production_method_groups: {} }
let dropdown_created = false
for (let type in files) {
    for (let path of files[type]) {
        jomini.Jomini.initialize().then((parser) => {
            const out = parser.parseText(readFile("./" + type + "/" + path));
            for (let prop in out) {
                data[type][prop] = out[prop]
            }
        });
    }
}

function readFile(path) {
    let data
    rawFile = new XMLHttpRequest()
    rawFile.open("GET", path, false)
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



function bar(selection) {
    $("info").innerHTML = ""
    if (selection !== "Select Building") createTable(selection)
    for (input of document.getElementsByTagName("input")) {
        input.addEventListener("click", () => { calculateSum($("good").options[$("good").selectedIndex].value) })
    }
}

function createDropdown() {
    if (!dropdown_created) {
        for (var entry in data.buildings) {
            if (!(data.buildings[entry].buildable == false) && !(data.buildings[entry].expandable == false)) { // careful with that javascript
                var option = document.createElement("option");
                option.value = entry
                option.innerText = entry.substring(9).split("_").map(word => { return word.charAt(0).toUpperCase() + word.slice(1) }).join(' ')
                $("good").appendChild(option)
            }
        }
        dropdown_created = true
    }
}

function joinTables() {
    $("mask").remove()
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
    var table = _("table")
    var table_production_method_groups = _("table")
    var tr_header = _("tr")
    var tr_selected = _("tr")
    var tr_production_method_groups = _("tr")
    var th_name = _("th"),
        th_multiplier = _("th"),
        th_technologies = _("th"),
        th_production_method_groups = _("th")
    var td_name = _("td"),
        td_multiplier = _("th"),
        td_technologies = _("td"),
        td_production_method_groups = _("td")
    var building_thumbnail = _("img")
    var mult_input = _("input")
    for (let production_method_group in data.buildings[selection].production_method_groups) {
        var th_production_method_group = _("th")
        var td_production_method_group = _("td")
        for (let production_method in data.buildings[selection].production_method_groups[production_method_group].production_methods) {
            var tr_production_methods = _("tr")
            var radio_wrapper = _("label")
            var production_method_radio = _("input")
            var production_method_thumbnail = _("img")

            production_method_radio.checked = true // Dirty, but will select all the last ones efficiently#
            production_method_radio.type = "radio"
            production_method_radio.name = data.buildings[selection].production_method_groups[production_method_group].name
            production_method_radio.value = data.buildings[selection].production_method_groups[production_method_group].production_methods[production_method].name
            production_method_thumbnail.title = data.buildings[selection].production_method_groups[production_method_group].production_methods[production_method].name
            production_method_thumbnail.src = data.buildings[selection].production_method_groups[production_method_group].production_methods[production_method].texture.replace("dds", "jpg")

            radio_wrapper.append(production_method_radio, production_method_thumbnail)
            tr_production_methods.append(radio_wrapper)
            td_production_method_group.append(tr_production_methods)
        }
        th_production_method_group.innerText = data.buildings[selection].production_method_groups[production_method_group].name

        tr_production_method_groups.append(td_production_method_group)
        table_production_method_groups.append(th_production_method_group, tr_production_method_groups)
    }


    th_name.innerText = "Building"
    th_technologies.innerText = "Required Technologies"
    th_multiplier.innerText = "#"
    th_production_method_groups.innerText = "Production Methods"
    building_thumbnail.title = selection
    building_thumbnail.src = data.buildings[selection].texture.replace("dds", "jpg")
    mult_input.type = "number"
    mult_input.id = "mult_input"
    mult_input.value = 1
    mult_input.addEventListener('change', () => { multiplier = mult_input.value })
    td_technologies.innerText = data.buildings[selection].unlocking_technologies

    td_multiplier.append(mult_input)
    td_name.append(building_thumbnail)
    td_production_method_groups.append(table_production_method_groups)
    tr_header.append(th_multiplier, th_name, th_technologies, th_production_method_groups)
    tr_selected.append(td_multiplier, td_name, td_technologies, td_production_method_groups)
    table.append(tr_header)
    table.append(tr_selected)
    $("info").append(table)

    calculateSum(selection)
}

function calculateSum(selection) {
    let i = 0
    var indices = [],
        balance = [],
        balanceobj = { input: {}, output: {}, employment: {} }
    var radioButtons = document.querySelectorAll("input[type='radio']");
    for (var radioButton of radioButtons) {
        if (radioButton.checked) {
            indices.push(Array.prototype.indexOf.call(radioButton.parentElement.parentElement.parentElement.childNodes, radioButton.parentElement.parentElement))
        }
    }

    for (let checked_radio of document.querySelectorAll('input[type="radio"]:checked')) {
        if (data.buildings[selection].production_method_groups[i].production_methods[indices[i]].building_modifiers) {
            balance.push(data.buildings[selection].production_method_groups[i].production_methods[indices[i]].building_modifiers.unscaled)
            balance.push(data.buildings[selection].production_method_groups[i].production_methods[indices[i]].building_modifiers.workforce_scaled)
            balance.push(data.buildings[selection].production_method_groups[i].production_methods[indices[i]].building_modifiers.level_scaled)
        }
        i++
    }

    balance = balance.filter(Boolean); // Remove falsy values
    for (var element of balance) {
        for (var subelement in element) {
            var temp = subelement.split("_")
            if (["input", "output", "employment"].includes(temp[1])) {
                if (balanceobj[temp[1]][temp[2]]) {
                    balanceobj[temp[1]][temp[2]] += element[subelement]
                } else {
                    balanceobj[temp[1]][temp[2]] = element[subelement]
                }
            }

        }
    }

    createSumTable(balanceobj)
}

function createSumTable(balance) {
    if ($("x92")) $("x92").remove()
    var sum = _("table")
    sum.id = "x92"
    var resources_header = _("tr")
    var resources = _("tr")
    var th_output = _("th"),
        th_input = _("th"),
        th_employment = _("th")
    var td_output = _("td"),
        td_input = _("td"),
        td_employment = _("td")

    th_output.innerText = "Output"
    th_input.innerText = "Input"
    th_employment.innerText = "Employment"

    for (var item in balance.output) {
        var tr = _("tr")
        tr.innerText += item + ": " + balance.output[item] * multiplier
        td_output.append(tr)
    }
    for (var item in balance.input) {
        var tr = _("tr")
        tr.innerText += item + ": " + balance.input[item] * multiplier
        td_input.append(tr)
    }
    for (var item in balance.employment) {
        var tr = _("tr")
        tr.innerText += item + ": " + balance.employment[item] * multiplier
        td_employment.append(tr)
    }



    resources_header.append(th_output, th_input, th_employment)
    resources.append(td_output, td_input, td_employment)
    sum.append(resources_header, resources)

    $("info").append(sum)
}
