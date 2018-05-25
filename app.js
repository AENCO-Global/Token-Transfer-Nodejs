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
var Ethereum = require('./ethereum.js');

main(process.argv);

function main(argv) {
    if (argv.length < 3) { // [0],[1],[2] = 3
        console.log("Missing Private key in the command line");
        return; //Terminate the execution
    }
    walletKey = argv[2]; // 2 is the First Argument
    var ethereum = new Ethereum('contracts/aen-test.json', 'wallets/out.json', walletKey);

    someTokens = 60000
    receiverWallet = "0x244c0d5533576A9685439B14a9aA7a818b832Bd1";

    //Send transaction, Call back should have the After balance
    ethereum.send(receiverWallet, someTokens, transactionStatus => {
        ethereum.getBalance(receiverWallet, result => {
            console.log("Transaction Hash:", transactionStatus);
            if (1 == transactionStatus) { //Should be 1, if not, there was an error somewhere.
                console.log("Balance :",result," Transaction Completed Successfully","You may want to verify in the future that the Totals are correct");
            } else {
                console.log("Balance :",result,"What the fuck Transaction Failed with a Zero Status. Need manual verification, Pool should be unchanged");
            }
        });
    });
    return 0;
}