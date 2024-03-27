import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudSun, faCloudRain, faSun, faCloud, faSnowflake } from '@fortawesome/free-solid-svg-icons';
import '../weatherapp.css';
import { Container, Button, Card } from 'react-bootstrap';

function WeatherApp() {
    const [country, setCountry] = useState(null);
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState('');
    const [countriesOptions, setCountriesOptions] = useState([]);
    const [dateTime, setDateTime] = useState(new Date());

    const API_KEY = '03c3df4d3139d6c3fd7bbf7afc67fc66';

    useEffect(() => {
        axios
            .get('https://restcountries.com/v3.1/all')
            .then((response) => {
                const countries = response.data.map((country) => ({
                    value: country.cca2,
                    label: country.name.common,
                }));
                const sortedCountries = countries.sort((a, b) => a.label.localeCompare(b.label));
                setCountriesOptions(sortedCountries);
            })
            .catch((error) => {
                console.error('Error fetching countries:', error);
            });
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setDateTime(new Date());
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!country) {
            setError('Please select a country.');
            return;
        }
        await fetchWeatherData();
    };

    const fetchWeatherData = async () => {
        try {
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${country.label}&appid=${API_KEY}&units=metric`
            );
            setWeather(response.data);
            setError('');
        } catch (error) {
            console.error('Error fetching weather data:', error);
            setError('City not found. Please enter a valid city name.');
        }
    };

    const getWeatherIcon = () => {
        if (!weather || !weather.weather || weather.weather.length === 0) return null;
        const weatherCode = weather.weather[0].id;
        if (weatherCode >= 200 && weatherCode < 300) return faCloudRain; // Thunderstorm
        if (weatherCode >= 300 && weatherCode < 400) return faCloudRain; // Drizzle
        if (weatherCode >= 500 && weatherCode < 600) return faCloudRain; // Rain
        if (weatherCode >= 600 && weatherCode < 700) return faSnowflake; // Snow
        if (weatherCode >= 700 && weatherCode < 800) return faCloud; // Atmosphere
        if (weatherCode === 800) return faSun; // Clear
        if (weatherCode > 800) return faCloudSun; // Clouds
        return null;
    };

    useEffect(() => {
        const getTimeForCountry = async () => {
            if (!country) return '';

            try {
                const response = await axios.get(`https://worldtimeapi.org/api/timezone/${country.label}`);
                const countryTime = new Date(response.data.datetime);
                return countryTime.toLocaleTimeString();
            } catch (error) {
                console.error('Error fetching time for country:', error);
                return '';
            }
        };

        const updateTime = async () => {
            const countryTime = await getTimeForCountry();
            setDateTime(new Date(countryTime));
        };
        updateTime();
    }, [country]); // Update time when country changes

    return (
        <div className={`weather-app ${weather && getWeatherIcon() ? weather.weather[0].main.toLowerCase() : ''}`}>
            <Container>
                <h1 className="mb-4">Weather App</h1>
                <div className="time-date">
                    <p className="current-date">{dateTime.toDateString()}</p>
                    <p className="current-time">{dateTime.toLocaleTimeString()}</p>
                </div>
                <div className="form-row">
                    <Select
                        className="form-control country-selector"
                        options={countriesOptions}
                        value={country}
                        onChange={setCountry}
                        placeholder="Select a country..."
                    />
                    <Button variant="primary" type="submit" onClick={handleSubmit}>
                        Get Weather
                    </Button>

                </div>

                {error && <p className="text-danger mt-2">{error}</p>}
                {weather && (
                    <Card className="mt-4">
                        <Card.Body>
                            <div className="weather-info">
                                <div className='m-3 temperature'>{country ? country.label : ''}</div>
                                <FontAwesomeIcon className='m-3 temperature' icon={getWeatherIcon()} size="3x" />
                                <div className="temperature">{Math.round(weather.main.temp)}°C</div>
                                <div className="temperature">{weather.weather[0].description}</div>
                            </div>
                        </Card.Body>
                    </Card>
                )}
            </Container>
        </div>
    );
}

export default WeatherApp;
