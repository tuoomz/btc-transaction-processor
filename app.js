var t1 = require('./transactions-1.json');
var t2 = require('./transactions-2.json');
const Transaction = require('./Transaction');
const mongoose = require('mongoose');
var sb = require("satoshi-bitcoin");
mongoose.connect('mongodb://localhost:27017/local', { useNewUrlParser: true, useUnifiedTopology: true });


var knownAddressMap = {
	"mvd6qFeVkqH6MNAS2Y2cLifbdaX5XUkbZJ": "Wesley Crusher",
	"mmFFG4jqAtw9MoCC88hw5FNfreQWuEHADp": "Leonard McCoy",
	"mzzg8fvHXydKs8j9D2a8t7KpSXpGgAnk4n": "Jonathan Archer",
	"2N1SP7r92ZZJvYKG2oNtzPwYnzw62up7mTo": "Jadzia Dax",
	"mutrAf4usv3HKNdpLwVD4ow2oLArL6Rez8": "Montgomery Scott",
	"miTHhiX3iFhVnAEecLjybxvV5g8mKYTtnM": "James T. Kirk",
	"mvcyJMiAcSXKAEsQxbW9TYZ369rsMG6rVV": "Spock"
};

async function run() {
	try {
		// Transaction.deleteMany()
		const allTransactions = [...t1.transactions, ...t2.transactions];

		await Transaction.bulkWrite(allTransactions.map(tran => ({
			updateOne: {
				filter: { txid: tran.txid, vout: tran.vout },
				update: processTransactionBeforeInsert(tran),
				upsert: true,
			}
		})));


		await calcualteDepositsForKnownAddresses();
		await calcualteDepositsForUnknownAddresses();
		await getMinxValidDeposit();
		await getMaxValidDeposit();

	}
	catch (e) {
		console.log(e);
	}
	finally {
		mongoose.connection.close();
	}
}

run().catch(console.dir);



async function calcualteDepositsForKnownAddresses() {

	for (var address in knownAddressMap) {
		var [sum, count] = await getSumAndCountForQuery({ address: address });
		console.log("Deposited for " + knownAddressMap[address] + ": count=" + count + " sum=" + sum);
	}
}

async function calcualteDepositsForUnknownAddresses() {
	var [sum, count] = await getSumAndCountForQuery({ unknownTransaction: true });
	console.log("Deposited without reference: count=" + count + " sum=" + sum);
}

async function getMaxValidDeposit() {
	const transaction = await Transaction.findOne({ category: { $in: ['receive'] } }).sort('-amount');
	console.log('Largest valid deposit: ' + sb.toBitcoin(transaction.amount).toFixed(8));
}

async function getMinxValidDeposit() {
	const transaction = await Transaction.findOne({ category: { $in: ['receive'] } }).sort('amount');
	console.log('Smallest valid deposit: ' + sb.toBitcoin(transaction.amount).toFixed(8));
}

async function getSumAndCountForQuery(query) {

	const transactions = await Transaction.find(query).exec();

	var count = 0
	var sum = 0;

	transactions.forEach(function (t) {
		// For block rewards miniumum is 144 (1 day) source en.bitcoin.it
		if ((t.category === "receive" && t.confirmations >= 6) || (t.category === "generate" && t.confirmations > 144)) {
			count += 1;
			sum += t.amount;
		}
	});
	return [sb.toBitcoin(sum).toFixed(8), count];
}

// Here we add a flag if the tranaaction is known and covert btc to satoshi
function processTransactionBeforeInsert(transaction) {
	transaction.unknownTransaction = transaction.address in knownAddressMap ? false : true;
	transaction.amount = sb.toSatoshi(transaction.amount);
	return transaction;
}



