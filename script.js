function parseParadoxProduction(data) {
    data = data.replace(/[ \t]/g, '') // remove whitespace
    data = data.replace(/#[a-zA-Z0-9_=()-><.# ]*\n/g, '\n') // remove comments
    data = data.replace(/^\s*[\r\n]/gm, '') // remove empty lines
    var dataArray = indentation(data, 3)
    for (var entry of dataArray) {
        entry.name = entry.name.replace(/=/g, '').replace(/\n/g, '')
        var array1 = [], array2 = [], array3 = []

        if (entry.values[0]) {
            entry.values[0] = entry.values[0].replace(/{\n/g, '').replace(/\n}/g, '').split("\n")
            for (var a of entry.values[0]) {
                if (a.includes("input")) {
                    if(a.split("_").length === 5) var key = a.split("_")[2] + "_" + a.split("_")[3]
                    else var key = a.split("_")[2]
                    var value = a.split("=")[1]
                    array1.push({ [key]: value })
                }
                if (a.includes("output")) {
                    if(a.split("_").length === 5) var key = a.split("_")[2] + "_" + a.split("_")[3]
                    else var key = a.split("_")[2]
                    var value = a.split("=")[1]
                    array2.push({ [key]: value })
                }
            }
        }

        if (entry.values[1]) {
            entry.values[1] = entry.values[1].replace(/{\n/g, '').replace(/\n}/g, '').split("\n")
            for (var a of entry.values[1]) {
                if(a.split("_").length === 5) var key = a.split("_")[2] + "_" + a.split("_")[3]
                else var key = a.split("_")[2]
                var value = a.split("=")[1]
                array3.push({ [key]: value })
            }
        }
        entry.inputs = array1
        entry.outputs = array2
        entry.workers = array3
        delete entry.values
    }
    return dataArray
}

function indentation(text, infodepth) {
    var name = '', sofar = '', depth = 0
    var levels = [], values = [], temp = []
    for (const c of text) {
        if (c === '{') {
            if (depth === 0) {
                temp.push({ name: name, values: values })
                values = []
                name = sofar
            }
            if (depth === infodepth) {
                values.push(sofar)
            }
            depth++;
            sofar = ''
        }
        if (depth >= levels.length) levels.push([])
        sofar = sofar + c
        if (c === '}') {
            if (depth === 0) {
                temp.push({ name: name, values: values })
                values = []
                name = sofar
            }
            if (depth === infodepth) {
                values.push(sofar)
            }
            depth--;
            sofar = ''
        }
    }
    temp.shift()
    return temp
}

rawFile = new XMLHttpRequest()
rawFile.open("GET", "./production_methods/00_goods.txt", false);
rawFile.onreadystatechange = () => {
    if (rawFile.readyState === 4) {
        if (rawFile.status === 200 || rawFile.status == 0) {
            createDropdown(parseParadoxGoods(rawFile.responseText))
        }
    }
}
rawFile.send(null);

function parseParadoxGoods(data) {
    data = data.replace(/[ \t]/g, '') // remove whitespace
    data = data.replace(/#[a-zA-Z0-9_=()-><.# ]*\n/g, '\n') // remove comments
    data = data.replace(/^\s*[\r\n]/gm, '') // remove empty lines
    var dataArray = indentation(data, 1)

    for (var entry of dataArray) {
        entry.name = entry.name.replace(/=/g, '').replace(/\n/g, '')
        if (entry.values[0]) {
            entry.values[0] = entry.values[0].replace(/{\n/g, '').replace(/\n}/g, '').split("\n")
        }
    }
    return dataArray
}

function createDropdown(data) {
    for (var entry of data) {
        var option = document.createElement("option");
        option.value = entry.name
        option.innerText = entry.name
        document.getElementById("good").appendChild(option)
    }
}

function bar(selection) {
    var globaltext = ""
    document.getElementById("info").innerHTML = ""
    rawFile = new XMLHttpRequest()
    rawFile.open("GET", "./production_methods/01_industry.txt", false);
    rawFile.onreadystatechange = () => {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                globaltext += rawFile.responseText
            }
        }
    }
    rawFile.send(null);
    rawFile = new XMLHttpRequest()
    rawFile.open("GET", "./production_methods/02_agro.txt", false);
    rawFile.onreadystatechange = () => {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                globaltext += rawFile.responseText
            }
        }
    }
    rawFile.send(null);
    rawFile = new XMLHttpRequest()
    rawFile.open("GET", "./production_methods/03_mines.txt", false);
    rawFile.onreadystatechange = () => {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                globaltext += rawFile.responseText
            }
        }
    }
    rawFile.send(null);
    rawFile = new XMLHttpRequest()
    rawFile.open("GET", "./production_methods/04_plantations.txt", false);
    rawFile.onreadystatechange = () => {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                globaltext += rawFile.responseText
            }
        }
    }
    rawFile.send(null);
    rawFile = new XMLHttpRequest()
    rawFile.open("GET", "./production_methods/05_military.txt", false);
    rawFile.onreadystatechange = () => {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                globaltext += rawFile.responseText
            }
        }
    }
    rawFile.send(null);
    rawFile = new XMLHttpRequest()
    rawFile.open("GET", "./production_methods/06_urban_center.txt", false);
    rawFile.onreadystatechange = () => {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                globaltext += rawFile.responseText
            }
        }
    }
    rawFile.send(null);
    rawFile = new XMLHttpRequest()
    rawFile.open("GET", "./production_methods/07_government.txt", false);
    rawFile.onreadystatechange = () => {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                globaltext += rawFile.responseText
            }
        }
    }
    rawFile.send(null);
    rawFile = new XMLHttpRequest()
    rawFile.open("GET", "./production_methods/08_monuments.txt", false);
    rawFile.onreadystatechange = () => {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                globaltext += rawFile.responseText
            }
        }
    }
    rawFile.send(null);
    rawFile = new XMLHttpRequest()
    rawFile.open("GET", "./production_methods/09_misc_resource.txt", false);
    rawFile.onreadystatechange = () => {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                globaltext += rawFile.responseText
            }
        }
    }
    rawFile.send(null);
    rawFile = new XMLHttpRequest()
    rawFile.open("GET", "./production_methods/10_canals.txt", false);
    rawFile.onreadystatechange = () => {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                globaltext += rawFile.responseText
            }
        }
    }
    rawFile.send(null);
    rawFile = new XMLHttpRequest()
    rawFile.open("GET", "./production_methods/11_private_infrastructure.txt", false);
    rawFile.onreadystatechange = () => {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                globaltext += rawFile.responseText
            }
        }
    }
    rawFile.send(null);
    rawFile = new XMLHttpRequest()
    rawFile.open("GET", "./production_methods/12_subsistence.txt", false);
    rawFile.onreadystatechange = () => {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                globaltext += rawFile.responseText
            }
        }
    }
    rawFile.send(null);
    rawFile = new XMLHttpRequest()
    rawFile.open("GET", "./production_methods/13_construction.txt", false);
    rawFile.onreadystatechange = () => {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                globaltext += rawFile.responseText
                createTable(parseParadoxProduction(globaltext), selection)
            }
        }
    }
    rawFile.send(null);
    
}

