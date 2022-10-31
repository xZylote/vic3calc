function getPM() {

    var globaltext = ""

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
            }
        }
    }
    rawFile.send(null);
    const DATA = parseParadoxProduction(globaltext)

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
                        if (a.split("_").length === 5) var key = a.split("_")[2] + "_" + a.split("_")[3]
                        else var key = a.split("_")[2]
                        var value = a.split("=")[1]
                        array1.push({ [key]: value })
                    }
                    if (a.includes("output")) {
                        if (a.split("_").length === 5) var key = a.split("_")[2] + "_" + a.split("_")[3]
                        else var key = a.split("_")[2]
                        var value = a.split("=")[1]
                        array2.push({ [key]: value })
                    }
                }
            }

            if (entry.values[1]) {
                entry.values[1] = entry.values[1].replace(/{\n/g, '').replace(/\n}/g, '').split("\n")
                for (var a of entry.values[1]) {
                    if (a.split("_").length === 5) var key = a.split("_")[2] + "_" + a.split("_")[3]
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
    return DATA
}