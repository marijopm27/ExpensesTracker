// Category Elements
const categoryNameInput = document.getElementById('category-name');
const categorySubmitButton = document.getElementById('category-submit-button');
const categoryDropdown = document.getElementById('category-name');

let editingCategory = null;

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
if (filterCategory) {
    filterCategory.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(category => {
        let option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filterCategory.appendChild(option);
    });
}
}
