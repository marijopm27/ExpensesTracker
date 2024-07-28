const savedBudget = localStorage.getItem('budget');
const SavedCurrency = localStorage.getItem('budget-currency');
const budgetAmountInput = document.getElementById('budget-amount');
const currencyInput = document.getElementById('budget-currency');
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

function updateBudget(amount,currency) {
    totalBudgetSpan.textContent = (currency === 'dollars' ? '$' : '₡')+ amount;
    budgetLeftSpan.textContent = (currency === 'dollars' ? '$' : '₡')+ amount;
    localStorage.setItem('budget',amount);
    localStorage.setItem('budget-currency',currency);
}

function validateInput(amount, currency) {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        alert('Please enter a valid budget amount.');
        return false;
    }
    if (!currency.trim()) {
        alert('Currency cannot be empty.');
        return false;
    }
    return true;
}


if (budgetSubmitButton) {
    budgetSubmitButton.addEventListener('click', () => {
        const budgetAmount = budgetAmountInput.value;
        const currency = currencyInput.value;

        if (validateInput(budgetAmount, currency)) {
            localStorage.setItem('budget', budgetAmount);
            localStorage.setItem('budget-currency', currency);
            updateBudget(budgetAmount,currency);
            updateTotalExpensesAndBudgetLeft();
            budgetSubmitButton.textContent = 'Update Budget';
            budgetAmountInput.value = '';
            currencyInput.value = '';
        }
    });
}