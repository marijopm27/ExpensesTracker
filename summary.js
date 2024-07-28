const savedBudget = localStorage.getItem('budget');
const savedCurrency = localStorage.getItem('budget-currency');
const savedLimit = localStorage.getItem('budget-limit');
const budgetAmountInput = document.getElementById('budget-amount');
const currencyInput = document.getElementById('budget-currency');
const budgetLimitInput = document.getElementById('budget-limit');
const budgetSubmitButton = document.getElementById('budget-submit-button');
const totalBudgetSpan = document.getElementById('total-budget');
const budgetLeftSpan = document.getElementById('budget-left');
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
    localStorage.setItem('budget', amount);
    localStorage.setItem('budget-currency', currency);
    localStorage.setItem('budget-limit', limit);
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
