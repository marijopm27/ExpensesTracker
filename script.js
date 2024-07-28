document.addEventListener('DOMContentLoaded', function() {
    const toggleMenu = document.querySelector('.toggle-menu');
    const navbar = document.querySelector('.navbar');

    if (toggleMenu && navbar) {
        toggleMenu.addEventListener('click', function() {
            navbar.classList.toggle('active');
        });
    }

    //Budget Elements
    const budgetAmountInput = document.getElementById('budget-amount');
    const currencyInput = document.getElementById('budget-currency');
    const budgetSubmitButton = document.getElementById('budget-submit-button');
    const totalBudgetSpan = document.getElementById('total-budget');
    const budgetLeftSpan = document.getElementById('budget-left');
    const totalExpenseSpan = document.getElementById('total-expenses');

    //Category Elements
    const categoryNameInput = document.getElementById('category-name');
    const categorySubmitButton = document.getElementById('category-submit-button');
    const categoryDropdown = document.getElementById('category-name');

    //Expense Elements
    const expenseNameInput = document.getElementById('expense-name');
    const expenseAmountInput = document.getElementById('expense-amount');
    const expenseDateInput = document.getElementById('expense-date');
    const expenseCurrencyInput = document.getElementById('expense-currency');
    const expenseSubmitButton = document.getElementById('expense-submit-button');
    const tableExpense = document.getElementById('table-expense');
    const tableExpenseSumary = document.getElementById('table-expense-sumary');
    

    let editingExpense = null;
    let editingCategory = null;
    // Budget Section
    const savedBudget = localStorage.getItem('budget');
    const SavedCurrency = localStorage.getItem('budget-currency');
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


    //Category Section
    function removeExpensesByCategory(categoryName) {
        let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        let totalAmountToSubtract = 0;
    
        // Filtrar los gastos de la categoría eliminada y sumar sus montos
        expenses = expenses.filter(expense => {
            if (expense.category === categoryName) {
                totalAmountToSubtract += parseFloat(expense.amount);
                return false; // Excluir de la lista de gastos
            }
            return true; // Incluir otros gastos
        });
    
        // Guardar los gastos restantes
        localStorage.setItem('expenses', JSON.stringify(expenses));
    
        // Actualizar la interfaz con los gastos eliminados
        updateTotalExpensesAndBudgetLeft();
    
        // Ajustar el presupuesto restante
        updateBudgetLeft(totalAmountToSubtract, 'dollars'); // Asume 'dollars'; cambiar si necesario
    }
    
    function createCategoryRow(categoryName) {
        let row = document.createElement('tr');
        
        row.innerHTML = `
            <td class="category-name">${categoryName}</td>
            <td>
                <button class="fa-solid fa-pen-to-square edit" style="font-size: 1.2em;"></button>
                <button class="fa-solid fa-trash-can delete" style="font-size: 1.2em;"></button>
            </td>
        `;
        
        let editButton = row.querySelector('.edit');
        editButton.addEventListener('click', () => {
            editingCategory = categoryName;
            categoryNameInput.value = categoryName;
            categorySubmitButton.textContent = 'Edit';
            disableCategoryButtons(true);
        });
    
        let deleteButton = row.querySelector('.delete');
        deleteButton.addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
                if (canDeleteCategory(categoryName)) {
                    modifyCategory(categoryName);
                } else {
                    showError('Cannot delete category with associated expenses.');
                }
            }
        });
    
        document.getElementById('category-list').appendChild(row);
    }
    
    function loadCategories() {
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        console.log('Categorías cargadas:', categories);
    
        const categoryList = document.getElementById('category-list');
        if (categoryList) {
            categoryList.innerHTML = '';
            categories.forEach(category => {
                createCategoryRow(category);
            });
        }
    
        populateCategoryDropdown();
    }
    
    function disableCategoryButtons(bool) {
        let editButtons = document.getElementsByClassName('edit');
        Array.from(editButtons).forEach((element) => {
            element.disabled = bool;
        });
    }
    
    function modifyCategory(oldName, newName = null) {
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        const index = categories.indexOf(oldName);
    
        if (index > -1) {
            if (newName) {
                categories[index] = newName;
                updateExpensesCategory(oldName, newName);
            } else {
                // Eliminar la categoría
                categories.splice(index, 1);
                removeExpensesByCategory(oldName);
            }
            localStorage.setItem('categories', JSON.stringify(categories));
            loadCategories();
        }
    }
    
    function updateExpensesCategory(oldName, newName) {
        let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        expenses = expenses.map(expense => {
            if (expense.category === oldName) {
                expense.category = newName;
            }
            return expense;
        });
        localStorage.setItem('expenses', JSON.stringify(expenses));
        updateTotalExpensesAndBudgetLeft();
    }
    
    function validateCategory(name) {
        if (!name.trim()) {
            showError('Category cannot be empty.');
            return false;
        }
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        if (categories.includes(name.trim()) && name.trim() !== editingCategory) {
            showError('Category already exists.');
            return false;
        }
        return true;
    }
    
    function showError(message) {
        alert(message);
    }
    
    function canDeleteCategory(categoryName) {
        let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        return !expenses.some(expense => expense.category === categoryName);
    }
    
    if (categorySubmitButton) {
        categorySubmitButton.addEventListener('click', () => {
            const categoryName = categoryNameInput.value.trim();
    
            if (editingCategory) {
                if (validateCategory(categoryName)) {
                    modifyCategory(editingCategory, categoryName);
                    categoryNameInput.value = '';
                    categorySubmitButton.textContent = 'Set Category';
                    editingCategory = null;
                }
            } else {
                if (validateCategory(categoryName)) {
                    const categories = JSON.parse(localStorage.getItem('categories')) || [];
                    categories.push(categoryName);
                    localStorage.setItem('categories', JSON.stringify(categories));
                    createCategoryRow(categoryName);
                    categoryNameInput.value = '';
                }
            }
        });
    }
    


    // Expense Section
