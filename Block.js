/* ===== class Block  ===========================================
|  Class with a constructor for block 
|  =============================================================*/

class Block {

    // Declaring the class constructor
    constructor(data) {
        this.hash = '';
        this.height = 0;
        this.body = data;
        this.time = 0;
        this.previousBlockHash = "";
    }
}
module.exports.Block = Block;
