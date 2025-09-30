const toggle = document.querySelector(".toggle")
const menuDashboard = document.querySelector(".sidebar")
const iconoMenu = toggle.querySelector("i")


toggle.addEventListener("click", () => {
    menuDashboard.classList.toggle("open")

    if(iconoMenu.classList.contains("bx-menu")){
        iconoMenu.classList.replace("bx-menu", "bx-x")
    }else {
         iconoMenu.classList.replace("bx-x", "bx-menu")
    }
});

document.querySelectorAll(".sidebar nav a").forEach(link => {
    link.addEventListener("click", () => {
    menuDashboard.classList.remove("open");
        iconoMenu.classList.replace("bx-menu", "bx-x");
    });
});

window.addEventListener('resize', function () {
    if (window.innerWidth > 768) {
        document.querySelector('.sidebar').classList.remove('open');
    }
});