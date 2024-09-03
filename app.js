const util = require('util');
const { exec } = require("child_process");
const { version, Chip, Line } = require("node-libgpiod");


module.exports = async function (plugin) {
    const period_t = plugin.params.data.period_t || 10000; 
    const period_d = plugin.params.data.period_d || 1000;
    const channels = [];
    let rchan = [];
    let sensors = [];

    // init gpio 
    global.chip = new Chip(0);
    global.btn = new Line(chip, 10);
    global.i1 = new Line(chip, 46);
    global.i2 = new Line(chip, 45);
    global.i3 = new Line(chip, 44);
    global.i4 = new Line(chip, 43);
    global.o1 = new Line(chip, 30);
    global.o2 = new Line(chip, 29);
    global.o3 = new Line(chip, 28);
    global.red = new Line(chip, 26);
    global.green = new Line(chip, 27);


    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    function oscall(cmd, noneblock) {
        return new Promise((resolve, reject) => {
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    if (noneblock) { return resolve(error) }
                    else { return reject(error) }
                }
                if (stderr) {
                    if (noneblock) { return resolve(stderr) }
                    else { return reject(stderr) }
                }
                resolve(stdout)
            })
        })
    }

    async function checkSensors() {
        //let clearID = []
        //for (let i = 1; i == 5; i++){clearID.push({id: '1W_' + i, gpio: ''})}
        //plugin.sendData(clearID)
        let reqbus = await oscall('ls /sys/bus/w1/devices/', false)
        let reqbusarr = reqbus.split("\n")
        reqbusarr.forEach(sid => {
            if (sid && (sid.substr(0, 2) == '28')) {
                plugin.log("1Wire sensor detected! ID: " + sid);
                for (let idx in channels) {
                    if (channels[idx].desc == "AI" && channels[idx].gpio == '') {
                        channels[idx]["gpio"] = sid
                        break;
                    }
                }
            }
        });
    }


    async function createChannels() {
        channels.push({ id: 'INPUTS', title: 'INPUTS', folder: 1 });
        channels.push({ id: 'RELAYS', title: 'RELAYS', folder: 1 });
        channels.push({ id: '1-WIRE', title: '1-WIRE', folder: 1 });
        channels.push({ id: 'LEDS', title: 'LEDS', folder: 1 });
        channels.push({ id: 'BUTTONS', title: 'BUTTONS', folder: 1 });
        channels.push({ id: 'DI_1', desc: 'DI', gpio: 'i1', value: 0, dvv: 0, parent: 'INPUTS', r: 1 });
        channels.push({ id: 'DI_2', desc: 'DI', gpio: 'i2', value: 0, dvv: 0, parent: 'INPUTS', r: 1 });
        channels.push({ id: 'DI_3', desc: 'DI', gpio: 'i3', value: 0, dvv: 0, parent: 'INPUTS', r: 1 });
        channels.push({ id: 'DI_4', desc: 'DI', gpio: 'i4', value: 0, dvv: 0, parent: 'INPUTS', r: 1 });
        channels.push({ id: 'BTN_USR', desc: 'DI', gpio: 'btn', value: 1, dvv: 1, parent: 'BUTTONS', r: 1, calc: 'value == 1 ? 0:1' });
        channels.push({ id: 'DO_1', desc: 'DO', gpio: 'o1', value: 0, dvv: 0, parent: 'RELAYS', r: 1, w: 1 });
        channels.push({ id: 'DO_2', desc: 'DO', gpio: 'o2', value: 0, dvv: 0, parent: 'RELAYS', r: 1, w: 1 });
        channels.push({ id: 'DO_3', desc: 'DO', gpio: 'o3', value: 0, dvv: 0, parent: 'RELAYS', r: 1, w: 1 });
        channels.push({ id: 'LED_RED', desc: 'DO', gpio: 'red', value: 1, dvv: 1, parent: 'LEDS', r: 1, w: 1, calc: 'value == 1 ? 0:1', calc_out: 'value == 1 ? 0:1' });
        channels.push({ id: 'LED_GREEN', desc: 'DO', gpio: 'green', value: 1, dvv: 1, parent: 'LEDS', r: 1, w: 1, calc: 'value == 1 ? 0:1', calc_out: 'value == 1 ? 0:1' });
        channels.push({ id: '1W_1', desc: 'AI', gpio: '', value: 0, parent: '1-WIRE', r: 1 });
        channels.push({ id: '1W_2', desc: 'AI', gpio: '', value: 0, parent: '1-WIRE', r: 1 });
        channels.push({ id: '1W_3', desc: 'AI', gpio: '', value: 0, parent: '1-WIRE', r: 1 });
        channels.push({ id: '1W_4', desc: 'AI', gpio: '', value: 0, parent: '1-WIRE', r: 1 });
        channels.push({ id: '1W_5', desc: 'AI', gpio: '', value: 0, parent: '1-WIRE', r: 1 });
    }


    async function sendChannels() {
        try {
            if (plugin.channels.data.length < 15) {
                plugin.log("Channels changed - push default channels to plugin!")
                plugin.send({ type: 'channels', data: channels });
                await delay(2000)
                plugin.channels.data = await plugin.channels.get()
                plugin.log("New channels collect!")
                //plugin.exit(333, "Push def channels!")
            }
            return await delay(200)
        } catch (e) {
            plugin.log('ERR: ' + e.message, 1);
        }
    }


    async function getrchan() {
        plugin.channels.data.forEach(function (ch) {
            if (ch.w == 1) {
                let dvv
                if (ch.value === undefined) { dvv = ch.dvv }
                else { dvv = ch.value }
                global[ch.gpio].requestOutputMode()
                global[ch.gpio].setValue(dvv)
            }
            if (ch.r == 1 && ch.desc != 'AI') {
                if (ch.w != 1) {
                    global[ch.gpio].requestInputMode();
                }
                rchan.push({ id: ch.id, gpio: ch.gpio, value: -1 })
            }
            if (ch.desc == 'AI' && ch.gpio != "") {
                sensors.push({ id: ch.id, sn: ch.gpio })
            }
        });

    }


    function readTemp(data) {
        let j, result;
        data = data.toString();
        if (data.indexOf('YES') > 0) {
            j = data.indexOf('t=')
            if (j > 0) { result = parseInt(data.substr(j + 2)) / 1000; }
        }
        return result
    }


    async function readio() {
        const pool = () => {
            let sendival = []
            rchan.forEach(function (io, index) {
                let ioid = io.gpio
                let iov = global[ioid].getValue()
                if (io.value != iov) {
                    sendival.push({ id: io.id, value: iov, chstatus: 0 })
                    rchan[index].value = iov
                }
                iov = -1
            });
            if (sendival.length != 0) { plugin.sendData(sendival) }
            setTimeout(pool, period_d);
        };
        setTimeout(pool, 250);
    }


    async function read1w() {
        const pools = async () => {
            let sensData = [];
            for (let s of sensors) {
                let sdata = await oscall('cat /sys/bus/w1/devices/' + s.sn + '/w1_slave', true)
                let temp = readTemp(sdata)
                if (temp === undefined) { sensData.push({ id: s.id, chstatus: 1 }) }
                else { sensData.push({ id: s.id, value: temp, chstatus: 0 }) }
                plugin.log("1W SensorID: " + s.id + "   value: " + temp, 2)
            }
            plugin.sendData(sensData)
            setTimeout(pools, period_t);
        }
        setTimeout(pools, 500);
    }


    function write(cmds) {
        cmds.forEach(function (cmd) {
            let oid = cmd.gpio
            global[oid].setValue(cmd.value);
        })
    }


    plugin.onAct(message => {
        plugin.log('Action data=' + util.inspect(message), 1);
        if (!message.data) return;
        write(message.data);
    });


    await oscall('echo 538 539 522 555 556 557 558 540 541 542 | xargs -n 1 echo >/sys/class/gpio/unexport', true)
    await createChannels()
    await checkSensors()
    await sendChannels()
    await getrchan()
    await readio()
    await read1w()
};