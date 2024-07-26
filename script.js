document.addEventListener('DOMContentLoaded', function() {
    const toggleMenu = document.querySelector('.toggle-menu');
    const navbar = document.querySelector('.navbar');

    toggleMenu.addEventListener('click', function() {
        navbar.classList.toggle('active');
    });
});
