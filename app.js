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

main(process.argv);

function main(argv) {
    // set up the debugger and logging system ------------------------------------------------
    debug.configure({
        appenders: {
            out: {type: 'stdout' },
            app: {type: 'file', filename: 'ethereum-api.log', maxLogSize: 641024, backups: 5}
            },
        categories: { default: { appenders:['app', 'out'], level: 'debug'}}
    });
    const log = debug.getLogger('ethereum');
    //---------------------------------------------------------------------------------------

    // Start the Server Monitoring ----------------------------------------------------------
    app.listen(port, () => log.warn("Server started Listening on port ". port));
    //---------------------------------------------------------------------------------------

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
            log.debug("Private Key is:", result.privateKey);
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

    app.get('/send/rx/:add/amt/:tokens/key/:walletKey', (req, res) => {
        responce = "<h2>send</h2> \n<br/>";
        res.send(responce);
    });


    // as a service this does not need to receive paramters
    if (argv.length < 3) { // [0],[1],[2] = 3
        log.trace("Missing Private key in the command line");
        return; //Terminate the execution
    }
    walletKey = argv[2]; // 2 is the First Argument
    var ethereum = new Ethereum('contracts/aen-test.json', 'wallets/out.json', log);

    someTokens = 60000
    receiverWallet = "0x244c0d5533576A9685439B14a9aA7a818b832Bd1";


    //Send transaction, Call back should have the After balance
    ethereum.send(receiverWallet, someTokens, walletKey, transactionStatus => {
        log.info("Transaction Hash:", transactionStatus);
        ethereum.getBalance(receiverWallet, result => {
            if (1 == transactionStatus) { //Should be 1, if not, there was an error somewhere.
                log.info("Balance :",result," Transaction Completed Successfully","You may want to verify in the future that the Totals are correct");
            } else {
                log.warn("Balance :",result,"What the fuck Transaction Failed with a Zero Status. Need manual verification, Pool should be unchanged");
            }
        });
    });
    return 0;
}