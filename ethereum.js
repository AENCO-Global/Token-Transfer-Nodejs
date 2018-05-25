/*
 Streams all values from a public contract array. Callback is a function that takes a single
 argument, one item from the array. Returns a promise that rejects if there is any error or
 resolves if all items have been retrieved.
*/
module.exports = function(contractJSON, walletJSON, senderKey ) {
    const Web3 = require('web3');
    const Tx = require('ethereumjs-tx');
    const fs = require('fs');
    const self = this;

    // Contract Details from the json file
    var contractFile = JSON.parse(fs.readFileSync(contractJSON,'utf-8'));
    var contractAdd = contractFile.address ;
    var contractNet = contractFile.network ;
    var contractAbi = contractFile.abi;

    // Sender walet Details from the json file
    var walletFile = JSON.parse(fs.readFileSync(walletJSON,'utf-8'));
    var walletFrom = walletFile.address;
    var walletKey = senderKey;

    console.log("Contract Add:",contractAdd);
    console.log("Contract Net:",contractNet);
    console.log("Sender Add:", walletFrom);
    console.log("Sender Key:", walletKey);

    const web3 = new Web3(new Web3.providers.HttpProvider(contractNet));
    const contract = new web3.eth.Contract(contractAbi,contractAdd);

    this.sendSigned = function(txData, cb) { // Sends signed transaction.
        console.log("Private Key:",walletKey);
        var privateKeyBuff = Buffer.from(walletKey, 'hex');
        var transaction = new Tx(txData);
        transaction.sign(privateKeyBuff); //Sign the transaction
        var serializedTx = transaction.serialize().toString('hex');
        web3.eth.sendSignedTransaction('0x' + serializedTx)
            .once('receipt', function(receipt){
                console.log("Receipt:",receipt.to);
                web3.eth.getTransaction(receipt.transactionHash).then(transaction => {
                    console.log("Transaction Code:", transaction.hash);
                });
            })
            .on('confirmation', function(confirmationNo, receipt) {
                console.log("Confirmation No:",confirmationNo);
                if (confirmationNo == 24) {
                    cb(receipt.status);
                }
            })
            .on('error', function(err){
                console.log("Contract Error (Possible out of Gas)", err);
            });
    };

    this.send = function(tokensTo, tokenQuantity, cb ) {
        web3.eth.getTransactionCount(walletFrom).then(txCount => { // get transactions no to create a fresh nonce
            web3.eth.net.getId().then(chainId => {
                console.log("Sending ",tokenQuantity,"From [",walletFrom, "] to [",tokensTo, "]");

                const txData = { // construct the transaction data
                    nonce: web3.utils.toHex(txCount),
                    gasLimit: web3.utils.toHex(25000),
                    gasPrice: web3.utils.toHex(10e9), // 10 Gwei
                    gas: 210000,
                    to: contractAdd,
                    from: walletFrom,
                    value: web3.utils.toHex(web3.utils.toWei("0", 'wei')),
                    data: contract.methods.transfer(tokensTo, tokenQuantity).encodeABI(),
                    chainId:chainId
                };
                this.sendSigned(txData, transactionHash => { // Call to Send the transaction
                    cb(transactionHash);
                });
            });
        });
    };
    this.getBalance = function(tokensTo, cb) {
        contract.methods.balanceOf(tokensTo).call().then(function(balance) {
            contract.methods.decimals().call().then(function (decimals) { // get decimals
                finalBalance = parseFloat(balance) / Math.pow(10, decimals);
                cb(finalBalance);
            })
        })
    }
};