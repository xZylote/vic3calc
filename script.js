
createDropdown(getGoods())
function bar(selection) {
    document.getElementById("info").innerHTML = ""
    createTable(getPM(), selection)
}

function createDropdown(goods) {
    for (var entry of goods) {
        var option = document.createElement("option");
        option.value = entry.name
        option.innerText = entry.name
        document.getElementById("good").appendChild(option)
    }
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