function populateCategoryDropdown() {
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    if (categoryDropdown) {
        categoryDropdown.innerHTML = '';
        categories.forEach(category => {
            let option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryDropdown.appendChild(option);
        });
    }
}

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

    updateTotalExpensesAndBudgetLeft();
}

function createExpenseRow(expense) {
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
            removeExpense(expense);
        }
    });

    tableExpense.appendChild(row);
}

function createExpenseRowSumary(expense) {
    let row = document.createElement('tr');

    let currencySymbol = expense.currency === 'dollars' ? '$' : '₡';

    row.innerHTML = `
        <td>${expense.name}</td>
        <td>${currencySymbol} ${expense.amount}</td>
        <td>${currencySymbol}</td>
        <td>${expense.category}</td>
        <td>${expense.date}</td>
    `;
    tableExpenseSumary.appendChild(row);
}

function validateExpenseInput(amount, currency, date, category) {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        showError('Please enter a valid expense amount.');
        return false;
    }
    if (currency !== 'dollars' && currency !== 'colones') {
        showError('Currency must be either "dollars" or "colones".');
        return false;
    }
    if (!date) {
        showError('Please select a date.');
        return false;
    }
    if (!category) {
        showError('Please create a category first');
        return false;
    }
    return true;
}

function addExpense(expense) {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    expenses.push(expense);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    createExpenseRow(expense);
    updateTotalExpense(parseFloat(expense.amount), expense.currency);
    updateBudgetLeft(-parseFloat(expense.amount), expense.currency);
}

function removeExpense(expenseToRemove) {
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    expenses = expenses.filter(expense => !(expense.amount === expenseToRemove.amount && expense.date === expenseToRemove.date && expense.currency === expenseToRemove.currency && expense.category === expenseToRemove.category));
    localStorage.setItem('expenses', JSON.stringify(expenses));
    updateTotalExpensesAndBudgetLeft();
    loadExpenses(); // Re-load to ensure the UI is up-to-date
}

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
    const currency = expenses[0] ? expenses[0].currency : 'dollars'; // Asume que todos los gastos tienen la misma moneda
    totalExpenseSpan.textContent = (currency === 'dollars' ? '$' : '₡') + totalExpense.toFixed(2);
    const budgetAmount = parseFloat(totalBudgetSpan.textContent.replace(/[^\d.-]/g, '')) || 0;
    const budgetLeft = budgetAmount - totalExpense;
    budgetLeftSpan.textContent = (currency === 'dollars' ? '$' : '₡') + budgetLeft.toFixed(2);
    totalBudgetSpan.textContent = (currency === 'dollars' ? '$' : '₡') + budgetAmount.toFixed(2);
    localStorage.setItem('total-expenses', totalExpense.toFixed(2));
    localStorage.setItem('budget-left', budgetAmount.toFixed(2));
}

if (expenseSubmitButton) {
    expenseSubmitButton.addEventListener('click', () => {
        const name = expenseNameInput.value.trim();
        const amount = expenseAmountInput.value;
        const date = expenseDateInput.value;
        const currency = expenseCurrencyInput.value.toLowerCase();
        const category = categoryDropdown.value;

        if (!validateExpenseInput(amount, currency, date, category)) {
            return;
        }

        if (editingExpense) {
            const updatedExpense = {
                name,
                amount,
                currency,
                date,
                category
            };
            removeExpense(editingExpense);
            addExpense(updatedExpense);
            expenseSubmitButton.textContent = 'Add Expense';
            editingExpense = null;
        } else {
            const newExpense = {
                name,
                amount,
                currency,
                date,
                category
            };
            addExpense(newExpense);
        }

        expenseNameInput.value = '';
        expenseAmountInput.value = '';
        expenseDateInput.value = '';
        expenseCurrencyInput.value = '';
    });
}


    loadCategories();
    loadExpenses();
});
