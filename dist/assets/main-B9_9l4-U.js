import"./main-BFi7gGf-.js";const L="https://pokeapi.co/api/v2",u=20;let s=1,c=[],i=[],v=[];const l=JSON.parse(localStorage.getItem("pokemonFavorites"))||[],m=document.getElementById("pokemonGrid"),$=document.getElementById("loader"),I=document.getElementById("errorMessage"),P=document.getElementById("searchInput"),g=document.getElementById("typeFilter"),j=document.getElementById("sortSelect"),B=document.getElementById("prevBtn"),S=document.getElementById("nextBtn"),y=document.getElementById("pageInfo"),C=document.getElementById("retryBtn"),h=document.getElementById("pokemonModal"),k=document.getElementById("modalBody"),A=document.querySelector(".close");document.addEventListener("DOMContentLoaded",async()=>{await x(),F()});function F(){P.addEventListener("input",J(O,300)),g.addEventListener("change",G),j.addEventListener("change",z),B.addEventListener("click",()=>w(-1)),S.addEventListener("click",()=>w(1)),C.addEventListener("click",x),A.addEventListener("click",E),window.addEventListener("click",e=>{e.target===h&&E()})}async function x(){try{R(),V(),await N(),await q(),b()}catch(e){console.error("Error inicializando la aplicación:",e),b(),U()}}async function N(){try{const e=await fetch(`${L}/type`);if(!e.ok)throw new Error("Error cargando tipos");v=(await e.json()).results,g.innerHTML='<option value="">Todos los tipos</option>',v.forEach(t=>{const o=document.createElement("option");o.value=t.name,o.textContent=r(t.name),g.appendChild(o)})}catch(e){console.error("Error cargando tipos:",e)}}async function q(){try{const e=await fetch(`${L}/pokemon?limit=150`);if(!e.ok)throw new Error("Error cargando Pokémon");const t=(await e.json()).results.map(async(o,a)=>({...await H(o.url),originalIndex:a+1}));c=await Promise.all(t),i=[...c],p(),f()}catch(e){throw e}}async function H(e){try{const n=await fetch(e);if(!n.ok)throw new Error("Error cargando detalles");const t=await n.json();return{id:t.id,name:t.name,image:t.sprites.other["official-artwork"].front_default||t.sprites.front_default,types:t.types.map(o=>o.type.name),stats:t.stats.map(o=>({name:o.stat.name,value:o.base_stat})),height:t.height,weight:t.weight,abilities:t.abilities.map(o=>o.ability.name)}}catch(n){return console.error("Error cargando detalles del Pokémon:",n),null}}function p(){const e=(s-1)*u,n=e+u,t=i.slice(e,n);if(t.length===0){m.innerHTML=`
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-search"></i>
                <h3>No se encontraron Pokémon</h3>
                <p>Intenta con otros términos de búsqueda o filtros</p>
            </div>
        `;return}m.innerHTML=t.map(o=>_(o)).join(""),document.querySelectorAll(".pokemon-card").forEach(o=>{o.addEventListener("click",a=>{if(!a.target.closest(".favorite-btn")){const d=Number.parseInt(o.dataset.pokemonId);D(d)}})}),document.querySelectorAll(".favorite-btn").forEach(o=>{o.addEventListener("click",a=>{a.stopPropagation();const d=Number.parseInt(o.dataset.pokemonId);M(d)})})}function _(e){const n=l.includes(e.id);return`
        <div class="pokemon-card" data-pokemon-id="${e.id}">
            <div class="pokemon-card-header">
                <button class="favorite-btn ${n?"active":""}" 
                        data-pokemon-id="${e.id}">
                    <i class="fas fa-heart"></i>
                </button>
                <span class="pokemon-id">#${e.id.toString().padStart(3,"0")}</span>
                <img src="${e.image}" alt="${e.name}" class="pokemon-image">
                <h3 class="pokemon-name">${r(e.name)}</h3>
                <div class="pokemon-types">
                    ${e.types.map(t=>`<span class="type-badge type-${t}">${r(t)}</span>`).join("")}
                </div>
            </div>
            <div class="pokemon-stats">
                ${e.stats.slice(0,3).map(t=>`
                    <div class="stat-row">
                        <span class="stat-name">${T(t.name)}</span>
                        <span class="stat-value">${t.value}</span>
                    </div>
                `).join("")}
            </div>
        </div>
    `}async function D(e){const n=c.find(a=>a.id===e);if(!n)return;const t=l.includes(n.id);k.innerHTML=`
        <div class="modal-pokemon-header">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h2 style="margin: 0;">${r(n.name)}</h2>
                <button class="favorite-btn ${t?"active":""}" 
                        data-pokemon-id="${n.id}" style="position: static;">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div style="text-align: center; margin-bottom: 2rem;">
                <img src="${n.image}" alt="${n.name}" 
                     style="width: 200px; height: 200px; object-fit: contain;">
                <p style="color: var(--text-secondary); margin-top: 0.5rem;">
                    #${n.id.toString().padStart(3,"0")}
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
                        ${n.types.map(a=>`<span class="type-badge type-${a}">${r(a)}</span>`).join("")}
                    </div>
                    <p><strong>Altura:</strong> ${n.height/10} m</p>
                    <p><strong>Peso:</strong> ${n.weight/10} kg</p>
                    <p><strong>Habilidades:</strong> ${n.abilities.map(r).join(", ")}</p>
                </div>
                
                <div>
                    <h3 style="margin-bottom: 1rem; color: var(--primary-color);">
                        <i class="fas fa-chart-bar"></i> Estadísticas Base
                    </h3>
                    ${n.stats.map(a=>`
                        <div style="margin-bottom: 0.5rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                                <span>${T(a.name)}</span>
                                <span style="font-weight: bold;">${a.value}</span>
                            </div>
                            <div style="background: var(--border-color); height: 8px; border-radius: 4px; overflow: hidden;">
                                <div style="background: var(--primary-color); height: 100%; width: ${Math.min(a.value/2,100)}%; transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        </div>
    `;const o=k.querySelector(".favorite-btn");o&&o.addEventListener("click",a=>{a.stopPropagation(),M(n.id)}),h.style.display="block",document.body.style.overflow="hidden"}function E(){h.style.display="none",document.body.style.overflow="auto"}function O(e){const n=e.target.value.toLowerCase().trim();n===""?i=[...c]:i=c.filter(t=>t.name.toLowerCase().includes(n)||t.id.toString().includes(n)),s=1,p(),f()}function G(e){const n=e.target.value;n===""?i=[...c]:i=c.filter(o=>o.types.includes(n));const t=P.value.toLowerCase().trim();t&&(i=i.filter(o=>o.name.toLowerCase().includes(t)||o.id.toString().includes(t))),s=1,p(),f()}function z(e){const n=e.target.value;i.sort((t,o)=>n==="name"?t.name.localeCompare(o.name):n==="id"?t.id-o.id:0),p()}function w(e){const n=Math.ceil(i.length/u),t=s+e;t>=1&&t<=n&&(s=t,p(),f(),m.scrollIntoView({behavior:"smooth"}))}function f(){const e=Math.ceil(i.length/u);B.disabled=s===1,S.disabled=s===e||e===0,e===0?y.textContent="Sin resultados":y.textContent=`Página ${s} de ${e}`}function M(e){const n=l.indexOf(e);n===-1?l.push(e):l.splice(n,1),localStorage.setItem("pokemonFavorites",JSON.stringify(l)),document.querySelectorAll(`[data-pokemon-id="${e}"]`).forEach(t=>{t.classList.toggle("active")})}function r(e){return e.charAt(0).toUpperCase()+e.slice(1)}function T(e){return{hp:"HP",attack:"Ataque",defense:"Defensa","special-attack":"At. Especial","special-defense":"Def. Especial",speed:"Velocidad"}[e]||r(e)}function J(e,n){let t;return function(...a){const d=()=>{clearTimeout(t),e(...a)};clearTimeout(t),t=setTimeout(d,n)}}function R(){$.classList.remove("hidden"),m.classList.add("hidden")}function b(){$.classList.add("hidden"),m.classList.remove("hidden")}function U(){I.classList.remove("hidden"),m.classList.add("hidden")}function V(){I.classList.add("hidden")}
