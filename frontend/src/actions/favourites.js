import * as types from '../actionTypes/actionTypes';
import Service from '../data/LoadWeather';

export function initFavs() {
    return async (dispatch) => {
        var keys = await Service.getKeys();
        if (keys.status === 200) {
            console.log(keys);
            keys.data.map(e => e.cityName).map(async localCity => {
                dispatch(findNewCity(localCity, true));
                dispatch(drawNewCity({ name: localCity }));
                const { city, error } = await Service.getWeatherByName(localCity);
                if (error !== 200) {
                    dispatch(loadingError(localCity));
                } else {
                    city.name = localCity;
                    dispatch(updateCity(city));
                }
                dispatch(findNewCity(localCity, false));
            });
        } else {
            alert('Status code: ' + keys.status + '\nMessage: ' + keys.data);
        };
    };
}

export function addNewCity(newCity) {
    return async (dispatch) => {
        if (/^[A-Za-z -]+$/.test(newCity.name)) {
            dispatch(findNewCity(newCity.name, true));
            const { city, error } = await Service.getWeatherByName(newCity.name);
            if (error !== 200) {
                if (error !== 404) {
                    const errTrue = await Service.addToFav(city.name);
                    if (!!errTrue) {
                        alert('Status code: ' + errTrue.status + '\nMessage: ' + errTrue.data);
                    } else {
                        dispatch(drawNewCity({ name: newCity.name }))
                        dispatch(loadingError(newCity.name));
                    }
                    dispatch(findNewCity(newCity.name, false));
                } else {
                    alert('Can\'t get the weather in : ' + newCity.name);
                }
            } else {
                const errTrue = await Service.addToFav(city.name);
                if (!!errTrue) {
                    alert('Status code: ' + errTrue.status + '\nMessage: ' + errTrue.data);
                } else {
                    dispatch(drawNewCity({ name: city.name }))
                    dispatch(updateCity(city));
                }
                dispatch(findNewCity(newCity.name, false));
            }
        } else { alert('Wrong city name format'); }
    }
}

export function drawNewCity(city) {
    return ({ type: types.ADD_FAV, payload: { city } })
}

export function findNewCity(name, isLoading) {
    return ({
        type: types.ADD_FAV_LOADING,
        payload: {
            name,
            isLoading
        }
    });
}

export function updateCity(city) {
    return ({ type: types.UPDATE_FAV, payload: { city } });
}

export function removal(name) {
    return async (dispatch) => {
        const errTrue = await Service.deleteFromFav(name);
        if (!errTrue) {
            dispatch(removeCity(name));
        } else {
            alert('Status code: ' + errTrue.status + '\nMessage: ' + errTrue.data);
            return;
        }
    }
}

export function removeCity(name){
    return ({ type: types.REMOVE_FAV, payload: { name } });
}

export function loadingError(name) {
    return ({ type: types.LOAD_ERROR, payload: { name } })
}