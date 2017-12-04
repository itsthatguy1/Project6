/**
 *   @author Sean Stock (sstock6829@gmail.com)
 *   @version 0.0.1
 *   @summary Project 6 File I/O || created: 11.6.17
 */

"use strict";
const PROMPT = require('readline-sync');
const IO = require(`fs`);

let customerNumber;
let menuChoice;
let customerInfo = [];
let transactionInfo = [];
const ID = 0, FIRST_NAME = 1, LAST_NAME = 2, CASH_SPENT = 3, TRANSACTIONS = 1, WEEKLY_CASH = 2;

/**
 * @method
 * @desc The main dispatch method
 */
function main() {
    loadCustomerInfo();
    loadTransactionInfo();
    setMenuChoice();
    setCustomerNumber();
    if (menuChoice === 0) {
        setNewCustomerInfo();
    }
    else if (menuChoice === 1) {
        createTransaction();
    }
    else if (menuChoice === 2) {
        reconcileTransactions();
    }
    writeCustomerInfo();
    writeTransactionInfo();
}

main();

/**
 * @method
 * @desc Allows user to select a menu option
 */
function setMenuChoice() {
    process.stdout.write('\x1Bc');
    menuChoice = Number(PROMPT.question(`\nIf you would like to enter a new customer, please enter "0". \nIf you would like to enter a transaction, please enter "1" \nIf you would like to consolidate the Transaction and Master Files, please enter "2" `));
    while (menuChoice !== 0 && menuChoice !== 1 && menuChoice !== 2) {
        console.log(`I'm sorry, that is an incorrect value. Please try again.`);
        menuChoice = Number(PROMPT.question(`\nIf you would like to enter a new customer, please enter "0". \nIf you would like to enter a transaction, please enter "1" \nIf you would like to consolidate the Transaction and Master Files, please enter "2" `));
    }
}

/**
 * @method
 * @desc Loads info from the master file into the customerInfo array, or creates an empty file if it does not already exist
 */
function loadCustomerInfo() {
    if (IO.existsSync(`data/master.csv`)) {
        let masterFile = IO.readFileSync(`data/master.csv`, 'utf8');
        let lines = masterFile.toString().split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
            customerInfo.push(lines[i].toString().split(/,/));
        }
    }
    else {
        IO.appendFileSync(`data/master.csv`, "");
    }
}

/**
 * @method
 * @desc Loads info from the transaction file into the transactionInfo array, or creates an empty one if it does not already exist
 */
function loadTransactionInfo() {
    if (IO.existsSync(`data/transaction.csv`)) {
        let transactionFile = IO.readFileSync(`data/transaction.csv`, 'utf8');
        let lines = transactionFile.toString().split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
            transactionInfo.push(lines[i].toString().split(/,/));
        }
    }
    else {
        IO.appendFileSync(`data/transaction.csv`, "");
        for (let i = 0; i < customerInfo.length; i++) {
            transactionInfo[i] = [];
            transactionInfo[i][WEEKLY_CASH] = Number(0);
        }
    }
    if (customerInfo.length > transactionInfo.length) {
        transactionInfo[transactionInfo.length] = [];
    }
    for (let i = 0; i < customerInfo.length; i++) {
        transactionInfo[i][ID] = customerInfo[i][ID];
    }
}

/**
 * @method
 * @desc Allows user to select what customer they will enter a transaction for, or sets the customer number to a new customer.
 */
function setCustomerNumber() {
    process.stdout.write('\x1Bc');
    let reRun = 0;
    if (menuChoice === 0) {
        customerNumber = customerInfo.length;
    }
    else if (menuChoice === 1) {
        let customerID = PROMPT.question(`\nPlease enter the customer's ID: `);
        for (let i = 0; customerID !== customerInfo[i][ID] && i < customerInfo.length - 1; i++) {
            customerNumber = i + 1;
            if (customerID !== customerInfo[customerNumber][ID] && i === customerInfo.length - 2) {
                console.log(`I'm sorry, that is an incorrect customer ID. Please try again.`);
                reRun = 1;
            }
        }
        if (customerID === customerInfo[0][ID]) {
            customerNumber = 0;
        }
    }
    if (reRun === 1) {
        setCustomerNumber();
    }
}

/**
 * @method
 * @desc Populates the customerInfo array for a new customer
 */
