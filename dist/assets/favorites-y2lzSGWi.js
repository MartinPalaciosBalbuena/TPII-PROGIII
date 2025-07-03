import"./main-BFi7gGf-.js";const o=document.getElementById("favoritesContainer"),c=document.getElementById("emptyFavorites"),n=JSON.parse(localStorage.getItem("pokemonFavorites"))||[];let i=[];const v="https://pokeapi.co/api/v2";document.addEventListener("DOMContentLoaded",async()=>{await f()});async function f(){if(n.length===0){m();return}try{y();const e=n.map(async a=>{const s=await fetch(`${v}/pokemon/${a}`);if(!s.ok)throw new Error("Error cargando Pokémon");const t=await s.json();return{id:t.id,name:t.name,image:t.sprites.other["official-artwork"].front_default||t.sprites.front_default,types:t.types.map(r=>r.type.name),stats:t.stats.map(r=>({name:r.stat.name,value:r.base_stat}))}});i=await Promise.all(e),p(),l()}catch(e){console.error("Error cargando favoritos:",e),l(),g()}}function p(){c.style.display="none";const e=document.createElement("div");e.className="pokemon-grid",e.style.padding="2rem",e.innerHTML=i.map(a=>u(a)).join(""),o.innerHTML="",o.appendChild(e),document.querySelectorAll(".favorite-btn").forEach(a=>{a.addEventListener("click",s=>{s.stopPropagation();const t=Number.parseInt(a.dataset.pokemonId);k(t)})})}function u(e){return`
        <div class="pokemon-card" data-pokemon-id="${e.id}">
            <div class="pokemon-card-header">
                <button class="favorite-btn active" data-pokemon-id="${e.id}">
                    <i class="fas fa-heart"></i>
                </button>
                <span class="pokemon-id">#${e.id.toString().padStart(3,"0")}</span>
                <img src="${e.image}" alt="${e.name}" class="pokemon-image">
                <h3 class="pokemon-name">${d(e.name)}</h3>
                <div class="pokemon-types">
                    ${e.types.map(a=>`<span class="type-badge type-${a}">${d(a)}</span>`).join("")}
                </div>
            </div>
            <div class="pokemon-stats">
                ${e.stats.slice(0,3).map(a=>`
                    <div class="stat-row">
                        <span class="stat-name">${h(a.name)}</span>
                        <span class="stat-value">${a.value}</span>
                    </div>
                `).join("")}
            </div>
        </div>
    `}function k(e){const a=n.indexOf(e);a!==-1&&(n.splice(a,1),localStorage.setItem("pokemonFavorites",JSON.stringify(n)),i=i.filter(s=>s.id!==e),i.length===0?m():p())}function m(){o.innerHTML="",o.appendChild(c),c.style.display="block"}function y(){o.innerHTML=`
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
    `}function l(){const e=o.querySelector(".loader");e&&e.remove()}function g(){o.innerHTML=`
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Error al cargar los favoritos. Por favor, intenta nuevamente.</p>
            <button onclick="loadFavorites()" class="retry-btn">Reintentar</button>
        </div>
    `}function d(e){return e.charAt(0).toUpperCase()+e.slice(1)}function h(e){return{hp:"HP",attack:"Ataque",defense:"Defensa","special-attack":"At. Especial","special-defense":"Def. Especial",speed:"Velocidad"}[e]||d(e)}
