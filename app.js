let clientes = [];
const PASSWORD = "Lex5213";

// Cargar base de clientes
fetch("base_clientes.json")
  .then((r) => r.json())
  .then((data) => {
    clientes = data || [];
    // Actualizar pequeño indicador si se quiere
  })
  .catch((err) => {
    console.error("Error cargando base_clientes.json", err);
  });

function login() {
  const input = document.getElementById("passwordInput");
  const errorEl = document.getElementById("loginError");
  const value = (input.value || "").trim();

  if (value === PASSWORD) {
    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    input.value = "";
    errorEl.style.display = "none";
    errorEl.textContent = "";
    document.getElementById("searchInput").focus();
  } else {
    errorEl.textContent = "Contraseña incorrecta. Verifica e intenta nuevamente.";
    errorEl.style.display = "block";
  }
}

// Función de búsqueda universal
function buscar() {
  const termInput = document.getElementById("searchInput");
  const term = (termInput.value || "").trim();
  const resultsContainer = document.getElementById("resultsContainer");
  const resultsCount = document.getElementById("resultsCount");

  if (!term) {
    resultsContainer.innerHTML = "<p class='result-empty'>Ingresa un valor para buscar en la base.</p>";
    resultsCount.textContent = "Sin búsqueda activa.";
    return;
  }

  const lowerTerm = term.toLowerCase();
  const isNumeric = /^[0-9]+$/.test(term);

  const resultados = clientes.filter((c) => {
    const dpi = (c.dpi || "").toString();
    const nombre = (c.nombre || "").toLowerCase();
    const nit = (c.nit || "").toString().toLowerCase();
    const email = (c.email || "").toLowerCase();
    const telefonos = Array.isArray(c.telefonos) ? c.telefonos : [];

    let match = false;

    if (isNumeric) {
      // DPI / NIT / teléfono (contiene)
      if (dpi.includes(term)) match = true;
      if (nit.includes(term)) match = true;
      if (!match) {
        match = telefonos.some((t) => (t || "").toString().includes(term));
      }
    } else if (term.includes("@")) {
      // Parecido a correo
      if (email.includes(lowerTerm)) match = true;
    } else {
      // Nombre, correo, DPI, NIT, teléfono (todo combinado)
      if (nombre.includes(lowerTerm)) match = true;
      if (email.includes(lowerTerm)) match = true;
      if (dpi.includes(lowerTerm)) match = true;
      if (nit.includes(lowerTerm)) match = true;
      if (!match) {
        match = telefonos.some((t) => (t || "").toString().includes(lowerTerm));
      }
    }

    return match;
  });

  if (!resultados.length) {
    resultsContainer.innerHTML = "<p class='result-empty'>No se encontraron clientes con el criterio indicado.</p>";
    resultsCount.textContent = "0 resultados.";
    return;
  }

  resultsCount.textContent =
    resultados.length === 1 ? "1 resultado encontrado." : resultados.length + " resultados encontrados.";

  const fragment = document.createDocumentFragment();

  resultados.slice(0, 50).forEach((c) => {
    const card = document.createElement("div");
    card.className = "result-card";

    const rowMain = document.createElement("div");
    rowMain.className = "result-row-main";

    const nameEl = document.createElement("div");
    nameEl.className = "result-name";
    nameEl.textContent = c.nombre || "(Sin nombre)";

    const idEl = document.createElement("div");
    idEl.className = "result-id";
    idEl.textContent = `DPI: ${c.dpi || "—"}`;

    rowMain.appendChild(nameEl);
    rowMain.appendChild(idEl);

    const metaEl = document.createElement("div");
    metaEl.className = "result-meta";
    const nit = c.nit || "—";
    const email = c.email || "—";
    metaEl.textContent = `NIT: ${nit} · Correo: ${email}`;

    const phonesWrapper = document.createElement("div");
    const label = document.createElement("span");
    label.className = "label";
    label.textContent = "Teléfonos base interna";
    phonesWrapper.appendChild(label);

    const phonesGrid = document.createElement("div");
    phonesGrid.className = "phones-grid";

    if (Array.isArray(c.telefonos) && c.telefonos.length) {
      c.telefonos.forEach((t) => {
        const pill = document.createElement("span");
        pill.className = "phone-pill";
        pill.textContent = t;
        phonesGrid.appendChild(pill);
      });
    } else {
      const emptyText = document.createElement("span");
      emptyText.className = "result-empty";
      emptyText.textContent = "Sin teléfonos registrados.";
      phonesGrid.appendChild(emptyText);
    }

    phonesWrapper.appendChild(phonesGrid);

    card.appendChild(rowMain);
    card.appendChild(metaEl);
    card.appendChild(phonesWrapper);

    fragment.appendChild(card);
  });

  resultsContainer.innerHTML = "";
  resultsContainer.appendChild(fragment);
}

// Permitir Enter en login y búsqueda
document.addEventListener("DOMContentLoaded", () => {
  const pwdInput = document.getElementById("passwordInput");
  if (pwdInput) {
    pwdInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        login();
      }
    });
  }
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        buscar();
      }
    });
  }
});
