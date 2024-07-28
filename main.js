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
    const savedLimit = localStorage.getItem('budget-limit');
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
    budgetLimitSpan.textContent = currencySymbol + (parseFloat(localStorage.getItem('budget-limit')) || 0).toFixed(2);
    
    localStorage.setItem('total-expenses', totalExpense.toFixed(2));
    localStorage.setItem('budget-left', budgetLeft.toFixed(2));
}

function getAndDisplayLocalStorageValues() {
    const savedBudget = localStorage.getItem('budget');
    const savedCurrency = localStorage.getItem('budget-currency');
    const savedLimit = localStorage.getItem('budget-limit');
    const budgetAmount = parseFloat(savedBudget) || 0;
    const currencySymbol = savedCurrency === 'dollars' ? '$' : '₡';
    console.log(savedLimit);
    totalBudgetSpan.textContent = currencySymbol + budgetAmount.toFixed(2);
    budgetLeftSpan.textContent = currencySymbol + (parseFloat(localStorage.getItem('budget-left')) || 0).toFixed(2);
    totalExpenseSpan.textContent = currencySymbol + (parseFloat(localStorage.getItem('total-expenses')) || 0).toFixed(2);
    budgetLimitSpan.textContent = currencySymbol + (parseFloat(localStorage.getItem('budget-limit')) || 0).toFixed(2);
}
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('dark-mode') === 'enabled') {
        document.body.classList.add('dark-mode');
        document.getElementById('sun-icon').style.display = 'block';
        document.getElementById('moon-icon').style.display = 'none';
    } else {
        document.getElementById('sun-icon').style.display = 'none';
        document.getElementById('moon-icon').style.display = 'block';
    }
});

document.getElementById('toggle-dark-mode').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('dark-mode', 'enabled');
        document.getElementById('sun-icon').style.display = 'block';
        document.getElementById('moon-icon').style.display = 'none';
    } else {
        localStorage.setItem('dark-mode', 'disabled');
        document.getElementById('sun-icon').style.display = 'none';
        document.getElementById('moon-icon').style.display = 'block';
    }
});
// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    const toggleMenu = document.querySelector('.toggle-menu');
    const navbar = document.querySelector('.navbar');
    const totalBudgetSpan = document.getElementById('total-budget');
    const budgetLeftSpan = document.getElementById('budget-left');
    const totalExpenseSpan = document.getElementById('total-expenses');
    const budgetLimitSpan = document.getElementById('budget-limit');
    window.totalExpenseSpan = totalExpenseSpan;
    window.totalBudgetSpan = totalBudgetSpan;
    window.budgetLeftSpan = budgetLeftSpan;
    window.budgetLimitSpan = budgetLimitSpan;
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
