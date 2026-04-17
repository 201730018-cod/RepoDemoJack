/*
import { useState, useEffect } from 'react';
import PokemonCard from './pokedex.jsx';

export default function PokemonSearch() {
    const [pokemon, setPokemon] = useState(null);

    useEffect(() => {
        fetch('https://pokeapi.co/api/v2/pokemon/pikachu')
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            setPokemon(data);
        });

    }, []);
    
    if (!pokemon) return <h1>Cargando...</h1>

    console.log(pokemon);

    return (
        <div>
            <PokemonCard pokemon={pokemon} />
        </div>
    );
}   
    */

import { useState, useEffect } from 'react';
import PokemonCard from './pokedex.jsx';

export default function PokemonSearch() {
    const [pokemons, setPokemons] = useState([]);
    const [pagina, setPagina] = useState(1);
    
    const pokemonsPorPagina = 20;
    const totalPaginas = Math.ceil(1302 / pokemonsPorPagina);

    useEffect(() => {
        const offset = (pagina - 1) * pokemonsPorPagina;

        fetch(`https://pokeapi.co/api/v2/pokemon?limit=${pokemonsPorPagina}&offset=${offset}`)
            .then((response) => response.json())
            .then((data) => {
                // data.results solo trae nombres y urls, necesitamos
                // hacer un fetch por cada pokemon para obtener sus datos completos
                const fetchCadaPokemon = data.results.map((p) =>
                    fetch(p.url).then((r) => r.json())
                );
                Promise.all(fetchCadaPokemon).then((datos) => setPokemons(datos));
            });
    }, [pagina]); // se vuelve a ejecutar cada que cambia la pagina

    if (pokemons.length === 0) return <h1>Cargando...</h1>;

    return (
        <div className="container">
            <div className="row">
                {pokemons.map((pokemon) => (
                    <div className="col-3" key={pokemon.id}>
                        <PokemonCard pokemon={pokemon} />
                    </div>
                ))}
            </div>

            {/* Paginación */}
            <nav>
                <ul className="pagination justify-content-center">
                    <li className={`page-item ${pagina === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setPagina(pagina - 1)}>
                            Previous
                        </button>
                    </li>
                    <li className="page-item">
                        <span className="page-link">{pagina} / {totalPaginas}</span>
                    </li>
                    <li className={`page-item ${pagina === totalPaginas ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setPagina(pagina + 1)}>
                            Next
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
}