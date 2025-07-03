// Elementos del DOM
const favoritesContainer = document.getElementById("favoritesContainer");
const emptyFavorites = document.getElementById("emptyFavorites");

// Estado
const favorites = JSON.parse(localStorage.getItem("pokemonFavorites")) || [];
let favoritePokemon = [];

// Configuración de la API
const API_BASE_URL = "https://pokeapi.co/api/v2";

// Inicialización
document.addEventListener("DOMContentLoaded", async () => {
  await loadFavorites();
});

// Cargar Pokémon favoritos
async function loadFavorites() {
  if (favorites.length === 0) {
    showEmptyState();
    return;
  }

  try {
    showLoader();

    // Cargar detalles de cada Pokémon favorito
    const pokemonPromises = favorites.map(async (pokemonId) => {
      const response = await fetch(`${API_BASE_URL}/pokemon/${pokemonId}`);
      if (!response.ok) throw new Error("Error cargando Pokémon");

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
      };
    });

    favoritePokemon = await Promise.all(pokemonPromises);
    renderFavorites();
    hideLoader();
  } catch (error) {
    console.error("Error cargando favoritos:", error);
    hideLoader();
    showError();
  }
}

// Renderizar favoritos
function renderFavorites() {
  emptyFavorites.style.display = "none";

  const favoritesGrid = document.createElement("div");
  favoritesGrid.className = "pokemon-grid";
  favoritesGrid.style.padding = "2rem";

  favoritesGrid.innerHTML = favoritePokemon
    .map((pokemon) => createPokemonCard(pokemon))
    .join("");

  favoritesContainer.innerHTML = "";
  favoritesContainer.appendChild(favoritesGrid);

  // Agregar event listeners
  document.querySelectorAll(".favorite-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const pokemonId = Number.parseInt(btn.dataset.pokemonId);
      removeFavorite(pokemonId);
    });
  });
}

// Crear tarjeta de Pokémon
function createPokemonCard(pokemon) {
  return `
        <div class="pokemon-card" data-pokemon-id="${pokemon.id}">
            <div class="pokemon-card-header">
                <button class="favorite-btn active" data-pokemon-id="${
                  pokemon.id
                }">
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

// Remover favorito
function removeFavorite(pokemonId) {
  const index = favorites.indexOf(pokemonId);
  if (index !== -1) {
    favorites.splice(index, 1);
    localStorage.setItem("pokemonFavorites", JSON.stringify(favorites));

    // Remover de la lista actual
    favoritePokemon = favoritePokemon.filter(
      (pokemon) => pokemon.id !== pokemonId
    );

    if (favoritePokemon.length === 0) {
      showEmptyState();
    } else {
      renderFavorites();
    }
  }
}

// Mostrar estado vacío
function showEmptyState() {
  favoritesContainer.innerHTML = "";
  favoritesContainer.appendChild(emptyFavorites);
  emptyFavorites.style.display = "block";
}

// Mostrar loader
function showLoader() {
  favoritesContainer.innerHTML = `
        <div class="loader">
            <div class="pokeball-loader">
                <div class="pokeball">
                    <div class="pokeball-top"></div>
                    <div class="pokeball-middle"></div>
                    <div class="pokeball-bottom"></div>
                </div>
            </div>
            <p>Cargando favoritos...</p>
        </div>
    `;
}

// Ocultar loader
function hideLoader() {
  const loader = favoritesContainer.querySelector(".loader");
  if (loader) {
    loader.remove();
  }
}

// Mostrar error
function showError() {
  favoritesContainer.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Error al cargar los favoritos. Por favor, intenta nuevamente.</p>
            <button onclick="loadFavorites()" class="retry-btn">Reintentar</button>
        </div>
    `;
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
