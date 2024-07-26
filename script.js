document.addEventListener('DOMContentLoaded', function() {
    const toggleMenu = document.querySelector('.toggle-menu');
    const navbar = document.querySelector('.navbar');

    toggleMenu.addEventListener('click', function() {
        navbar.classList.toggle('active');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Budget Elemnts
    const budgetAmountInput = document.getElementById('budget-amount');
    const currencyInput = document.getElementById('currency');
    const budgetSubmitButton = document.getElementById('budget-submit-button');
    const totalBudgetSpan = document.getElementById('total-budget');
    const budgetLeftSpan = document.getElementById('budget-left');
    
    //Category Emlements
    const categoryNameInput = document.getElementById('category-name');
    const categorySubmitButton = document.getElementById('category-submit-button');
    const categoryList = document.getElementById('category-list')
    
    //Expense Elements


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
        else{
            budgetAmountInput.value = '';
            currencyInput.value = '';
        }
    });

    // Category Funcionality Section
    function loadCategories() {
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        categoryList.innerHTML = '';
        categories.forEach( category => {
            createCategoryList(category);
        })

    }

    function createCategoryList (){
        let listItem = document.createElement('li');
        listItem.classList.add('category-item','flex-space');
        listItem.innerHTML = `
        <p class="category-name>${categoryNameInput}</p>
        `;


        let editCategoryButon = document.createElement('button');
        editButon.classList.add('fa-solid', 'fa-pen-to-sqare', 'edit');
        editButon.style.fontSize = '1.2em';
        editButon.addEventListener( 'click', () => {
            const newCategoryName = prompt ('Enter new category name', categoryName);
            if (newCategoryName && validateCategory(newCategoryName)){
                modifyCategory(categoryName,newCategoryName);
            }
            disableCategoryButtons(false);
        })

        let deleteCategoryButton = document.createElement('button');
        editButon.classList.add('fa-solid', 'fa-trash-can', 'delete');
        editButon.style.fontSize = '1.2em';
        editButon.addEventListener( 'click', () => {
            
            if (confirm("Are you sure you want to delete this category?")){
                modifyCategory(categoryName);
            }
            disableCategoryButtons(false);
        })
    }







});


