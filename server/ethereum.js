/*
 Streams all values from a public contract array. Callback is a function that takes a single
 argument, one item from the array. Returns a promise that rejects if there is any error or
 resolves if all items have been retrieved.
 pass the log object from the calling application, see Notes in the MD for help
*/
module.exports = function(contractJSON, walletJSON, log ) {
    const Web3 = require('web3');
    const Tx = require('ethereumjs-tx');
    const fs = require('fs');
    const self = this;

    // Contract Details from the json file
    let contractFile = JSON.parse(fs.readFileSync(contractJSON,'utf-8'));
    let contractAdd = contractFile.address ;
    let contractNet = contractFile.network ;
    let contractAbi = contractFile.abi;

    // Sender walet Details from the json file
    let walletFile = JSON.parse(fs.readFileSync(walletJSON,'utf-8'));
    let walletFrom = walletFile.address;

    log.info("Contract Add:",contractAdd);
    log.info("Contract Add:",contractAdd);
    log.info("Contract Net:",contractNet);
    log.info("Out Wallet Add:", walletFrom);

    const web3 = new Web3(new Web3.providers.HttpProvider(contractNet));
    const contract = new web3.eth.Contract(contractAbi,contractAdd);

    this.createWallet = function(cb) {
        result = web3.eth.accounts.create();
        cb(result);
    };

    this.send = function(tokensTo, tokenQuantity, walletKey, cb ) {
        web3.eth.getTransactionCount(walletFrom).then(txCount => { // get transactions no to create a fresh nonce
            web3.eth.net.getId().then(chainId => {
                log.info("Sending",tokenQuantity,"From ",walletFrom, "to",tokensTo, " Chain",chainId );

                const txData = { // construct the transaction data
                    nonce: web3.utils.toHex(txCount),
                    gasLimit: web3.utils.toHex('90000'),
                    gasPrice: web3.utils.toHex('10000000000'), // 10 Gwei (From [1 Gwei]:1,000,000,000 to [99 Gwei]:99,000,000,000
                    gas: web3.utils.toHex('4700000'),
                    to: contractAdd,
                    from: walletFrom,
                    value: "0x00",
                    data: contract.methods.transfer(tokensTo, tokenQuantity).encodeABI(),
                    chainId: chainId
                };
                this.sendSigned(txData, walletKey, txResult => { // Call to Send the transaction
                    cb(txResult);
                });
            });
        });
    };

    this.sendSigned = function(txData, walletKey, cb) { // Sends signed transaction.
        let privateKeyBuff = Buffer.from(walletKey, 'hex');
        let transaction = new Tx(txData);
        let cbObj = {};
        cbObj.code = 0 ;
        cbObj.msg = "" ;
        cbObj.tx = "" ;

        try {
            transaction.sign(privateKeyBuff); //Sign the transaction
            var serializedTx = transaction.serialize().toString('hex');
        } catch(err) {
            if(err.message.indexOf('private key length') > -1 ) {
                cbObj.code = -2;
                cbObj.msg = "Error (Invalid Private Key Length)";
                log.warn("Private Key Error (Invalid Private Key) ");
            } else {
                cbObj.code = -1;
                log.warn("Private Key Error (Invalid Private Key) ",err);
            }
            cb(cbObj);
            return;
        }

        web3.eth.sendSignedTransaction('0x' + serializedTx)
            .once('receipt', function(receipt){
                log.info("Receipt to:",receipt.to);
                web3.eth.getTransaction(receipt.transactionHash).then(transaction => {
                    log.info("Transaction Code:", transaction.hash);
                    cbObj.code = 0;
                    cbObj.msg = "Success"
                    cbObj.tx = transaction;
                    cb(cbObj);
                });
            })
            // This block will trigger for every confirmation trigger from the blockchain
            // .on('confirmation', function(confirmationNo, receipt) {
            //     log.debug("Confirmation No:",confirmationNo);
            //     if (confirmationNo == 24) {
            //         cb(receipt.status);
            //     }
            // })
            .on('error', function(err){
                if(err.message.indexOf('insufficient funds') > -1 ) {
                    log.error("Contract Error","(Possible out of Gas) ", err );
                    cbObj.code = -3;
                    cbObj.msg = "Error (Out of Gas)";
                    cb(cbObj);
                } else {
                    log.error("Contract Error (Unexpected) \n", err);
                    cbObj.code = -4;
                    cbObj.msg = "Error (Check Logs)";
                    cb(cbObj);
                }
            });
    };
    this.getBalance = function(tokensTo, cb) {
        contract.methods.balanceOf(tokensTo).call().then(function(balance) {
            contract.methods.decimals().call().then(function (decimals) { // get decimals
                finalBalance = parseFloat(balance) / Math.pow(10, decimals);
                cb(finalBalance);
            })
        })
    };

    this.version = function(cb) {
        fs.readFile('version.info','utf8', function(err,data){
            if (err) {
                log.error('Version file missing',err);
            }
            cb(data);
        });
    };

    this.logs = function(cb) {
        fs.readFile('ethereum-api.log','utf8', function(err,data){
            if (err) {
                log.error('Log File missing',err);
            }
            cb(data.replace(/\r?\n/g, "<br>") );
        });
    }

};