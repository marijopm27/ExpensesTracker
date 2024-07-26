document.addEventListener('DOMContentLoaded', function() {
    // Menú de navegación
    const toggleMenu = document.querySelector('.toggle-menu');
    const navbar = document.querySelector('.navbar');

    if (toggleMenu && navbar) {
        toggleMenu.addEventListener('click', function() {
            navbar.classList.toggle('active');
        });
    }

    // Elementos de presupuesto
    const budgetAmountInput = document.getElementById('budget-amount');
    const currencyInput = document.getElementById('currency');
    const budgetSubmitButton = document.getElementById('budget-submit-button');
    const totalBudgetSpan = document.getElementById('total-budget');
    const budgetLeftSpan = document.getElementById('budget-left');

    // Elementos de categorías
    const categoryNameInput = document.getElementById('category-name');
    const categorySubmitButton = document.getElementById('category-submit-button');
    const categoryList = document.getElementById('category-list');
    const categoryDropdown = document.getElementById('category-name'); // Dropdown en la página de gastos

    // Elementos de gastos
    const expenseAmountInput = document.getElementById('expense-amount');
    const expenseDateInput = document.getElementById('expense-date');
    const expenseCurrencyInput = document.getElementById('expense-currency');
    const expenseSubmitButton = document.getElementById('expense-submit-button');
    const tableExpense = document.getElementById('table-expense');

    let editingCategory = null;  // Variable para almacenar la categoría que se está editando
    let editingExpense = null;   // Variable para almacenar el gasto que se está editando

    // Manejo del presupuesto
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

    if (budgetSubmitButton) {
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
    }

    // Manejo de categorías
    function loadCategories() {
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        console.log('Categorías cargadas:', categories);

        if (categoryList) {
            categoryList.innerHTML = '';
            categories.forEach(category => {
                createCategoryList(category);
            });
        }

        populateCategoryDropdown(); // Llenar el dropdown con categorías
    }

    function createCategoryList(categoryName) {
        let listItem = document.createElement('li');
        listItem.classList.add('category-item', 'flex-space');

        listItem.innerHTML = `
            <p class="category-name">${categoryName}</p>
        `;

        // Botón de editar
        let editButton = document.createElement('button');
        editButton.classList.add('fa-solid', 'fa-pen-to-square', 'edit');
        editButton.style.fontSize = '1.2em';
        editButton.addEventListener('click', () => {
            editingCategory = categoryName;  // Establece la categoría en edición
            categoryNameInput.value = categoryName;  // Coloca el nombre de la categoría en el input
            categorySubmitButton.textContent = 'Edit';  // Cambia el texto del botón
            disableCategoryButtons(true);  // Desactiva los botones mientras se edita
        });

        // Botón de eliminar
        let deleteButton = document.createElement('button');
        deleteButton.classList.add('fa-solid', 'fa-trash-can', 'delete');
        deleteButton.style.fontSize = '1.2em';
        deleteButton.addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
                modifyCategory(categoryName);
            }
        });

        listItem.appendChild(editButton);
        listItem.appendChild(deleteButton);
        categoryList.appendChild(listItem);
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
            } else {
                categories.splice(index, 1);
            }
            localStorage.setItem('categories', JSON.stringify(categories));
            loadCategories();
        }
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

    if (categorySubmitButton) {
        categorySubmitButton.addEventListener('click', () => {
            const categoryName = categoryNameInput.value.trim();

            if (editingCategory) {
                // Si estamos editando una categoría existente
                if (validateCategory(categoryName)) {
                    modifyCategory(editingCategory, categoryName);
                    categoryNameInput.value = '';
                    categorySubmitButton.textContent = 'Set Category';  // Restaura el texto del botón
                    editingCategory = null;  // Limpiar la categoría en edición
                }
            } else {
                // Si estamos agregando una nueva categoría
                if (validateCategory(categoryName)) {
                    const categories = JSON.parse(localStorage.getItem('categories')) || [];
                    categories.push(categoryName);
                    localStorage.setItem('categories', JSON.stringify(categories));
                    createCategoryList(categoryName);
                    categoryNameInput.value = '';
                }
            }
        });
    }

    function populateCategoryDropdown() {
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        if (categoryDropdown) {
            categoryDropdown.innerHTML = ''; // Limpiar opciones existentes
            categories.forEach(category => {
                let option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryDropdown.appendChild(option);
            });
        }
    }

    // Manejo de gastos
    function loadExpenses() {
        const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        console.log('Gastos cargados:', expenses);

        if (tableExpense) {
            tableExpense.innerHTML = '';
            expenses.forEach(expense => {
                createExpenseRow(expense);
            });
        }
    }

    function createExpenseRow(expense) {
        let row = document.createElement('tr');
    
        row.innerHTML = `
            <td>${expense.amount} ${expense.currency}</td>
            <td>${expense.date}</td>
            <td>${expense.category}</td>
            <td>
                <button class="fa-solid fa-pen-to-square edit" style="font-size: 1.2em;"></button>
                <button class="fa-solid fa-trash-can delete" style="font-size: 1.2em;"></button>
            </td>
        `;
    
        // Botón de editar
        let editButton = row.querySelector('.edit');
        editButton.addEventListener('click', () => {
            editingExpense = expense; // Establece el gasto en edición
            expenseAmountInput.value = expense.amount;
            expenseDateInput.value = expense.date;
            expenseCurrencyInput.value = expense.currency;
            document.getElementById('category-name').value = expense.category; // Asume que el dropdown tiene la categoría seleccionada
            expenseSubmitButton.textContent = 'Edit Expense';
        });
    
        // Botón de eliminar
        let deleteButton = row.querySelector('.delete');
        deleteButton.addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete this expense?`)) {
                removeExpense(expense);
            }
        });
    
        document.getElementById('table-expense').appendChild(row);
    }
    

    function addExpense(expense) {
        const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        expenses.push(expense);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        createExpenseRow(expense);
    }

    function removeExpense(expenseToRemove) {
        let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        expenses = expenses.filter(expense => !(expense.amount === expenseToRemove.amount && expense.date === expenseToRemove.date && expense.currency === expenseToRemove.currency && expense.category === expenseToRemove.category));
        localStorage.setItem('expenses', JSON.stringify(expenses));
        loadExpenses();
    }

    if (expenseSubmitButton) {
        expenseSubmitButton.addEventListener('click', () => {
            const amount = expenseAmountInput.value.trim();
            const date = expenseDateInput.value.trim();
            const currency = expenseCurrencyInput.value.trim();
            const category = document.getElementById('category-name').value;

            if (!amount || !date || !currency || category === 'Default') {
                alert('Please fill all the fields correctly.');
                return;
            }

            const expense = { amount, date, currency, category };

            if (editingExpense) {
                // Editar un gasto existente
                const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
                const index = expenses.findIndex(exp => exp.amount === editingExpense.amount && exp.date === editingExpense.date && exp.currency === editingExpense.currency && exp.category === editingExpense.category);

                if (index > -1) {
                    expenses[index] = expense;
                    localStorage.setItem('expenses', JSON.stringify(expenses));
                    loadExpenses();
                    editingExpense = null; // Limpiar la edición
                    expenseSubmitButton.textContent = 'Add Expense'; // Restaurar el texto del botón
                    expenseAmountInput.value = '';
                    expenseDateInput.value = '';
                    expenseCurrencyInput.value = '';
                }
            } else {
                // Agregar un nuevo gasto
                addExpense(expense);
                expenseAmountInput.value = '';
                expenseDateInput.value = '';
                expenseCurrencyInput.value = '';
            }
        });
    }

    loadCategories();
    loadExpenses();
});
