const util = require('util');
//const plugin = require('ih-plugin-api')();
const app = require('./app');

(async () => {
    let plugin;
    try {

        function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        const opt = getOptFromArgs();
        const pluginapi = opt && opt.pluginapi ? opt.pluginapi : 'ih-plugin-api';
        plugin = require(pluginapi + '/index.js')();
        plugin.log('Plugin is start.');

        plugin.params.data = await plugin.params.get();
        plugin.log('Recieve plugin parametrs: ' + util.inspect(plugin.params.data));

        plugin.channels.data = await plugin.channels.get();
        plugin.log('Recieve plugin channels: ' + util.inspect(plugin.channels.data), 2);
        //await delay(3000)
        //plugin.channels.data = await plugin.channels.get();
        //plugin.log('Recieve plugin channels: ' + util.inspect(plugin.channels.data), 2);

        app(plugin);

    } catch (err) {
        plugin.exit(8, `Error: ${util.inspect(err)}`);
    }
})();

function getOptFromArgs() {
    let opt;
    try {
        opt = JSON.parse(process.argv[2]); //
    } catch (e) {
        opt = {};
    }
    return opt;
}