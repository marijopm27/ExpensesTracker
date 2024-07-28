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

const exchangeRateCache = {};

async function fetchExchangeRate(date) {
    if (exchangeRateCache[date]) {
        return exchangeRateCache[date];
    }

    try {
        const response = await fetch(`https://tipodecambio.paginasweb.cr/api/${date}`);
        if (!response.ok) {
            throw new Error('Error fetching exchange rate');
        }
        const data = await response.json();
        const exchangeRate = data.compra;
        exchangeRateCache[date] = exchangeRate;
        return exchangeRate;
    } catch (error) {
        console.error(`Failed to fetch exchange rate for ${date}:`, error);
        // Puedes usar una tasa de cambio predeterminada en caso de error
        const defaultExchangeRate = 570; // Ejemplo de tasa de cambio predeterminada
        return defaultExchangeRate;
    }
}

async function updateTotalExpensesAndBudgetLeft() {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const savedCurrency = localStorage.getItem('budget-currency') || 'dollars';
    let totalExpense = 0;

    for (const expense of expenses) {
        const exchangeRate = await fetchExchangeRate(expense.date);
        const amountInBudgetCurrency = expense.currency === savedCurrency 
            ? parseFloat(expense.amount)
            : expense.currency === 'dollars'
                ? parseFloat(expense.amount) * (savedCurrency === 'dollars' ? 1 : exchangeRate)
                : parseFloat(expense.amount) / (savedCurrency === 'colones' ? 1 : exchangeRate);
        totalExpense += amountInBudgetCurrency;
    }

    const currencySymbol = savedCurrency === 'dollars' ? '$' : '₡';
    totalExpenseSpan.textContent = currencySymbol + totalExpense.toFixed(2);
    
    const budgetAmount = parseFloat(totalBudgetSpan.textContent.replace(/[^\d.-]/g, '')) || 0;
    const budgetLeft = budgetAmount - totalExpense;
    budgetLeftSpan.textContent = currencySymbol + budgetLeft.toFixed(2);
    totalBudgetSpan.textContent = currencySymbol + budgetAmount.toFixed(2);
    
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
