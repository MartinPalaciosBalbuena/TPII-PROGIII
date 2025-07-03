// Configuración de la API
const API_BASE_URL = "https://pokeapi.co/api/v2";
const POKEMON_PER_PAGE = 20;

// Estado de la aplicación
let currentPage = 1;
let allPokemon = [];
let filteredPokemon = [];
let pokemonTypes = [];
const favorites = JSON.parse(localStorage.getItem("pokemonFavorites")) || [];

// Elementos del DOM
const pokemonGrid = document.getElementById("pokemonGrid");
const loader = document.getElementById("loader");
const errorMessage = document.getElementById("errorMessage");
const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");
const sortSelect = document.getElementById("sortSelect");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageInfo = document.getElementById("pageInfo");
const retryBtn = document.getElementById("retryBtn");
const modal = document.getElementById("pokemonModal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.querySelector(".close");

// Inicialización de la aplicación
document.addEventListener("DOMContentLoaded", async () => {
  await initializeApp();
  setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
  searchInput.addEventListener("input", debounce(handleSearch, 300));
  typeFilter.addEventListener("change", handleFilter);
  sortSelect.addEventListener("change", handleSort);
  prevBtn.addEventListener("click", () => changePage(-1));
  nextBtn.addEventListener("click", () => changePage(1));
  retryBtn.addEventListener("click", initializeApp);
  closeModal.addEventListener("click", closeModalHandler);
  window.addEventListener("click", (e) => {
    if (e.target === modal) closeModalHandler();
  });
}

// Inicializar la aplicación
async function initializeApp() {
  try {
    showLoader();
    hideError();

    // Cargar tipos de Pokémon para el filtro
    await loadPokemonTypes();

    // Cargar lista inicial de Pokémon
    await loadPokemonList();

    hideLoader();
  } catch (error) {
    console.error("Error inicializando la aplicación:", error);
    hideLoader();
    showError();
  }
}

// Cargar tipos de Pokémon
async function loadPokemonTypes() {
  try {
    const response = await fetch(`${API_BASE_URL}/type`);
    if (!response.ok) throw new Error("Error cargando tipos");

    const data = await response.json();
    pokemonTypes = data.results;

    // Poblar el select de tipos
    typeFilter.innerHTML = '<option value="">Todos los tipos</option>';
    pokemonTypes.forEach((type) => {
      const option = document.createElement("option");
      option.value = type.name;
      option.textContent = capitalizeFirst(type.name);
      typeFilter.appendChild(option);
    });
  } catch (error) {
    console.error("Error cargando tipos:", error);
  }
}

// Cargar lista de Pokémon
async function loadPokemonList() {
  try {
    const response = await fetch(`${API_BASE_URL}/pokemon?limit=150`);
    if (!response.ok) throw new Error("Error cargando Pokémon");

    const data = await response.json();

    // Cargar detalles de cada Pokémon
    const pokemonPromises = data.results.map(async (pokemon, index) => {
      const pokemonData = await loadPokemonDetails(pokemon.url);
      return {
        ...pokemonData,
        originalIndex: index + 1,
      };
    });

    allPokemon = await Promise.all(pokemonPromises);
    filteredPokemon = [...allPokemon];

    renderPokemonGrid();
    updatePagination();
  } catch (error) {
    throw error;
  }
}

// Cargar detalles de un Pokémon
async function loadPokemonDetails(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error cargando detalles");

    const pokemon = await response.json();

    return {
      id: pokemon.id,
      name: pokemon.name,
      image:
        pokemon.sprites.other["official-artwork"].front_default ||
        pokemon.sprites.front_default,
      types: pokemon.types.map((type) => type.type.name),
      stats: pokemon.stats.map((stat) => ({
        name: stat.stat.name,
        value: stat.base_stat,
      })),
      height: pokemon.height,
      weight: pokemon.weight,
      abilities: pokemon.abilities.map((ability) => ability.ability.name),
    };
  } catch (error) {
    console.error("Error cargando detalles del Pokémon:", error);
    return null;
  }
}

// Renderizar grid de Pokémon
function renderPokemonGrid() {
  const startIndex = (currentPage - 1) * POKEMON_PER_PAGE;
  const endIndex = startIndex + POKEMON_PER_PAGE;
  const pokemonToShow = filteredPokemon.slice(startIndex, endIndex);

  if (pokemonToShow.length === 0) {
    pokemonGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-search"></i>
                <h3>No se encontraron Pokémon</h3>
                <p>Intenta con otros términos de búsqueda o filtros</p>
            </div>
        `;
    return;
  }

  pokemonGrid.innerHTML = pokemonToShow
    .map((pokemon) => createPokemonCard(pokemon))
    .join("");

  // Agregar event listeners a las tarjetas
  document.querySelectorAll(".pokemon-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (!e.target.closest(".favorite-btn")) {
        const pokemonId = Number.parseInt(card.dataset.pokemonId);
        showPokemonModal(pokemonId);
      }
    });
  });

  // Agregar event listeners a botones de favoritos
  document.querySelectorAll(".favorite-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const pokemonId = Number.parseInt(btn.dataset.pokemonId);
      toggleFavorite(pokemonId);
    });
  });
}

// Crear tarjeta de Pokémon
function createPokemonCard(pokemon) {
  const isFavorite = favorites.includes(pokemon.id);

  return `
        <div class="pokemon-card" data-pokemon-id="${pokemon.id}">
            <div class="pokemon-card-header">
                <button class="favorite-btn ${isFavorite ? "active" : ""}" 
                        data-pokemon-id="${pokemon.id}">
                    <i class="fas fa-heart"></i>
                </button>
                <span class="pokemon-id">#${pokemon.id
                  .toString()
                  .padStart(3, "0")}</span>
                <img src="${pokemon.image}" alt="${
    pokemon.name
  }" class="pokemon-image">
                <h3 class="pokemon-name">${capitalizeFirst(pokemon.name)}</h3>
                <div class="pokemon-types">
                    ${pokemon.types
                      .map(
                        (type) =>
                          `<span class="type-badge type-${type}">${capitalizeFirst(
                            type
                          )}</span>`
                      )
                      .join("")}
                </div>
            </div>
            <div class="pokemon-stats">
                ${pokemon.stats
                  .slice(0, 3)
                  .map(
                    (stat) => `
                    <div class="stat-row">
                        <span class="stat-name">${formatStatName(
                          stat.name
                        )}</span>
                        <span class="stat-value">${stat.value}</span>
                    </div>
                `
                  )
                  .join("")}
            </div>
        </div>
    `;
}

// Mostrar modal con detalles del Pokémon
async function showPokemonModal(pokemonId) {
  const pokemon = allPokemon.find((p) => p.id === pokemonId);
  if (!pokemon) return;

  const isFavorite = favorites.includes(pokemon.id);

  modalBody.innerHTML = `
        <div class="modal-pokemon-header">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h2 style="margin: 0;">${capitalizeFirst(pokemon.name)}</h2>
                <button class="favorite-btn ${isFavorite ? "active" : ""}" 
                        data-pokemon-id="${
                          pokemon.id
                        }" style="position: static;">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div style="text-align: center; margin-bottom: 2rem;">
                <img src="${pokemon.image}" alt="${pokemon.name}" 
                     style="width: 200px; height: 200px; object-fit: contain;">
                <p style="color: var(--text-secondary); margin-top: 0.5rem;">
                    #${pokemon.id.toString().padStart(3, "0")}
                </p>
            </div>
        </div>
        
        <div class="modal-pokemon-info">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
                <div>
                    <h3 style="margin-bottom: 1rem; color: var(--primary-color);">
                        <i class="fas fa-info-circle"></i> Información Básica
                    </h3>
                    <div class="pokemon-types" style="justify-content: flex-start; margin-bottom: 1rem;">
                        ${pokemon.types
                          .map(
                            (type) =>
                              `<span class="type-badge type-${type}">${capitalizeFirst(
                                type
                              )}</span>`
                          )
                          .join("")}
                    </div>
                    <p><strong>Altura:</strong> ${pokemon.height / 10} m</p>
                    <p><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
                    <p><strong>Habilidades:</strong> ${pokemon.abilities
                      .map(capitalizeFirst)
                      .join(", ")}</p>
                </div>
                
                <div>
                    <h3 style="margin-bottom: 1rem; color: var(--primary-color);">
                        <i class="fas fa-chart-bar"></i> Estadísticas Base
                    </h3>
                    ${pokemon.stats
                      .map(
                        (stat) => `
                        <div style="margin-bottom: 0.5rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                                <span>${formatStatName(stat.name)}</span>
                                <span style="font-weight: bold;">${
                                  stat.value
                                }</span>
                            </div>
                            <div style="background: var(--border-color); height: 8px; border-radius: 4px; overflow: hidden;">
                                <div style="background: var(--primary-color); height: 100%; width: ${Math.min(
                                  stat.value / 2,
                                  100
                                )}%; transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                    `
                      )
                      .join("")}
                </div>
            </div>
        </div>
    `;

  // Agregar event listener al botón de favorito del modal
  const modalFavoriteBtn = modalBody.querySelector(".favorite-btn");
  if (modalFavoriteBtn) {
    modalFavoriteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(pokemon.id);
    });
  }

  modal.style.display = "block";
  document.body.style.overflow = "hidden";
}

// Cerrar modal
function closeModalHandler() {
  modal.style.display = "none";
  document.body.style.overflow = "auto";
}

// Manejar búsqueda
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase().trim();

  if (searchTerm === "") {
    filteredPokemon = [...allPokemon];
  } else {
    filteredPokemon = allPokemon.filter(
      (pokemon) =>
        pokemon.name.toLowerCase().includes(searchTerm) ||
        pokemon.id.toString().includes(searchTerm)
    );
  }

  currentPage = 1;
  renderPokemonGrid();
  updatePagination();
}

// Manejar filtro por tipo
function handleFilter(e) {
  const selectedType = e.target.value;

  if (selectedType === "") {
    filteredPokemon = [...allPokemon];
  } else {
    filteredPokemon = allPokemon.filter((pokemon) =>
      pokemon.types.includes(selectedType)
    );
  }

  // Aplicar búsqueda si hay texto en el input
  const searchTerm = searchInput.value.toLowerCase().trim();
  if (searchTerm) {
    filteredPokemon = filteredPokemon.filter(
      (pokemon) =>
        pokemon.name.toLowerCase().includes(searchTerm) ||
        pokemon.id.toString().includes(searchTerm)
    );
  }

  currentPage = 1;
  renderPokemonGrid();
  updatePagination();
}

// Manejar ordenamiento
function handleSort(e) {
  const sortBy = e.target.value;

  filteredPokemon.sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "id") {
      return a.id - b.id;
    }
    return 0;
  });

  renderPokemonGrid();
}

// Cambiar página
function changePage(direction) {
  const totalPages = Math.ceil(filteredPokemon.length / POKEMON_PER_PAGE);
  const newPage = currentPage + direction;

  if (newPage >= 1 && newPage <= totalPages) {
    currentPage = newPage;
    renderPokemonGrid();
    updatePagination();

    // Scroll al inicio de la grid
    pokemonGrid.scrollIntoView({ behavior: "smooth" });
  }
}

// Actualizar paginación
function updatePagination() {
  const totalPages = Math.ceil(filteredPokemon.length / POKEMON_PER_PAGE);

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages || totalPages === 0;

  if (totalPages === 0) {
    pageInfo.textContent = "Sin resultados";
  } else {
    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
  }
}

// Toggle favorito
function toggleFavorite(pokemonId) {
  const index = favorites.indexOf(pokemonId);

  if (index === -1) {
    favorites.push(pokemonId);
  } else {
    favorites.splice(index, 1);
  }

  localStorage.setItem("pokemonFavorites", JSON.stringify(favorites));

  // Actualizar UI
  document
    .querySelectorAll(`[data-pokemon-id="${pokemonId}"]`)
    .forEach((btn) => {
      btn.classList.toggle("active");
    });
}

// Utilidades
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatStatName(statName) {
  const statNames = {
    hp: "HP",
    attack: "Ataque",
    defense: "Defensa",
    "special-attack": "At. Especial",
    "special-defense": "Def. Especial",
    speed: "Velocidad",
  };
  return statNames[statName] || capitalizeFirst(statName);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function showLoader() {
  loader.classList.remove("hidden");
  pokemonGrid.classList.add("hidden");
}

function hideLoader() {
  loader.classList.add("hidden");
  pokemonGrid.classList.remove("hidden");
}

function showError() {
  errorMessage.classList.remove("hidden");
  pokemonGrid.classList.add("hidden");
}

function hideError() {
  errorMessage.classList.add("hidden");
}
