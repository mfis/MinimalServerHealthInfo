require('dotenv').config();

const http= require('http');
const port= process.env.PORT;
const fs= require("fs");
const { execSync } = require("child_process");

const OS_RASPBIAN = "raspbian";
const OS_UBUNTU = "ubuntu";
const STATE_OK = "ok";
const STATE_WARNING = "warning";

http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(getResponseBodyObject(), null, 3));
    res.end();
}).listen(port, () => {
    console.log('MinimalServerHealthInfo is running on port: ' + port);
});

function getResponseBodyObject() {
    let responseObject = {};
    responseObject.singleStates = [];
    responseObject.singleStates.push(getSingleStateObject(getTemperature));
    responseObject.singleStates.push(getSingleStateObject(getMemory));
    responseObject.singleStates.push(getSingleStateObject(getErrors));
    responseObject.overallState = getOverallState(responseObject.singleStates);
    return responseObject;
}

function getSingleStateObject(singleStateFunction) {
    let [name, val, ok] = singleStateFunction();
    let singleValue = {};
    singleValue.name = name;
    singleValue.value = val;
    singleValue.state = ok ? STATE_OK : STATE_WARNING;
    return singleValue;
}

function getOverallState(singleValues){
    return singleValues.find(sv => sv.state === STATE_WARNING) ? STATE_WARNING : STATE_OK;
}

function getTemperature(){
    let temperature;
    if(process.env.OS === OS_RASPBIAN){
        temperature = execSync("/usr/bin/vcgencmd measure_temp | awk -F \"[=']\" '{print($2)}'").toString();
    } else if (process.env.OS === OS_UBUNTU) {
        temperature = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp").toString() / 1000;
    }
    const rounded = Math.ceil(Number(temperature));
    return ["temperature", rounded, rounded <= process.env.MAX_TEMPERATURE];
}

function getMemory(){
    let memory = execSync("free | awk '/Mem/ {print $7}'").toString();
    const memoryMB = Math.ceil(Number(memory) / 1024);
    return ["memory", memoryMB, memoryMB >= process.env.MIN_MEMORY];
}

function getErrors(){
    let errors = execSync("journalctl --since \"24 hours ago\" -p err..emerg | wc -l").toString().trim();
    let errorsNumber = Number(errors);
    return ["errors", errorsNumber, errorsNumber < process.env.MAX_ERRORS];
}
