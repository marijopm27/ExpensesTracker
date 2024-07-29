const expenseNameInput = document.getElementById('expense-name');
const expenseAmountInput = document.getElementById('expense-amount');
const expenseDateInput = document.getElementById('expense-date');
const expenseCurrencyInput = document.getElementById('expense-currency');
const expenseSubmitButton = document.getElementById('expense-submit-button');
const tableExpense = document.getElementById('table-expense');

let editingExpense = null;

function loadExpenses() {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    console.log('Gastos cargados:', expenses);

    if (tableExpense) {
        tableExpense.innerHTML = '';
        expenses.forEach(expense => {
            createExpenseRow(expense);
        });
    }
    if (tableExpenseSumary) {
        tableExpenseSumary.innerHTML = '';
        expenses.forEach(expense => {
            createExpenseRowSumary(expense);
        });
    }
    updatePieChart(expenses);
    updateTotalExpensesAndBudgetLeft();
    getAndDisplayLocalStorageValues();
    
}

function createExpenseRow(expense) {
    console.log('Creando fila para el gasto:', expense);
    let row = document.createElement('tr');

    let currencySymbol = expense.currency === 'dollars' ? '$' : '₡';

    row.innerHTML = `
        <td>${expense.name}</td>
        <td>${currencySymbol} ${expense.amount}</td>
        <td>${currencySymbol}</td>
        <td>${expense.category}</td>
        <td>${expense.date}</td>
        <td>
            <button class="fa-solid fa-pen-to-square edit" style="font-size: 1.2em;"></button>
            <button class="fa-solid fa-trash-can delete" style="font-size: 1.2em;"></button>
        </td>
    `;

    let editButton = row.querySelector('.edit');
    editButton.addEventListener('click', () => {
        console.log('Editando gasto:', expense);
        editingExpense = expense;
        expenseNameInput.value = expense.name;
        expenseAmountInput.value = expense.amount;
        expenseDateInput.value = expense.date;
        expenseCurrencyInput.value = expense.currency;
        categoryDropdown.value = expense.category;
        expenseSubmitButton.textContent = 'Edit Expense';
    });

    let deleteButton = row.querySelector('.delete');
    deleteButton.addEventListener('click', () => {
        if (confirm(`Are you sure you want to delete this expense?`)) {
            console.log('Eliminando gasto:', expense);
            removeExpense(expense);
        }
    });

    tableExpense.appendChild(row);
}

function createExpenseRowSumary(expense) {
    console.log('Creando fila para el resumen del gasto:', expense);
    let row = document.createElement('tr');

    let currencySymbol = expense.currency === 'dollars' ? '$' : '₡';

    row.innerHTML = `
        <td>${expense.name}</td>
        <td>${expense.category}</td>
        <td>${currencySymbol}</td>
        <td>${expense.date}</td>
        <td>${currencySymbol} ${expense.amount}</td>
    `;
    tableExpenseSumary.appendChild(row);
}

function validateExpenseInput(name, amount, currency, date, category) {
    console.log('Validando entrada de gasto:', { name, amount, currency, date, category });
    if (!name.trim()) {
        alert('Please enter a valid expense name.');
        return false;
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        alert('Please enter a valid expense amount.');
        return false;
    }
    if (currency !== 'dollars' && currency !== 'colones') {
        alert('Currency must be either "dollars" or "colones".');
        return false;
    }
    if (!date) {
        alert('Please select a date.');
        return false;
    }
    if (!category) {
        alert('Please create a category first');
        return false;
    }
    return true;
}

async function validateExpenseLimit(amount, currency, date) {
    console.log('Validando límite de gasto:', { amount, currency, date });
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const savedCurrency = localStorage.getItem('budget-currency') || 'dollars';
    const limit = parseFloat(localStorage.getItem('budget-limit')) || 0;
    let totalExpense = 0;

    for (const expense of expenses) {
        const exchangeRate = await fetchExchangeRate(expense.date);
        const amountInBudgetCurrency = convertAmount(parseFloat(expense.amount), expense.currency, savedCurrency, exchangeRate);
        totalExpense += amountInBudgetCurrency;
    }

    const newExpenseExchangeRate = await fetchExchangeRate(date);
    const newExpenseInBudgetCurrency = convertAmount(amount, currency, savedCurrency, newExpenseExchangeRate);

    if ((totalExpense + newExpenseInBudgetCurrency) > limit) {
        alert('Warning: Expense exceeds budget limit.');
        return false;
    }

    return true;
}

function convertAmount(amount, fromCurrency, toCurrency, exchangeRate) {
    if (fromCurrency === toCurrency) {
        return amount;
    }
    if (fromCurrency === 'dollars' && toCurrency === 'colones') {
        return amount * exchangeRate;
    }
    if (fromCurrency === 'colones' && toCurrency === 'dollars') {
        return amount / exchangeRate;
    }
    return amount;
}

async function addExpense(expense) {
    console.log('Añadiendo gasto:', expense);
    const isValid = await validateExpenseLimit(parseFloat(expense.amount), expense.currency, expense.date);
    if (!isValid) {
        return;
    }

    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    expenses.push(expense);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    expenseNameInput.value = '';
    expenseAmountInput.value = '';
    expenseDateInput.value = '';
    expenseCurrencyInput.value = '';
    expenseSubmitButton.textContent = 'Add Expense';
            editingExpense = null;

    updateTotalExpensesAndBudgetLeft();
    loadExpenses(); // Cargar gastos después de añadir
    updateTotalExpense(parseFloat(expense.amount), expense.currency);
    updateBudgetLeft(-parseFloat(expense.amount), expense.currency);
    updateTotalExpensesAndBudgetLeft();
}

function removeExpense(expenseToRemove) {
    console.log('Eliminando gasto:', expenseToRemove);
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    expenses = expenses.filter(expense =>
        !(expense.name === expenseToRemove.name &&
          expense.amount === expenseToRemove.amount &&
          expense.date === expenseToRemove.date &&
          expense.currency === expenseToRemove.currency &&
          expense.category === expenseToRemove.category)
    );
    localStorage.setItem('expenses', JSON.stringify(expenses));
    updateTotalExpensesAndBudgetLeft();
    loadExpenses(); 
    
}

if (expenseSubmitButton) {
    expenseSubmitButton.addEventListener('click', async () => {
        console.log('Botón de enviar clickeado.');
        const name = expenseNameInput.value.trim();
        const amount = parseFloat(expenseAmountInput.value);
        const date = expenseDateInput.value;
        const currency = expenseCurrencyInput.value.toLowerCase();
        const category = categoryDropdown.value;

        if (!validateExpenseInput(name, amount, currency, date, category)) {
            return;
        }

        if (editingExpense) {
            console.log('Editando gasto existente:', editingExpense);
            const updatedExpense = {
                name,
                amount,
                currency,
                date,
                category
            };

            addExpense(updatedExpense);

          
            removeExpense(editingExpense);


            
            expenseSubmitButton.textContent = 'Add Expense';
            editingExpense = null;
        } else {
            console.log('Añadiendo nuevo gasto:', { name, amount, currency, date, category });
            const newExpense = {
                name,
                amount,
                currency,
                date,
                category
            };
            await addExpense(newExpense);
        }

        // Limpiar campos de entrada
        expenseNameInput.value = '';
        expenseAmountInput.value = '';
        expenseDateInput.value = '';
        expenseCurrencyInput.value = '';
    });
}