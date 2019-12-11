const axios = require('axios');
const url = 'http://localhost:3001/weather';
const favurl = 'http://localhost:3001/favourites';

export default class Service {
    static async getWeather() {
        const location = await this.getLocation();
        return await this.getWeatherByCoords(location);
    }

    static async addToFav(name) {
        try {
            await axios.post(`${favurl}/${name}`);
            return false;
        } catch (error) {
            return error.response;
        }
    }

    static async getKeys() {
        try {
            return await axios.get(`${favurl}`);
        } catch (error) {
            return error.response;
        }
    }

    static async deleteFromFav(name) {
        try {
            await axios.delete(`${favurl}/${name}`);
            return false;
        } catch (error) {
            return error.response;
        }
    }

    static async getLocation() {
        let position = null;
        try {
            position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                { enableHighAccuracy: true }
            ));
        } catch (e) {
            console.error('Get location error' + e);
        }
        return {
            lat: position ? position.coords.latitude.toFixed(2) : '59.97',
            lon: position ? position.coords.longitude.toFixed(2) : '30.30'
        }
    }

    static async getWeatherByName(name) {
        try {
            let destinationURL = `?q=${name}`;
            const response = await axios.get(`${url}${destinationURL}`)
            return await this.parseWeather(response.data, response.status);
        } catch (error) {
            return await this.parseWeather('', error.response.status)
        }
    }

    static async getWeatherByCoords(coords) {
        try {
            let destinationURL = `/coordinates?lat=${coords.lat}&lon=${coords.lon}`;
            const response = await axios.get(`${url}${destinationURL}`)
            return await this.parseWeather(response.data, response.status)
        } catch (error) {
            return await this.parseWeather('', error.response.status)
        }
    }

    static async parseWeather(data, status) {
        if (status !== 200) {
            return ({
                city: '',
                error: status
            })
        }
        return ({
            city: {
                name: data.name,
                img: "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png",
                temperature: (data.main.temp - 273.15).toFixed(0) + '°C',
                wind: data.wind.speed + ' m/s',
                cloudiness: data.weather[0].description,
                pressure: data.main.pressure + ' hpa',
                humidity: data.main.humidity + ' %',
                location: '[' + data.coord.lat + ',' + data.coord.lon + ']',
            },
            error: data.cod
        });
    }
}