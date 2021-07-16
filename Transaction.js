const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var sb = require("satoshi-bitcoin");
const TransactionSchema = new Schema({
    involvesWatchonly: Boolean,
    account: String,
    address: String,
    category: String,
    amount: Number,
    label: String,
    confirmations: Number,
    blockHash: String,
    blockIndex: Number,
    blockTime: Number,
    txid: String,
    vout: Number,
    walletConflicts: Array,
    time: Number,
    timeReceived: Number,
    'bip125-replaceable': String,
    unknownTransaction: { type: Boolean, default: false }
});



module.exports = mongoose.model('Transaction', TransactionSchema);