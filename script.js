document.addEventListener('DOMContentLoaded', () => {
    const toggleMenu = document.querySelector('.toggle-menu');
    const navbar = document.querySelector('.navbar');

    // Presupuesto Elementos
    const budgetAmountInput = document.getElementById('budget-amount');
    const currencyInput = document.getElementById('currency');
    const budgetSubmitButton = document.getElementById('budget-submit-button');
    const totalBudgetSpan = document.getElementById('total-budget');
    const budgetLeftSpan = document.getElementById('budget-left');

    // Categorías Elementos
    const categoryNameInput = document.getElementById('category-name');
    const categorySubmitButton = document.getElementById('category-submit-button');
    const categoryList = document.getElementById('category-list');

    let editingCategory = null;  // Variable para almacenar la categoría que se está editando

    if (toggleMenu && navbar) {
        toggleMenu.addEventListener('click', () => {
            navbar.classList.toggle('active');
        });
    }

    if (budgetSubmitButton) {
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
            } else {
                budgetAmountInput.value = '';
                currencyInput.value = '';
            }
        });
    }

    // Funcionalidad de Categoría
    function loadCategories() {
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        categoryList.innerHTML = '';
        categories.forEach(category => {
            createCategoryList(category);
        });
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

    loadCategories();
});
