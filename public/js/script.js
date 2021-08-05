export const allHTML = document;
const botonMenu = document.getElementById("boton-menu");
export const divMenu = document.getElementById("menu-nav");

//Eventos para el menu desplegable
botonMenu.addEventListener('click', (e) => {
    e.preventDefault();
    divMenu.classList.toggle('show');
    allHTML.body.classList.toggle('noScroll');
});