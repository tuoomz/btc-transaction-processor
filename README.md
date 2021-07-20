# Bitcoin transaction processor
The data we work with in this scenario comes from bitcoind’s rpc call `listsinceblock`. A frequently used approach to detect incoming deposits is to periodically call `listsinceblock` and process the returned data. This app contains 2 json files that represent the data from 2 separate calls to this endpoint. The script processes those files and detects all valid incoming deposits.

**Goal**: Process transactions and filter them for valid deposits.

**Note**: A deposit is considered valid when it has at least 6 confirmations.

Known customer addresses are:
* Wesley Crusher: mvd6qFeVkqH6MNAS2Y2cLifbdaX5XUkbZJ
* Leonard McCoy: mmFFG4jqAtw9MoCC88hw5FNfreQWuEHADp
* Jonathan Archer: mzzg8fvHXydKs8j9D2a8t7KpSXpGgAnk4n
* Jadzia Dax: 2N1SP7r92ZZJvYKG2oNtzPwYnzw62up7mTo
* Montgomery Scott: mutrAf4usv3HKNdpLwVD4ow2oLArL6Rez8
* James T. Kirk: miTHhiX3iFhVnAEecLjybxvV5g8mKYTtnM
* Spock: mvcyJMiAcSXKAEsQxbW9TYZ369rsMG6rVV

## Requirements

Build a dockerized Node.js application to process the two transaction sets. 


1. Read all transactions from `transactions-1.json` and `transactions-2.json` and store all deposits in a database of your choice.
2. Read deposits from the database that are good to credit to users and print the following 8 lines on stdout:

    ```
    Deposited for Wesley Crusher: count=n sum=x.xxxxxxxx
    Deposited for Leonard McCoy: count=n sum=x.xxxxxxxx
    Deposited for Jonathan Archer: count=n sum=x.xxxxxxxx
    Deposited for Jadzia Dax: count=n sum=x.xxxxxxxx
    Deposited for Montgomery Scott: count=n sum=x.xxxxxxxx
    Deposited for James T. Kirk: count=n sum=x.xxxxxxxx
    Deposited for Spock: count=n sum=x.xxxxxxxx
    Deposited without reference: count=n sum=x.xxxxxxxx
    Smallest valid deposit: x.xxxxxxxx
    Largest valid deposit: x.xxxxxxxx
    ```



## Assumptions
* Deposits of zero are valid
* A generate transaction with over 144 confirmation (1 day) is a valid deposit

## Design Decisions
* I used node.js and mongo with a mongoose data model
* Before storing the transaction in the database, I added a flag to differentiate known and unknown transactions. This will make subsequent queries easier but will have some overhead if you need to change the flag for an account afterwards.
* To avoid floating point errors I stored btc amounts in a database as Satoshi.


## Expected output
Deposited for Wesley Crusher: count=35 sum=217.00000000
Deposited for Leonard McCoy: count=15 sum=64.00000000
Deposited for Jonathan Archer: count=18 sum=99.69000000
Deposited for Montgomery Scott: count=0 sum=0.00000000
Deposited for James T. Kirk: count=28 sum=1267.00848015
Deposited for Spock: count=15 sum=713.88081478
Deposited without reference: count=58 sum=1121.57171583
Smallest valid deposit: 0.00000000
Largest valid deposit: 99.49379661