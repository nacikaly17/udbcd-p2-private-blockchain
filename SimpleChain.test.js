/* ===== File SimpleChain.test.js =====================================
|  Boilerplate function to create test blocks and to test Blockchain
|  - Requirement 1 : Create test blocks within the LevelDB chain.
|  - Requirement 2 : Test the methods implemented.
|  =============================================================*/
//Importing SimpleChain classes
const SimpleChain = require('./SimpleChain.js');
const BlockClass = require('./Block.js');
const blockChain = new SimpleChain.Blockchain();
const numberOfTestBloks = 2;
const totalNumberOfBlocksInChain = 10;
const loopInMilisec = 2000;
let isGenesisBlock = false;

/* ===== function runApp() ==============================
|  Create new test blocks in  Blockchain
|  =============================================================*/
const runApp = function () {
    let app_steps = 1;
    let key = 0;
    let numberOfBlocksInChain = 0;

    console.log("");
    console.log(`#### App is running : each loop in ${loopInMilisec} msec ####`);
    console.log(`#### Each time, it creates only ${numberOfTestBloks} Blocks in LebelDB ####`);
    console.log("");

    (function theLoop(i) {
        setTimeout(function () {
            switch (app_steps) {
                case 1:  // new start : read existing blocks counter first
                    blockChain.getNextBlockHeight()
                        .then((blockHeight) => {
                            numberOfBlocksInChain = blockHeight;
                            app_steps = 2;
                        }).catch(err => {
                            app_steps = 2;
                        });
                    theLoop(i);
                    break;
                case 2:  // new start : read existing blocks 
                    if (key < numberOfBlocksInChain) {
                        blockChain.getBlock(key)
                            .then((result) => {
                                console.log("");
                                console.log(result);
                                console.log("");
                                key++;
                                if (key === numberOfBlocksInChain) {
                                    app_steps = 3;
                                }
                            })
                            .catch(err => {
                            });
                    } else {  // create new blocks
                        app_steps = 3;
                    }
                    theLoop(i);
                    break;
                case 3:
                    if (isGenesisBlock) {
                        blockChain.getBlock(0).then((result) => {
                            isGenesisBlock = false;
                            ++numberOfBlocksInChain;
                            console.log("");
                            console.log(result);
                            console.log("");
                        }).catch(err => {
                            isGenesisBlock = false;
                            console.log(err);
                            console.log("");
                        });
                        theLoop(i);
                    } else {
  
                        if (numberOfBlocksInChain < totalNumberOfBlocksInChain) {
                            let blockTest = new BlockClass.Block("Test Block - " + numberOfBlocksInChain);
                            blockChain.addBlock(blockTest).then((result) => {
                                console.log("");
                                console.log(result);
                                console.log("");
                                numberOfBlocksInChain++;
                                ++i;
                                if (i < numberOfTestBloks) theLoop(i);

                            })
                                .catch(err => {
                                    if (err.type === blockChain.errorGenesisBlock) {
                                        isGenesisBlock = true;
                                        console.log(err);
                                        theLoop(i);
                                    }
                                });
                        } else {
                            console.log("");
                            console.log(`#### No more Blocks to create because of max  ${totalNumberOfBlocksInChain} Blocks in chain allowed ####`);
                            app_steps = 4;
                        }
                    }
                    break;
                default:
                    break;

            }
        }, loopInMilisec);
    })(0);
}


/* =====  program run ===========================================
|  - Entry point to run SimpleChain.js  program: 
|  $ node SimpleChain.test.js
|  =============================================================*/

runApp();

