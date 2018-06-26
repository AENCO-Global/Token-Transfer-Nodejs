# Token-Transfer-Nodejs
Module to transfer tokens.

    To run this script, you need to pass the key into the call, example through node mon looks as follows:
    Nodemon will monitor the folder fr file changes and rerun the scripts 
    format:
    '''
    node app.js [sending wallet key]
    '''
    Example: Key is fake, use your own...
    '''
    node app.js a1b2c3d4e5f6g7h8i9j10k11l12m13n14o15p16q17r18s19t20
    or
    nodemon app.js a1b2c3d4e5f6g7h8i9j10k11l12m13n14o15p16q17r18s19t20
    or
    -With Debug installed for logging. use the command as follows: you may like to consider winston for more function
    npm install debug --save  // To install the module
    then
    DEBUG=ethermod nodemon ./app.js [my private key]

    This has changed, and now you can interact at the get command line.
