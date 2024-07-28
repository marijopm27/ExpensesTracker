const savedBudget = localStorage.getItem('budget');
const savedCurrency = localStorage.getItem('budget-currency');
const savedLimit = localStorage.getItem('budget-limit');
const budgetAmountInput = document.getElementById('budget-amount');
const currencyInput = document.getElementById('budget-currency');
const budgetLimitInput = document.getElementById('budget-limit');
const budgetSubmitButton = document.getElementById('budget-submit-button');
const totalBudgetSpan = document.getElementById('total-budget');
const budgetLeftSpan = document.getElementById('budget-left');
const budgetLimitSpan = document.getElementById('budget-limit');
const totalExpenseSpan = document.getElementById('total-expenses');
const tableExpenseSumary = document.getElementById('table-expense-sumary');


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

let pieChart = null; // Variable para almacenar el gráfico actual

function updatePieChart(expenses) {
    const categories = {};
    expenses.forEach(expense => {
        if (!categories[expense.category]) {
            categories[expense.category] = 0;
        }
        categories[expense.category] += parseFloat(expense.amount);
    });

    const ctx = document.getElementById('myPieChart').getContext('2d');

    // Destruir el gráfico existente si ya está definido
    if (pieChart) {
        pieChart.destroy();
    }

    // Crear un nuevo gráfico
    pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
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

const filterCategory = document.getElementById('filter-category');
const filterDate = document.getElementById('filter-date');
const applyFiltersButton = document.getElementById('apply-filters');

applyFiltersButton.addEventListener('click', () => {
    const selectedCategory = filterCategory.value;
    const selectedDate = filterDate.value;
    filterExpenses(selectedCategory, selectedDate);
});

function filterExpenses(category, date) {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    let filteredExpenses = expenses;

    if (category) {
        filteredExpenses = filteredExpenses.filter(expense => expense.category === category);
    }

    if (date) {
        filteredExpenses = filteredExpenses.filter(expense => expense.date === date);
    }

    if (tableExpense) {
        tableExpense.innerHTML = '';
    }

    if (tableExpenseSumary) {
        tableExpenseSumary.innerHTML = '';
    }

    filteredExpenses.forEach(expense => {
        if (tableExpense) {
            createExpenseRow(expense);
        }
        if (tableExpenseSumary) {
            createExpenseRowSumary(expense);
        }

    
    });
    console.log(filteredExpenses);
    updatePieChart(filteredExpenses);
}
