/*
    To run this script, you need to pass the key into the call, example through node mon looks as follows:
    Nodemon will monitor the folder fr file changes and rerun the scripts
    format:
    node app.js [sending wallet key]
    Example: Key is fake, use your own...
    node app.js a1b2c3d4e5f6g7h8i9j10k11l12m13n14o15p16q17r18s19t20
    or
    nodemon app.js a1b2c3d4e5f6g7h8i9j10k11l12m13n14o15p16q17r18s19t20
*/
const debug = require('log4js');
const debugLevel = 'debug'; // options include, [trace, debug,info,warn,error,fatal]
var Ethereum = require('./ethereum.js'),
    express = require('express'),
    app = express(),
    port = process.env.PORT || 8001;

main();

function main(argv) {
    // set up the debugger and logging system ------------------------------------------------
    debug.configure({
        appenders: {
            out: {type: 'stdout' },
            app: {type: 'file', filename: 'ethereum-api.log', maxLogSize: 641024, backups: 5}
            },
        categories: { default: { appenders:['app', 'out'], level: debugLevel}}
    });
    const log = debug.getLogger('ethereum');
    //---------------------------------------------------------------------------------------


    // Start the Server Monitoring ----------------------------------------------------------
    app.listen(port, () => log.warn("Server started Listening on port ", port));

    //---------------------------------------------------------------------------------------

    // create the base  object and paramters for the deployed system-------------------------
    let wallets =   {   "test"      : 'wallets/out.json' ,
                        "main"      : 'wallets/out.json',
                        "default"   : 'wallets/out.json'
                    };
    let contracts = {   "test"      : 'contracts/aen-test.json' ,
                        "main"      : 'contracts/aen-live.json',
                        "default"   : 'contracts/aen-test.json'
    };
    // Note to change this for Jenkins deployment, possible replace with tags.
    let ethereum = new Ethereum(contracts.test, wallets.default, log);
    // --------------------------------------------------------------------------------------


    /* ------------------------------------------------------------ */
    app.get('/', (req, res) => { // default fall back
        responce = "<h1>Welcome to the API</h1> \n";
        responce += "<h2>For more details refer to the Documentation</h2> \n";
        responce += "<h3><a href='https://www.notion.so/aencoins/Ethereum-API-7ccc462d3ac04c76b882fb15cdc63390'>https://www.notion.so/aencoins/Ethereum-API-7ccc462d3ac04c76b882fb15cdc63390</a> </h3>\n";
        res.send(responce);
    });

    /* ------------------------------------------------------------ */
    app.get('/createWallet', (req, res) => {  // create a wallet
        ethereum.createWallet(result =>{
            log.debug("Wallet Add is:", result.address);
            // log.debug("Private Key is:", result.privateKey);  //Do not use this accept in Emergency
            let resObj = {
                "code" : 0,
                "msg" : "Success",
                "address": result.address,
                "key": result.privateKey
            };
            responce = JSON.stringify(resObj);
            res.send(responce);
        });
    });


    /* ------------------------------------------------------------ */
    app.get('/getBalance', (req, res) => {  //Get balance
        add = req.query.address;
        log.debug(add)
        ethereum.getBalance(add, result => {
            log.info(add, " has a Balance of ",result);
            let resObj = {
                "code" : 0,
                "msg" : "Success",
                "address": add,
                "total": result
            };
            responce = JSON.stringify(resObj);
            res.send(responce);
        });
    });

    /* ------------------------------------------------------------ */
    app.get('/send', (req, res) => {
        dec = 8; // The decimal place, should get from the contract
        add = req.query.address;
        ttl = parseFloat(req.query.amount);
        amt = ttl.toFixed(dec).replace(".","");  //Pad zeros to the decimal amount and remove the decimal place
        key = req.query.key;
        log.info("Sending ", amt," to ", add , " with the key ",key);

        //Send transaction, Call back should have the After balance
        ethereum.send(add, amt, key, cbObj => {
            let resObj = {
                "code" : cbObj.code,
                "msg" : "Success",
                "address": add,
                "total": amt,
                "tx" : cbObj.tx
            };
            // /rx/:add/amt/:tokens/key/:walletKey
            responce = JSON.stringify(resObj);
            res.send(responce);
        });
    });

    /* ------------------------------------------------------------ */
    app.post('/send', (req, res) => {
        dec = 8; // The decimal place, should get from the contract
        add = req.body.address;
        ttl = parseFloat(req.body.amount);
        amt = ttl.toFixed(dec).replace(".","");  //Pad zeros to the decimal amount and remove the decimal place
        key = req.body.key;
        log.info("Sending ", amt," to ", add , " with the key ",key);

        //Send transaction, Call back should have the After balance
        ethereum.send(add, amt, key, cbObj => {
            let resObj = {
                "code" : cbObj.code,
                "msg" : "Success",
                "address": add,
                "total": amt,
                "tx" : cbObj.tx
            };
            // /rx/:add/amt/:tokens/key/:walletKey
            responce = JSON.stringify(resObj);
            cb(responce);
        });
        res.end(responce);
    });

        return 0;
}