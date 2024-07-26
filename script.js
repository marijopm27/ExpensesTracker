document.addEventListener('DOMContentLoaded', function() {
    const toggleMenu = document.querySelector('.toggle-menu');
    const navbar = document.querySelector('.navbar');

    toggleMenu.addEventListener('click', function() {
        navbar.classList.toggle('active');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const budgetAmountInput = document.getElementById('budget-amount');
    const currencyInput = document.getElementById('currency');
    const budgetSubmitButton = document.getElementById('budget-submit-button');
    const totalBudgetSpan = document.getElementById('total-budget');
    const budgetLeftSpan = document.getElementById('budget-left');
    
   
    const savedBudget = localStorage.getItem('budget');
    if (savedBudget) {
        totalBudgetSpan.textContent = savedBudget;
        budgetLeftSpan.textContent = savedBudget;
    } else {
        totalBudgetSpan.textContent = '---';
        budgetLeftSpan.textContent = '---';
    }


    function updateBudget(amount) {
        totalBudgetSpan.textContent = amount;
        budgetLeftSpan.textContent = amount;
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


    budgetSubmitButton.addEventListener('click', () => {
        const budgetAmount = budgetAmountInput.value;
        const currency = currencyInput.value;

        if (validateInput(budgetAmount, currency)) {
           
            localStorage.setItem('budget', budgetAmount);
            
            updateBudget(budgetAmount);
            budgetSubmitButton.textContent = 'Update Budget';
            budgetAmountInput.value = '';
            currencyInput.value = '';
        }
    });
});


