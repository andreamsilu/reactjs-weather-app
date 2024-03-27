import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import API_KEY from './weather-app';

function WeatherTrendGraph({ country }) {
    const [weatherData, setWeatherData] = useState(null); // Initialize as null

    useEffect(() => {
        const fetchWeatherData = async () => {
            try {
                const response = await axios.get(
                    `https://api.openweathermap.org/data/2.5/forecast?q=${country}&appid=${API_KEY}&units=metric`
                );
                setWeatherData(response.data.list);
            } catch (error) {
                console.error('Error fetching weather data:', error);
            }
        };

        if (country) {
            fetchWeatherData();
        }
    }, [country]);

    const generateChartData = () => {
        if (!weatherData) return { labels: [], datasets: [] }; // Null check

        const labels = [];
        const temperatures = [];

        weatherData.forEach(data => {
            labels.push(data.dt_txt);
            temperatures.push(data.main.temp);
        });

        return {
            labels: labels,
            datasets: [
                {
                    label: 'Temperature',
                    data: temperatures,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                },
            ],
        };
    };

    return (
        <div>
            <h2>Weather Trend for {country}</h2>
            <Line data={generateChartData()} />
        </div>
    );
}

export default WeatherTrendGraph;