function setNewCustomerInfo() {
    process.stdout.write('\x1Bc');
    customerInfo[customerNumber] = [];
    customerInfo[customerNumber][ID] = createCustomerID();
    customerInfo[customerNumber][FIRST_NAME] = PROMPT.question(`\nWhat is the customer's first name? `);
    customerInfo[customerNumber][LAST_NAME] = PROMPT.question(`\nWhat is the customer's last name? `);
    customerInfo[customerNumber][CASH_SPENT] = Number(0);
}

/**
 * @method
 * @desc Creates a unique random customer ID
 */
function createCustomerID() {
    const MIN_ID = 10000, MAX_ID = 99999;
    let customerID =  Number(Math.floor(Math.random() * (MAX_ID - MIN_ID)) + MIN_ID);
    if (customerInfo.length > 1) {
        for (let i = 0; i < customerInfo.length; i++) {
            if (customerInfo[i][ID] == customerID) {
                customerID =  Number(Math.floor(Math.random() * (MAX_ID - MIN_ID)) + MAX_ID);
                for (let j = 0; j <customerInfo.length; j++) {
                    if (customerInfo[j][ID] == customerID) {
                        customerID =  Number(Math.floor(Math.random() * (MAX_ID - MIN_ID)) + MIN_ID);
                    }
                }
            }
        }
    }
    return customerID;
}

/**
 * @method
 * @desc Allows user to enter a new transaction for an existing customer
 */
function createTransaction() {
    process.stdout.write('\x1Bc');
    transactionInfo[customerNumber][TRANSACTIONS] = PROMPT.question(`\nPlease enter the service the customer has received: `);
    transactionInfo[customerNumber][WEEKLY_CASH] = Number(PROMPT.question(`\nPlease enter the cost of the service:\n$`));
}

/**
 * @method
 * @desc Allows user to consolidate the transaction and master files
 */
function reconcileTransactions() {
    const COUPON_AMOUNT = 750;
    for (let i = 0; i < customerInfo.length; i++) {
        customerInfo[i][CASH_SPENT] = Number(customerInfo[i][CASH_SPENT]);
        let originalCash = customerInfo[i][CASH_SPENT];
        transactionInfo[i][WEEKLY_CASH] = Number(transactionInfo[i][WEEKLY_CASH]);
        customerInfo[i][CASH_SPENT] = customerInfo[i][CASH_SPENT] + transactionInfo[i][WEEKLY_CASH];
        if (customerInfo[i][CASH_SPENT] > COUPON_AMOUNT && originalCash <= COUPON_AMOUNT) {
            process.stdout.write('\x1Bc');
            console.log(`\nCongratulations ${customerInfo[i][FIRST_NAME]} ${customerInfo[i][LAST_NAME]}, you have earned a coupon for a free haircut!`)
        }
    }
}

/**
 * @method
 * @desd Overwrites the old version of the master file and replaces it with the updated version
 */
function writeCustomerInfo() {
    const COLUMNS = 4;
    for (let i = 0; i < customerInfo.length; i++) {
        if (customerInfo[i]) {
            for (let j = 0; j < COLUMNS; j++) {
                if (j < COLUMNS - 1) {
                    IO.appendFileSync(`data/dataX.csv`, `${customerInfo[i][j]},`);
                } else if (i < customerInfo.length - 1) {
                    IO.appendFileSync(`data/dataX.csv`, `${customerInfo[i][j]}\n`);
                } else {
                    IO.appendFileSync(`data/dataX.csv`, `${customerInfo[i][j]}`);
                }
            }
        }
    }
    IO.unlinkSync(`data/master.csv`);
    IO.renameSync(`data/dataX.csv`, `data/master.csv`);
}

/**
 * @method
 * @desc Overwrites the old version of the transaction file and replaces it with the new one
 */
function writeTransactionInfo() {
    const COLUMNS = 3;
    for (let i = 0; i < transactionInfo.length; i++) {
        if (transactionInfo[i]) {
            for (let j = 0; j < COLUMNS; j++) {
                if (j < COLUMNS - 1) {
                    IO.appendFileSync(`data/dataX.csv`, `${transactionInfo[i][j]},`);
                } else if (i < transactionInfo.length - 1) {
                    IO.appendFileSync(`data/dataX.csv`, `${transactionInfo[i][j]}\n`);
                } else {
                    IO.appendFileSync(`data/dataX.csv`, `${transactionInfo[i][j]}`);
                }
            }
        }
    }
    IO.unlinkSync(`data/transaction.csv`);
    IO.renameSync(`data/dataX.csv`, `data/transaction.csv`);
}