function createTable(data, selection) {
    var table = document.createElement("table")
    var tr = document.createElement("tr")
    var th_name = document.createElement("th")
    var th_inputs = document.createElement("th")
    var th_outputs = document.createElement("th")
    var th_workers = document.createElement("th")
    th_name.innerText = "Name"
    th_inputs.innerText = "Inputs"
    th_outputs.innerText = "Outputs"
    th_workers.innerText = "Workers"
    tr.appendChild(th_name)
    tr.appendChild(th_inputs)
    tr.appendChild(th_outputs)
    tr.appendChild(th_workers)
    table.appendChild(tr)
    document.getElementById("info").appendChild(table)
    for (var entry of data) {
        var canproduce = false
        for (var output of entry.outputs) {
            if (output[selection]) {
                var canproduce = true
            }
        }
        if (canproduce) {
            var tr = document.createElement("tr")
            var td_name = document.createElement("td")
            var td_inputs = document.createElement("td")
            var td_outputs = document.createElement("td")
            var td_workers = document.createElement("td")
            td_name.innerText = entry.name
            var inputs = "", outputs = "", workers = ""
            for (input of entry.inputs) {
                for (var prop in input) {
                    inputs += prop + ": " + input[prop] + ", "
                }
            }
            for (output of entry.outputs) {
                for (var prop in output) {
                    outputs += prop + ": " + output[prop] + ", "
                }
            }
            for (worker of entry.workers) {
                for (var prop in worker) {
                    workers += prop + ": " + worker[prop] + ", "
                }
            }
            td_inputs.innerText = inputs
            td_outputs.innerText = outputs
            td_workers.innerText = workers
            tr.appendChild(td_name)
            tr.appendChild(td_inputs)
            tr.appendChild(td_outputs)
            tr.appendChild(td_workers)
            table.appendChild(tr)
        }
    }
    

}