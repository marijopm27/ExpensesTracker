// Define global functions
function updateTotalExpense(amount, currency) {
    const currentTotalExpense = parseFloat(totalExpenseSpan.textContent.replace(/[^\d.-]/g, '')) || 0;
    const newTotalExpense = currentTotalExpense + amount;
    totalExpenseSpan.textContent = (currency === 'dollars' ? '$' : '₡') + newTotalExpense.toFixed(2);
}

function updateBudgetLeft(amount, currency) {
    const currentBudgetLeft = parseFloat(budgetLeftSpan.textContent.replace(/[^\d.-]/g, '')) || 0;
    const newBudgetLeft = currentBudgetLeft + amount;
    budgetLeftSpan.textContent = (currency === 'dollars' ? '$' : '₡') + newBudgetLeft.toFixed(2);
}

function updateTotalExpensesAndBudgetLeft() {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    let totalExpense = 0;
    expenses.forEach(expense => {
        totalExpense += parseFloat(expense.amount);
    });
    const currency = expenses[0] ? expenses[0].currency : 'dollars'; // Assume all expenses have the same currency
    totalExpenseSpan.textContent = (currency === 'dollars' ? '$' : '₡') + totalExpense.toFixed(2);
    const budgetAmount = parseFloat(totalBudgetSpan.textContent.replace(/[^\d.-]/g, '')) || 0;
    const budgetLeft = budgetAmount - totalExpense;
    budgetLeftSpan.textContent = (currency === 'dollars' ? '$' : '₡') + budgetLeft.toFixed(2);
    totalBudgetSpan.textContent = (currency === 'dollars' ? '$' : '₡') + budgetAmount.toFixed(2);
    localStorage.setItem('total-expenses', totalExpense.toFixed(2));
    localStorage.setItem('budget-left', budgetAmount.toFixed(2));
}

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    const toggleMenu = document.querySelector('.toggle-menu');
    const navbar = document.querySelector('.navbar');
    const budgetAmountInput = document.getElementById('budget-amount');
    const currencyInput = document.getElementById('budget-currency');
    const budgetSubmitButton = document.getElementById('budget-submit-button');
    const totalBudgetSpan = document.getElementById('total-budget');
    const budgetLeftSpan = document.getElementById('budget-left');
    const totalExpenseSpan = document.getElementById('total-expenses');
    const tableExpenseSumary = document.getElementById('table-expense-sumary');
    window.totalExpenseSpan = totalExpenseSpan;
    window.totalBudgetSpan = totalBudgetSpan;
    window.budgetLeftSpan = budgetLeftSpan;
    window.updateTotalExpensesAndBudgetLeft = updateTotalExpensesAndBudgetLeft;
    window.updateBudgetLeft = updateBudgetLeft;

    if (toggleMenu && navbar) {
        toggleMenu.addEventListener('click', function() {
            navbar.classList.toggle('active');
        });
    }
    
    
    // Cargar categorías y gastos
    loadCategories();
    loadExpenses();
    
});
