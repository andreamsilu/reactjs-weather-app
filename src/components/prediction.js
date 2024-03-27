import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_KEY from './weather-app';

import { Card, Row, Col } from 'react-bootstrap';

function WeatherPredictionCard({ country }) {
    const [predictions, setPredictions] = useState([]);

    useEffect(() => {
        const fetchWeatherPredictions = async () => {
            try {
                // Fetch weather predictions for the next 24 hours based on the selected country
                const response = await axios.get(
                    `http://api.openweathermap.org/data/2.5/forecast?q=${country.label}&appid=${API_KEY}&units=metric`
                );
                const next24Hours = response.data.list.slice(0, 8); // API provides data for every 3 hours, so we take the next 8 entries for 24 hours
                setPredictions(next24Hours);
            } catch (error) {
                console.error('Error fetching weather predictions:', error);
            }
        };

        fetchWeatherPredictions();

        // Clean up function
        return () => {
            setPredictions([]);
        };
    }, [country]);

    return (
        <Card className="mt-4">
            <Card.Body>
                <Card.Title><h2>Weather Prediction for the next 24 hours ({country.label})</h2></Card.Title>
                <Row>
                    {predictions.map((prediction, index) => (
                        <Col key={index} xs={12} sm={6} md={3}>
                            <div className="prediction-item">
                                <p>{new Date(prediction.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                <p>Temperature: {prediction.main.temp}°C</p>
                                <p>Description: {prediction.weather[0].description}</p>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Card.Body>
        </Card>
    );
}

export default  WeatherPredictionCard;
