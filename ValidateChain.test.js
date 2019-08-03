/* ===== File ValidateChain.test.js =====================================
|  Boilerplate function to create validate blocks in Blockchain
|  - Requirement 1 : Create test blocks within the LevelDB chain.
|  - Requirement 2 : validate blocks in chain.
|  =============================================================*/
//Importing SimpleChain classes
const SimpleChain = require('./SimpleChain.js');
const blockChain = new SimpleChain.Blockchain();
const loopInMilisec = 1000;

/* ===== function ValidateChain() ==============================
|  validate  Blockchain
|  =============================================================*/
const ValidateChain = function () {
    (function theLoop() {
        setTimeout(function () {

            blockChain.validateChain()
                .then((result) => {
                    console.log(result);
                })
                .catch(err => {
                    console.log(err);
                });

        }, loopInMilisec);
    })();
}

/* ===== function TestGetBlockHeight() ==============================
|  Testing getBlockHeight()
|  =============================================================*/
const TestGetBlockHeight = function () {
    (function theLoop() {
        setTimeout(function () {

            blockChain.getBlockHeight()
                .then((blockHeight) => {
                    console.log("getBlockHeight : ", blockHeight);
                }).catch(err => {
                    console.log(err);
                });

        }, loopInMilisec);
    })();
}

/* ===== function TestGetBlockHeight() ==============================
|  Testing getBlockHeight()
|  =============================================================*/
const ValidateBlock = function () {
    let app_steps = 1;
    let numberOfBlocksInChain = 0;
    (function theLoop(i) {
        setTimeout(function () {
            switch (app_steps) {
                case 1:
                    blockChain.getNextBlockHeight()
                        .then((blockHeight) => {
                            numberOfBlocksInChain = blockHeight;
                            app_steps = 2;
                        }).catch(err => {
                            console.log(err);
                            app_steps = 3;
                        });
                    theLoop(i);
                    break;
                case 2:
                    blockChain.validateBlock(i)
                        .then((result) => {
                            console.log('Block # ' + i + " VALID " +result );
                            ++i;
                            if(i < numberOfBlocksInChain ){
                                theLoop(i);
                            }else{
                                app_steps = 3;
                            }
                        }).catch(err => {
                            console.log(err);
                        });
                    break;
                default:
                    break;
            }
        }, loopInMilisec);
    })(0);
}




/* =====  program run ===========================================
|  $ node ValidateChain.test.js
|  =============================================================*/

//TestGetBlockHeight();
//ValidateBlock();
ValidateChain();
