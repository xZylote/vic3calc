
function getGoods() {
    rawFile = new XMLHttpRequest()
    rawFile.open("GET", "./goods/00_goods.txt", false);
    rawFile.onreadystatechange = () => {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                data = rawFile.responseText
            }
        }
    }
    rawFile.send(null);


    data = data.replace(/[ \t]/g, '') // remove whitespace
    data = data.replace(/#[a-zA-Z0-9_=()-><.# ]*\n/g, '\n') // remove comments
    data = data.replace(/^\s*[\r\n]/gm, '') // remove empty lines
    var DATA = indentation(data, 1)

    for (var entry of DATA) {
        entry.name = entry.name.replace(/=/g, '').replace(/\n/g, '')
        if (entry.values[0]) {
            entry.values[0] = entry.values[0].replace(/{\n/g, '').replace(/\n}/g, '').split("\n")
        }
    }
    return DATA

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
}