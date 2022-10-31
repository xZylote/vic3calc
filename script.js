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
    document.getElementById("info").innerHTML = ""
    createTable(selection)
}

function createDropdown() {
    if (!dropdown_created) {
        for (var entry in data.buildings) {
            if (!(data.buildings[entry].buildable == false) && !(data.buildings[entry].expandable == false)) { // careful with that javascript
                var option = document.createElement("option");
                option.value = entry
                option.innerText = entry.substring(9).split("_").map(word => { return word.charAt(0).toUpperCase() + word.slice(1) }).join(' ')
                document.getElementById("good").appendChild(option)
            }
        }
        dropdown_created = true
    }
}

function joinTables() {
    document.getElementById("mask").remove()
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
    var table = document.createElement("table")

    var tr = document.createElement("tr")

    var th_name = document.createElement("th")
    var th_technologies = document.createElement("th")
    var th_production_method_groups = document.createElement("th")

    th_name.innerText = "Building"
    th_technologies.innerText = "Required Technologies"
    th_production_method_groups.innerText = "Production Methods"

    tr.appendChild(th_name)
    tr.appendChild(th_technologies)
    tr.appendChild(th_production_method_groups)

    table.appendChild(tr)
    document.getElementById("info").appendChild(table)

    var tr = document.createElement("tr")

    var td_name = document.createElement("td")
    var td_technologies = document.createElement("td")
    var td_production_method_groups = document.createElement("td")

    var table_production_method_groups = document.createElement("table")
    var tr_production_method_groups = document.createElement("tr")
    for (let production_method_group in data.buildings[selection].production_method_groups) {

        var th_production_method_group = document.createElement("th")
        var td_production_method_group = document.createElement("td")

        table_production_method_groups.appendChild(th_production_method_group)
        th_production_method_group.innerText = data.buildings[selection].production_method_groups[production_method_group].name

        tr_production_method_groups.appendChild(td_production_method_group)
        table_production_method_groups.appendChild(tr_production_method_groups)

        for (let production_method in data.buildings[selection].production_method_groups[production_method_group].production_methods) {
            var tr_production_methods = document.createElement("tr")
            var radio_wrapper = document.createElement("label")
            var production_method_radio = document.createElement("input")
            production_method_radio.type = "radio"
            production_method_radio.name = data.buildings[selection].production_method_groups[production_method_group].name
            production_method_radio.value = data.buildings[selection].production_method_groups[production_method_group].production_methods[production_method].name

            var production_method_thumbnail = document.createElement("img")
            production_method_thumbnail.src = data.buildings[selection].production_method_groups[production_method_group].production_methods[production_method].texture.replace("dds", "jpg")
            production_method_thumbnail.title = data.buildings[selection].production_method_groups[production_method_group].production_methods[production_method].name

            radio_wrapper.appendChild(production_method_radio)
            radio_wrapper.appendChild(production_method_thumbnail)
            tr_production_methods.appendChild(radio_wrapper)
            td_production_method_group.appendChild(tr_production_methods)
        }

    }
    var building_thumbnail = document.createElement("img")

    building_thumbnail.src = data.buildings[selection].texture.replace("dds", "jpg")
    building_thumbnail.title = selection

    td_name.appendChild(building_thumbnail)
    console.log(data.buildings[selection])
    td_technologies.innerText = data.buildings[selection].unlocking_technologies
    td_production_method_groups.appendChild(table_production_method_groups)

    tr.appendChild(td_name)
    tr.appendChild(td_technologies)
    tr.appendChild(td_production_method_groups)

    table.appendChild(tr)

}