const pokemonName = document.querySelector('.pokemon-name');
const pokemonId = document.querySelector('.pokemon-id');
const pokemonImage = document.querySelector('.pokemon-image');
const shinyButton = document.querySelector('.shiny-btn');
const pokemonDescription = document.querySelector('.pokemon-description');
const pokemonStats = document.querySelector('.stats ul');
const evolutionStages = document.querySelectorAll('.evolution-stage img');
const moveName = document.querySelector('.move-name');
const moveType = document.querySelector('.move-type');
const moveStats = document.querySelector('.moves ul');
const prevButton = document.querySelector('.prev-btn');
const nextButton = document.querySelector('.next-btn');
const searchInput = document.querySelector('#search-input');
const searchButton = document.querySelector('#search-btn');

let currentPokemonId = 1; // Starting with Bulbasaur
let currentPokemonData; // To store current pokemon data for shiny functionality

const typeColors = {
    grass: 'grass',
    poison: 'poison',
    fire: 'fire',
    water: 'water',
    bug: 'bug',
    normal: 'normal',
    electric: 'electric',
    ground: 'ground',
    flying: 'flying',
    psychic: 'psychic',
    rock: 'rock',
    ice: 'ice',
    fighting: 'fighting',
    ghost: 'ghost',
    dragon: 'dragon',
    dark: 'dark',
    steel: 'steel',
    fairy: 'fairy'
};

async function fetchPokemon(idOrName) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName}`);
    const pokemon = await response.json();
    const speciesResponse = await fetch(pokemon.species.url);
    const species = await speciesResponse.json();

    currentPokemonData = pokemon; // Store current pokemon data
    updatePokedex(pokemon, species);
}

async function updatePokedex(pokemon, species) {
    const spanishFlavorText = species.flavor_text_entries.find(entry => entry.language.name === 'es');
    
    pokemonName.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    pokemonId.textContent = `No. ${pokemon.id}`;
    pokemonImage.src = pokemon.sprites.front_default; // Mostrar imagen normal por defecto
    pokemonDescription.textContent = spanishFlavorText ? spanishFlavorText.flavor_text : "Descripción no disponible en español.";

    pokemonStats.innerHTML = `
        <li>PS: ${pokemon.stats[0].base_stat}</li>
        <li>Ataque: ${pokemon.stats[1].base_stat}</li>
        <li>Defensa: ${pokemon.stats[2].base_stat}</li>
        <li>Ataque Especial: ${pokemon.stats[3].base_stat}</li>
        <li>Defensa Especial: ${pokemon.stats[4].base_stat}</li>
        <li>Velocidad: ${pokemon.stats[5].base_stat}</li>
    `;

    // Update types
    document.querySelector('.type-container').innerHTML = pokemon.types.map(typeInfo => {
        const typeName = typeInfo.type.name;
        const typeClass = typeColors[typeName] || '';
        return `<div class="type ${typeClass}">${typeName.charAt(0).toUpperCase() + typeName.slice(1)}</div>`;
    }).join('');

    // Update evolutions
    const evolutionChainResponse = await fetch(species.evolution_chain.url);
    const evolutionChain = await evolutionChainResponse.json();
    const evolutionData = getEvolutionData(evolutionChain.chain);
    
    for (let i = 0; i < evolutionStages.length; i++) {
        if (i < evolutionData.length) {
            const evo = await fetch(`https://pokeapi.co/api/v2/pokemon/${evolutionData[i].name}`);
            const evoData = await evo.json();
            evolutionStages[i].src = evoData.sprites.front_default;
            evolutionStages[i].nextElementSibling.textContent = evolutionData[i].name.charAt(0).toUpperCase() + evolutionData[i].name.slice(1);
        } else {
            evolutionStages[i].src = '';
            evolutionStages[i].nextElementSibling.textContent = '';
        }
    }

    // Update moves
    const move = await fetch(pokemon.moves[0].move.url);
    const moveData = await move.json();

    moveName.textContent = pokemon.moves[0].move.name.charAt(0).toUpperCase() + pokemon.moves[0].move.name.slice(1);
    moveType.textContent = `Tipo: ${moveData.type.name.charAt(0).toUpperCase() + moveData.type.name.slice(1)}`;
    moveStats.innerHTML = `
        <li>Precisión: ${moveData.accuracy !== null ? moveData.accuracy : 'N/A'}</li>
        <li>Poder: ${moveData.power !== null ? moveData.power : 'N/A'}</li>
        <li>PP: ${moveData.pp}</li>
    `;
}

function getEvolutionData(chain, evoData = []) {
    if (chain.species) {
        evoData.push(chain.species);
    }
    if (chain.evolves_to.length > 0) {
        for (let i = 0; i < chain.evolves_to.length; i++) {
            getEvolutionData(chain.evolves_to[i], evoData);
        }
    }
    return evoData;
}

shinyButton.addEventListener('click', () => {
    const isShiny = shinyButton.classList.toggle('active');
    if (isShiny) {
        pokemonImage.src = currentPokemonData.sprites.front_shiny;
    } else {
        pokemonImage.src = currentPokemonData.sprites.front_default;
    }
});

prevButton.addEventListener('click', () => {
    if (currentPokemonId > 1) {
        currentPokemonId--;
        fetchPokemon(currentPokemonId);
    }
});

nextButton.addEventListener('click', () => {
    currentPokemonId++;
    fetchPokemon(currentPokemonId);
});

searchButton.addEventListener('click', () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm) {
        fetchPokemon(searchTerm);
    }
});

fetchPokemon(currentPokemonId);
