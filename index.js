require('dotenv').config()

const  { leerInput, inquirerMenu, pausa, listarLugares } = require('./helpers/inquirer');
const Busquedas = require('./models/busquedas');

const main = async() => {

    const busquedas = new Busquedas();
    let opt;

    do {

        opt = await inquirerMenu();

        switch( opt ){
            case 1:
                // Mostrar mensaje
                const termino = await leerInput( 'Ciudad: ' );
                
                // Buscar lugares
                const lugares = await busquedas.ciudad( termino )
                
                // Seleccionar lugar
                const id = await listarLugares( lugares );
                if( id === '0' ) continue;
                
                const lugarSel = lugares.find( l => l.id === id );

                // Guardar en DB
                busquedas.agregarHistorial( lugarSel.nombre );

                // Clima
                const clima = await busquedas.climaLugar( lugarSel.latitud, lugarSel.longitud );

                // Mostrar resultados
                console.clear();
                console.log( '\nInformación de la ciudad\n'.green );
                console.log('Ciudad:', lugarSel.nombre.green );
                console.log('Latitud:', lugarSel.latitud );
                console.log('Longitud:', lugarSel.longitud );
                console.log('Temperatura:', clima.temp );
                console.log('Mínima:', clima.min );
                console.log('Máxima:', clima.max );
                console.log('Descripción de clima:', clima.desc.green );

            break;

            case 2:
                busquedas.historialCapitalizado.forEach( (lugarSel, i) => {
                    const idx = `${ i + 1 }.`.green;
                    console.log( `${ idx } ${ lugarSel }` );
                });

            break;

        }


        if( opt !== 0 ) await pausa();
    } while ( opt !== 0 );

}

main();