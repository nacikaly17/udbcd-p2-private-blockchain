/* ===== File SimpleChain.js =====================================
|  Persist data with LevelDB and includes the Node.js level 
|  library and configured  to persist data within the project 
|  directory.
|  =============================================================*/

// Importing the module 'level'
const level = require('level');
// Declaring the folder path that store the data
const chainDB = './chaindata';
// Importing  node.js libary "crypto-js/sha256" 
const SHA256 = require('crypto-js/sha256');
//Importing SimpleChain classes
const blockClass = require('./Block.js');

const noErrorValidateChain = 'No errors detected';

/* ===== class Blockchain  ===========================================
|  Class with a constructor for Blockchain 
|  =============================================================*/
class Blockchain {

    // Declaring the class constructor
    constructor() {
        this.errorLog = [];
        this.counter = 0;
        this.chain = [];  // used only during  validate 
        this.db = level(chainDB);
    }

    /* ===== method getBlockHeight() =========================
    |  retrieves  block height from last block within the LevelDB chain.
    |  =============================================================*/

    getBlockHeight() {

        let self = this;
        return new Promise((resolve, reject) => {
            let blockHight = 0;
            self.db.createReadStream({ reverse: true, limit: 1 })
                .on('data', function (data) {
                    blockHight = JSON.parse(data.value).height;
                })
                .on('error', function (err) {
                    reject(err);
                })
                .on('close', function () {
                    resolve(blockHight);
                });
        });
    }

    /* ===== method getNextBlockHeight() =========================
|  retrieves next block height within the LevelDB chain.
|  =============================================================*/

    getNextBlockHeight() {

        let self = this;
        self.counter = 0;
        return new Promise((resolve, reject) => {
            self.db.createKeyStream()
                .on('data', function (key) {
                    self.counter++;
                })
                .on('error', function (err) {
                    reject({ type: err });
                })
                .on('close', function () {
                    resolve(self.counter);
                });
        });
    }

    /* ===== method getBlock(blockHeight) =========================
    |  retrieves a block by block height within the LevelDB chain.
    |  =============================================================*/

    getBlock(key) {

        let self = this;
        return new Promise((resolve, reject) => {
            self.db.get(key, (err, value) => {
                if (err) {
                    if (err.type === self.errorNotFound) {
                        reject({ type: self.errorNotFound });
                    } else {
                        console.log('Block ' + key + ' get failed', err);
                        reject(err);
                    }
                } else {
                    resolve(JSON.parse(value));
                }
            });
        });
    }

    /* ===== method prepareNewBlock(newBlock, height, previousBlock) 
    |  prepares newBlock data.
    |  =============================================================*/

    prepareNewBlock(block, height, previousBlock) {

        // Block height
        block.height = height;
        // UTC timestamp
        block.time = new Date().getTime().toString().slice(0, -3);
        // previous block hash
        if (height > 0) {
            block.previousBlockHash = previousBlock.hash;
        }
        // Block hash with SHA256 using newBlock and converting to a string
        block.hash = SHA256(JSON.stringify(block)).toString();

    }

    /* ===== method addBlock(block) ==============================
    |  method to store newBlock to LevelDB.
    |  =============================================================*/

    addBlock(block) {

        let self = this;
        return new Promise((resolve, reject) => {
            self.getNextBlockHeight()
                .then((blockHeight) => {
                    // console.log(blockHeight);
                    if (blockHeight === 0) {
                        //
                        let block = new blockClass.Block("First block in the chain - Genesis block")
                        // Prepare block to add to the chain
                        self.prepareNewBlock(block, 0, null);
                        let value = JSON.stringify(block).toString();
                        self.db.put(0, value, function (err) {
                            if (err) {
                                console.log('Block ' + 0 + ' submission failed', err);
                                reject(err);
                            }
                            resolve(JSON.parse(value));
                        });
                        //
                        reject({ type: self.errorGenesisBlock });
                    } else {
                        let previousBlockHeight = blockHeight - 1;
                        self.getBlock(previousBlockHeight).then((previousBlock) => {
                            // Prepare block to add to the chain
                            self.prepareNewBlock(block, blockHeight, previousBlock);
                            let value = JSON.stringify(block).toString();
                            self.db.put(blockHeight, value, function (err) {
                                if (err) {
                                    console.log('Block ' + blockHeight + ' submission failed', err);
                                    reject(err);
                                }
                                resolve(JSON.parse(value));
                            });
                        }).catch(err => {
                            reject(err);
                        });
                    }
                }).catch(err => {
                    reject(err);
                });

        });
    }

    /* ===== method validateData() ===========================
    |  validate a block 
    |  =============================================================*/

    validateData(block) {

        // get block hash
        let blockHash = block.hash;
        // remove block hash to test block integrity
        block.hash = '';
        // generate block hash
        let validBlockHash = SHA256(JSON.stringify(block)).toString();
        // Compare
        if (blockHash === validBlockHash) {
            block.hash = blockHash;
            return true;
        } else {
            console.log('Block #' + block.height
                + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
            block.hash = blockHash;
            return false;
        }
    }

    /* ===== method validateBlock(blockHeight) ===========================
    |  validate a block stored within levelDB. 
    |  =============================================================*/
    validateBlock(blockHeight) {

        let self = this;
        return new Promise((resolve, reject) => {
            self.db.get(blockHeight, (err, value) => {
                if (err) {
                    if (err.type === self.errorNotFound) {
                        reject({ type: self.errorNotFound });
                    } else {
                        console.log('Block ' + blockHeight + ' get failed', err);
                        reject(err);
                    }
                } else {
                    resolve(self.validateData(JSON.parse(value)));
                }
            });
        });
    }

    /* ===== method validateChainData() ===========================
    |  validate 2 blocks in chain array 
    |  =============================================================*/

    validateChainData(chain) {

        // validate block
        if (!this.validateData(chain[0]))
            this.errorLog.push(chain[0].height);
        // compare blocks hash link
        let blockHash = chain[0].hash;
        let previousHash = chain[1].previousBlockHash;
        if (blockHash !== previousHash) {
            this.errorLog.push(chain[1].height);
        }
    }

    /* ===== method validateChain() ===========================
    |  validate blockchain stored within levelDB
    |  =============================================================*/

    validateChain() {

        let self = this;
        self.errorLog = [];
        return new Promise((resolve, reject) => {
            self.getNextBlockHeight()
                .then((blockHeight) => {
                    if (blockHeight <= 1) {
                        resolve(noErrorValidateChain);
                    }
                    self.chain = [];
                    self.counter = 0;
                    self.db.createReadStream()
                        .on('data', function (data) {
                            let block = JSON.parse(data.value);
                            self.chain.push(block);
                            self.counter += 1;
                            if (self.counter >= 2) {
                                self.validateChainData(self.chain)
                                self.chain.shift();
                            }
                        })
                        .on('error', function (err) {
                            reject({ type: err });
                        })
                        .on('close', function () {
                            if (self.errorLog.length > 0) {
                                resolve(
                                    'Number of Blocks with errors = ' + self.errorLog.length
                                    + "\n"
                                    + 'Block heights: ' + self.errorLog);
                            } else {
                                resolve(noErrorValidateChain);
                            }
                        });

                }).catch(err => {
                    reject(err);
                });
        });
    }

}



// Export the classes
module.exports.Blockchain = Blockchain;
