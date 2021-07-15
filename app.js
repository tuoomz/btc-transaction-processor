console.log("Hello World 1");
var t1 = require('./transactions-1.json');
var t2 = require('./transactions-2.json');



var addressNameMap = {
  "mvd6qFeVkqH6MNAS2Y2cLifbdaX5XUkbZJ": "Wesley Crusher",
  "mmFFG4jqAtw9MoCC88hw5FNfreQWuEHADp": "Leonard McCoy",
  "mzzg8fvHXydKs8j9D2a8t7KpSXpGgAnk4n": "Jonathan Archer",
  "2N1SP7r92ZZJvYKG2oNtzPwYnzw62up7mTo": "Jadzia Dax",
  "mutrAf4usv3HKNdpLwVD4ow2oLArL6Rez8": "Montgomery Scott",
  "miTHhiX3iFhVnAEecLjybxvV5g8mKYTtnM": "James T. Kirk",
  "mvcyJMiAcSXKAEsQxbW9TYZ369rsMG6rVV": "Spock",
  "": "Unknown"
};


const { MongoClient } = require("mongodb");
//const uri ="mongodb://mongo:27017";
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
console.log("Mongo Client Created 1")
async function loadData() {
  try {
    await client.connect();
    const database = client.db('local');
    const transactions = database.collection('transactions');
    transactions.drop()
    allTransactions = [...t1.transactions, ...t2.transactions]
    let uniqueTransactionKeys = new Set()

    allTransactions.forEach(function (value) {
      key = value.txid + value.vout;
      if (!uniqueTransactionKeys.has(key)) {
        transactions.insertOne(value)
        uniqueTransactionKeys.add(key)
      }
    });

    count = await transactions.count();
    await processdData(transactions)

  }
  catch (e) {
    console.log(e);
  }
  finally {
    client.close();
  }
}

loadData().catch(console.dir);



async function processdData(transactions) {
  console.log("Processign Data")
  const transactionMap = new Map();

  // Get all transactiosn form the db
  const transactionsFromDB = await transactions.find().toArray();

  // Buuidl a map with each address as key and an array of transactions as value
  for (var i = 0, l = transactionsFromDB.length; i < l; i++) {
    var address = transactionsFromDB[i].address;
    key = (address in addressNameMap)? address:"";
    
    //console.log(key)
    if (!transactionMap[key]) { transactionMap[key] = [] }
    transactionMap[key].push(transactionsFromDB[i])
  }


  for (var address in addressNameMap) {
    printTotals(transactionMap, address);
  }

  
}


function printTotals(transactionMap, address) {
  count = 0;
  sum = 0;

  transactionMap[address].forEach(function (t, index) {
    // For blovk rewards manfrimation is 144 (1 day) source en.bitcoin.it
    if ((t.category === "receive" && t.confirmations > 6) || (t.category === "generate" && t.confirmations > 144)) {
      count += 1;
      sum += t.amount;
    }
  });
  console.log("Deposited for " + addressNameMap[address] + ": count=" + count + " sum=" + sum);
}



