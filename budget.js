const savedBudget = localStorage.getItem('budget');
const savedCurrency = localStorage.getItem('budget-currency');
const savedLimit = localStorage.getItem('budget-limit');

const budgetAmountInput = document.getElementById('budget-amount');
const currencyInput = document.getElementById('budget-currency');
const budgetLimitInput = document.getElementById('budget-limit-input');
const budgetSubmitButton = document.getElementById('budget-submit-button');

const totalBudgetSpan = document.getElementById('total-budget');
const budgetLeftSpan = document.getElementById('budget-left');
const budgetLimitSpan = document.getElementById('budget-limit');
const totalExpenseSpan = document.getElementById('total-expenses');

const tableExpenseSumary = document.getElementById('table-expense-sumary');

const filterCategory = document.getElementById('filter-category');
const filterDate = document.getElementById('filter-date');
const applyFiltersButton = document.getElementById('apply-filters');


if (savedBudget) {
    totalBudgetSpan.textContent = savedBudget;
    budgetLeftSpan.textContent = savedBudget;
} else {
    totalBudgetSpan.textContent = '---';
    budgetLeftSpan.textContent = '---';
}

function updateBudget(amount, currency, limit) {
    totalBudgetSpan.textContent = (currency === 'dollars' ? '$' : '₡') + amount;
    budgetLeftSpan.textContent = (currency === 'dollars' ? '$' : '₡') + amount;
    budgetLimitSpan.textContent = (currency === 'dollars' ? '$' : '₡')  + limit;
    localStorage.setItem('budget', amount);
    localStorage.setItem('budget-currency', currency);
    localStorage.setItem('budget-limit', limit);
}

let pieChart = null; 

async function calculateCategoryTotals(expenses, savedCurrency) {
    const categoryTotals = {};
    const exchangeRates = {};

    // Iterar sobre los gastos para calcular los totales por categoría
    for (const expense of expenses) {
        const { category, amount, currency, date } = expense;
        const amountInBudgetCurrency = await convertAmountToBudgetCurrency(amount, currency, savedCurrency, date, exchangeRates);

        if (!categoryTotals[category]) {
            categoryTotals[category] = 0;
        }
        categoryTotals[category] += amountInBudgetCurrency;
    }

    return categoryTotals;
}

async function convertAmountToBudgetCurrency(amount, currency, savedCurrency, date, exchangeRates) {
    if (!exchangeRates[date]) {
        exchangeRates[date] = await fetchExchangeRate(date);
    }

    let amountInBudgetCurrency;

    if (currency === savedCurrency) {
        amountInBudgetCurrency = parseFloat(amount);
    } else if (currency === 'dollars' && savedCurrency === 'colones') {
        amountInBudgetCurrency = parseFloat(amount) * exchangeRates[date];
    } else if (currency === 'colones' && savedCurrency === 'dollars') {
        amountInBudgetCurrency = parseFloat(amount) / exchangeRates[date];
    } else {
        // Handle cases where currencies might not match
        console.warn('Unhandled currency conversion:', currency, savedCurrency);
        amountInBudgetCurrency = parseFloat(amount); // Fallback to amount without conversion
    }

    return amountInBudgetCurrency;
}
function updatePieChart(filteredExpenses) {
    const expensesData = filteredExpenses.map(expense => ({
        label: `${expense.category} (${expense.date})`,
        amount: parseFloat(expense.amount)
    }));

    const labels = expensesData.map(expense => expense.label);
    const data = expensesData.map(expense => expense.amount);

    console.log('Labels:', labels);
    console.log('Data:', data);

    const ctx = document.getElementById('myPieChart').getContext('2d');

    // Destruir el gráfico existente si ya está definido
    if (pieChart) {
        pieChart.destroy();
    }

    // Verificar que los datos no estén vacíos
    if (data.length === 0) {
        console.warn('No expenses to display in the pie chart.');
        return;
    }

    // Crear un nuevo gráfico
    pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
            }]
        },
        options: {
            responsive: true,
        }
    });
}

function validateInput(amount, currency, limit) {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        alert('Please enter a valid budget amount.');
        return false;
    }
    if (!currency.trim()) {
        alert('Currency cannot be empty.');
        return false;
    }
    if (!limit || isNaN(limit) || parseFloat(limit) <= 0) {
        alert('Please enter a valid budget limit.');
        return false;
    }
    if (parseFloat(limit) > parseFloat(amount)) {
        alert('The budget limit cannot be greater than the budget amount.');
        return false;
    }
    return true;
}

if (budgetSubmitButton) {
    budgetSubmitButton.addEventListener('click', () => {
        const budgetAmount = budgetAmountInput.value;
        const currency = currencyInput.value;
        const budgetLimit = budgetLimitInput.value;

        if (validateInput(budgetAmount, currency, budgetLimit)) {
            updateBudget(budgetAmount, currency, budgetLimit);
            updateTotalExpensesAndBudgetLeft();
            budgetSubmitButton.textContent = 'Update Budget';
            budgetAmountInput.value = '';
            currencyInput.value = '';
            budgetLimitInput.value = '';
        }
    });
}

applyFiltersButton.addEventListener('click', () => {
    const selectedCategory = filterCategory.value;
    const selectedDate = filterDate.value;
    filterExpenses(selectedCategory, selectedDate);
});

async function filterExpenses(category, date) {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    let filteredExpenses = expenses;

    if (category) {
        filteredExpenses = filteredExpenses.filter(expense => expense.category === category);
    }

    if (date) {
        filteredExpenses = filteredExpenses.filter(expense => expense.date === date);
    }

    if (tableExpenseSumary) {
        tableExpenseSumary.innerHTML = '';
    }

    const savedCurrency = localStorage.getItem('budget-currency') || 'dollars';
    const categoryTotals = await calculateCategoryTotals(filteredExpenses, savedCurrency);

    filteredExpenses.forEach(expense => {
        if (tableExpenseSumary) {
            createExpenseRowSumary(expense);
        }
    });

    if (tableExpenseSumary) {
        addTotalRow(categoryTotals);
    }

    updatePieChart(filteredExpenses);
}

function addTotalRow(categoryTotals) {
    let totalRow = document.createElement('tr');
    totalRow.innerHTML = `
        <td colspan="4">Total</td>
        <td>${Object.values(categoryTotals).reduce((a, b) => a + b, 0).toFixed(2)}</td>
    `;
    tableExpenseSumary.appendChild(totalRow);
}

