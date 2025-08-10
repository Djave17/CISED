// JavaScript para el Dropdown de Perfil - Vanilla JS puro
document.addEventListener("DOMContentLoaded", () => {
  // Seleccionar todos los dropdowns de perfil
  var profileDropdowns = document.querySelectorAll(".user-profile-dropdown")

  profileDropdowns.forEach((dropdown) => {
    var trigger = dropdown.querySelector(".profile-trigger")
    var menu = dropdown.querySelector(".profile-dropdown-menu")

    if (!trigger || !menu) return

    // Toggle del dropdown
    trigger.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()

      // Cerrar otros dropdowns abiertos
      profileDropdowns.forEach((otherDropdown) => {
        if (otherDropdown !== dropdown) {
          closeDropdown(otherDropdown)
        }
      })

      // Toggle del dropdown actual
      var isOpen = dropdown.classList.contains("open")
      if (isOpen) {
        closeDropdown(dropdown)
      } else {
        openDropdown(dropdown)
      }
    })

    // Cerrar con Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && dropdown.classList.contains("open")) {
        closeDropdown(dropdown)
        trigger.focus()
      }
    })

    // Navegación por teclado dentro del menú
    menu.addEventListener("keydown", (e) => {
      var items = menu.querySelectorAll(".dropdown-item")
      var currentIndex = Array.from(items).indexOf(document.activeElement)

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          var nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
          items[nextIndex].focus()
          break

        case "ArrowUp":
          e.preventDefault()
          var prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
          items[prevIndex].focus()
          break

        case "Home":
          e.preventDefault()
          items[0].focus()
          break

        case "End":
          e.preventDefault()
          items[items.length - 1].focus()
          break
      }
    })
  })

  // Cerrar dropdown al hacer click fuera
  document.addEventListener("click", (e) => {
    profileDropdowns.forEach((dropdown) => {
      if (!dropdown.contains(e.target)) {
        closeDropdown(dropdown)
      }
    })
  })

  // Funciones auxiliares
  function openDropdown(dropdown) {
    dropdown.classList.add("open")
    var trigger = dropdown.querySelector(".profile-trigger")
    trigger.setAttribute("aria-expanded", "true")

    // Focus en el primer item del menú
    setTimeout(() => {
      var firstItem = dropdown.querySelector(".dropdown-item")
      if (firstItem) firstItem.focus()
    }, 100)
  }

  function closeDropdown(dropdown) {
    dropdown.classList.remove("open")
    var trigger = dropdown.querySelector(".profile-trigger")
    trigger.setAttribute("aria-expanded", "false")
  }

  // Manejar clicks en los items del menú
  document.querySelectorAll(".dropdown-item").forEach((item) => {
    item.addEventListener("click", function (e) {
      var text = this.textContent.trim()

      switch (text) {
        case "Mi Perfil":
          console.log("Navegar a perfil")
          // window.location.href = '/profile';
          break

        case "Configuración":
          console.log("Navegar a configuración")
          // window.location.href = '/settings';
          break

        case "Notificaciones":
          console.log("Navegar a notificaciones")
          // window.location.href = '/notifications';
          break

        case "Seguridad":
          console.log("Navegar a seguridad")
          // window.location.href = '/security';
          break

        case "Ayuda":
          console.log("Navegar a ayuda")
          // window.location.href = '/help';
          break

        case "Cerrar Sesión":
          if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
            console.log("Cerrar sesión")
            // window.location.href = '/logout';
          }
          break
      }

      // Cerrar dropdown después del click
      var dropdown = this.closest(".user-profile-dropdown")
      if (dropdown) {
        closeDropdown(dropdown)
      }
    })
  })

  // Mostrar header desktop en pantallas grandes
  function toggleDesktopHeader() {
    var desktopHeader = document.querySelector(".dashboard-header")
    if (desktopHeader) {
      if (window.innerWidth >= 1024) {
        desktopHeader.style.display = "flex"
      } else {
        desktopHeader.style.display = "none"
      }
    }
  }

  window.addEventListener("resize", toggleDesktopHeader)
  toggleDesktopHeader() // Ejecutar al cargar
})
