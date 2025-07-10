'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const displayMovements = function (movements) {
  containerMovements.innerHTML = ''; // Clear existing movements
  movements.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `
    <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          
          <div class="movements__value">${mov}€</div>
    </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};
displayMovements(account1.movements);

const calDisplayBalance = function (movement) {
  const balance = movement.reduce((acc, curr) => acc + curr, 0);
  labelBalance.textContent = `${balance} EUR`;
};
calDisplayBalance(account1.movements);

const calDisplaySummary = function (movements) {
  const incomes = movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes} EUR`;

  const out = movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out)} EUR`;

  const interest = movements
    .filter(mov => mov > 0)
    .map(deposits => (deposits * 1.2) / 100)
    .filter((int, i, arr) => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest} EUR`;
};
calDisplaySummary(account1.movements);

console.log('--- Map Method ---');
// const accounts = [account1, account2, account3, account4];
const createUserName = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUserName(accounts);
console.log(accounts);

const user = ' Steve Thomas Williams';
const userName = user
  .toLowerCase()
  .split(' ')
  .map(name => {
    return name[0];
  })
  .join('');
console.log(userName); // stw

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

const deposits = movements.filter(mov => mov > 0);
const withdrawals = movements.filter(mov => mov < 0);
console.log(deposits); // [200, 450, 3000, 70, 1300]
console.log(withdrawals); // [-400, -650, -130]

const balance = movements.reduce((acc, curr, i) => {
  return acc + curr;
}, 0);
console.log(balance); // 2700

// const calPrintBalance2 = function(movements){
const balance3 = movements.reduce((acc, mov) => {
  if (acc > mov) return acc;
  else return mov;
}, movements[0]);
// }
console.log(balance3);

/////////////////////////////////////////////////

const firstWithdrawal = movements.find(mov => mov < 0); // -400
console.log(firstWithdrawal);

const account =  accounts.find(acc => acc.owner === 'Jessica Davis');
console.log('using find methods',account); // {owner: 'Jessica Davis', movements: Array(8), interest

  console.log('-------using for of loop-------');
// now i want to find the same account using for of loop
for ( const acc of accounts) {
  // console.log(acc); 
  if (acc.owner === 'Jessica Davis') {
    console.log(acc); // {owner: 'Jessica Davis', movements: Array(8), interestRate: 1.5, pin: 2222}
  }
}