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
// const debug = require('debug')('ethermod');
const debug = require('log4js');
var Ethereum = require('./ethereum.js');
const debugLevel = 'debug'; // options include, [trace, debug,info,warn,error,fatal]

main(process.argv);

function main(argv) {
    debug.configure({
        appenders: {
            out: {type: 'stdout' },
            app: {type: 'file', filename: 'ethereum-api.log', maxLogSize: 641024, backups: 5}
            },
        categories: { default: { appenders:['app', 'out'], level: 'debug'}}
    });
    const log = debug.getLogger('ethereum');

    // as a service this does not need to receive paramters
    if (argv.length < 3) { // [0],[1],[2] = 3
        log.trace("Missing Private key in the command line");
        return; //Terminate the execution
    }
    walletKey = argv[2]; // 2 is the First Argument
    var ethereum = new Ethereum('contracts/aen-test.json', 'wallets/out.json', walletKey, log);

    someTokens = 60000
    receiverWallet = "0x244c0d5533576A9685439B14a9aA7a818b832Bd1";

    //Send transaction, Call back should have the After balance
    ethereum.send(receiverWallet, someTokens, transactionStatus => {
        ethereum.getBalance(receiverWallet, result => {
            log.info("Transaction Hash:", transactionStatus);
            if (1 == transactionStatus) { //Should be 1, if not, there was an error somewhere.
                log.info("Balance :",result," Transaction Completed Successfully","You may want to verify in the future that the Totals are correct");
            } else {
                log.info("Balance :",result,"What the fuck Transaction Failed with a Zero Status. Need manual verification, Pool should be unchanged");
            }
        });
    });
    return 0;
}