import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, Button, Card } from 'react-bootstrap';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudSun, faCloudRain, faSun, faCloud, faSnowflake } from '@fortawesome/free-solid-svg-icons';
import '../weatherapp.css';

function WeatherApp() {
    const [country, setCountry] = useState({ value: 'TZ', label: 'Tanzania' });
    const [city, setCity] = useState('United Republic of Tanzania');
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState('');
    const [countriesOptions, setCountriesOptions] = useState([]);
    const [citiesOptions, setCitiesOptions] = useState([]);
    const [dateTime, setDateTime] = useState(new Date());

    const API_KEY = '03c3df4d3139d6c3fd7bbf7afc67fc66';

    useEffect(() => {
        // Fetch countries from REST Countries API
        axios
            .get('https://restcountries.com/v3.1/all')
            .then((response) => {
                const countries = response.data.map((country) => ({
                    value: country.cca2,
                    label: country.name.common,
                }));
                // Sort countries alphabetically
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

    const fetchCities = async () => {
        if (!country) return;

        try {
            // Fetch cities based on selected country
            const response = await axios.get(
                `http://api.openweathermap.org/data/2.5/find?q=${country.label}&appid=${API_KEY}`
            );
            const cities = response.data.list.map((city) => ({
                value: city.name,
                label: city.name,
            }));
            setCitiesOptions(cities);
        } catch (error) {
            console.error('Error fetching cities:', error);
        }
    };

    const fetchWeatherData = async () => {
        try {
            // Fetch weather data based on selected city and country
            const response = await axios.get(
                `http://api.openweathermap.org/data/2.5/weather?q=${city},${country.label}&appid=${API_KEY}&units=metric`
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

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchWeatherData();
    };

    const getTimeForCountry = async () => {
        if (!country) return;

        try {
            // Fetch timezone based on selected country
            const response = await axios.get(`http://worldtimeapi.org/api/timezone/${country.label}`);
            const countryTime = new Date(response.data.datetime);
            return countryTime.toLocaleTimeString();
        } catch (error) {
            console.error('Error fetching time for country:', error);
            return '';
        }
    };

    return (
        <div className={`weather-app ${weather && getWeatherIcon() ? weather.weather[0].main.toLowerCase() : ''}`}>
            <Container>
                <h1 className="mb-4">Reactjs Weather App</h1>
                <div className="time-date">
                    <p className="current-date">{dateTime.toDateString()}</p>
                    <p className="current-time">{dateTime
                        .toLocaleTimeString()}</p>
                </div>
                <Form onSubmit={handleSubmit}>
                    <Select
                        className=" form-control"
                        options={countriesOptions}
                        placeholder="Select Country"
                        onChange={async (selectedOption) => {
                            setCountry(selectedOption);
                            setCitiesOptions([]);
                            const countryTime = await getTimeForCountry(selectedOption.value);
                            setDateTime(new Date(countryTime));
                        }}
                        onBlur={fetchCities}
                    />
                    <Select
                        className=" form-control"
                        options={citiesOptions}
                        placeholder="Select City"
                        isDisabled={!country}
                        onChange={(selectedOption) => setCity(selectedOption.value)}
                    />
                    <Button variant="primary" type="submit">
                        Get Weather
                    </Button>
                </Form>
                {error && <p className="text-danger mt-2">{error}</p>}
                {weather && (
                    <Card className="mt-4">
                        <Card.Body>
                            <div className="weather-info">
                                <div className='m-3 temperature'>{country.label}</div>
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
