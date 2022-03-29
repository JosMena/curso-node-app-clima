const fs = require('fs');

const axios = require('axios');


class Busquedas {

    historial = [];

    dbPath = './db/database.json';

    constructor(){
        this.leerDB();
    }

    get historialCapitalizado(){
        return this.historial.map( lugar => {

            let palabras = lugar.split( ' ' );
            palabras = palabras.map( p => p[0].toUpperCase() + p.substring(1) );

            return palabras.join( ' ' );
        });
    }

    get paramsMapbox(){
        return{
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es',
        }
    }

    get paramsOpenWeather(){
        return{
            appid: process.env.OPENWEATHER_KEY,
            units: 'metric',
            lang: 'es',
        }
    }

    async ciudad( lugar = '' ) {

        try {
            //Petición http
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapbox,

                //proximity=ip&language=es&
            });

            const resp = await instance.get(); 
            return resp.data.features.map( lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                longitud: lugar.center[0],
                latitud: lugar.center[1],
            }));
            
        } catch (error) {
            return [];
        }
    }

    async climaLugar( lat, lon ){

        try {
            // Petición http
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: { ...this.paramsOpenWeather, lat, lon },
            });

            const resp = await instance.get();
            const { weather, main } = resp.data;

            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp,
            }

        } catch (error) {
            console.log( 'No se encontró el lugar' );
        }
    }

    agregarHistorial( lugar = '' ) {

        if( this.historial.includes( lugar.toLocaleLowerCase() ) ){
            return;
        }

        this.historial = this.historial.splice(0,4);
        this.historial.unshift( lugar );

        //Grabar en DB
        this.guardarDB();
    }

    guardarDB(){
        const payload ={
            historial: this.historial,
        };

        fs.writeFileSync( this.dbPath, JSON.stringify( payload ) );
    }

    leerDB(){
        if( !fs.existsSync( this.dbPath ) ) return;

        const info = fs.readFileSync( this.dbPath, { encoding: 'utf-8' } );
        const data = JSON.parse( info );

        this.historial = data.historial;

        return data;
    }

}


module.exports = Busquedas;