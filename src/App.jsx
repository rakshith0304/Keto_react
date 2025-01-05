import React, { useState } from 'react';
import Chart from 'chart.js/auto';
import './index.css';

const KetoFriendlyChecker = () => {
  const [foodItem, setFoodItem] = useState('');
  const [result, setResult] = useState('');
  const [chart, setChart] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    checkKetoFriendly(foodItem);
  };

  const checkKetoFriendly = async (foodItem) => {
    const apiKey = 'WTllHby2scTh1v4LyXUZb1WfmEYs31jbWZCFkamO';
    const apiUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(
      foodItem
    )}&api_key=${apiKey}`;

    try {
      console.log('Fetching data from API...');
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Data received:', data);

      if (data.foods.length === 0) {
        setResult('No results found.');
        if (chart) chart.destroy();
        return;
      }

      const food = data.foods[0];
      const servingSize = food.servingSize || 100; // Assuming 100 grams if not provided
      const servingSizeUnit = food.servingSizeUnit || 'g';

      const carbs = food.foodNutrients.find(
        (nutrient) => nutrient.nutrientName === 'Carbohydrate, by difference'
      );
      const fats = food.foodNutrients.find(
        (nutrient) => nutrient.nutrientName === 'Total lipid (fat)'
      );
      const protein = food.foodNutrients.find(
        (nutrient) => nutrient.nutrientName === 'Protein'
      );
      const fiber = food.foodNutrients.find(
        (nutrient) => nutrient.nutrientName === 'Fiber, total dietary'
      );

      let carbvalue = (carbs.value / servingSize) * 100;
      console.log(carbs, carbvalue);

      if (carbs && carbvalue <= 5) {
        setResult(`${food.description} is Strictly keto-friendly!`);
      } else if (carbs && carbvalue <= 10) {
        setResult(`${food.description} is Flexibly keto-friendly!`);
      } else {
        setResult(`${food.description} is not keto-friendly.`);
      }

      const ctx = document.getElementById('nutritionChart').getContext('2d');

      if (chart) {
        chart.destroy();
      }

      const newChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Carbohydrates', 'Fats', 'Protein', 'Fiber'],
          datasets: [
            {
              label: 'Nutritional Information (grams)',
              data: [
                carbs ? carbs.value : 0,
                fats ? fats.value : 0,
                protein ? protein.value : 0,
                fiber ? fiber.value : 0,
              ],
              backgroundColor: [
                'rgba(75, 192, 192, 0.2)',
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
              ],
              borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
          plugins: {
            title: {
              display: true,
              text: `Nutritional Information for Serving Size: ${servingSize} ${servingSizeUnit}`,
            },
          },
        },
      });

      setChart(newChart);
    } catch (error) {
      console.error('An error occurred:', error);
      setResult('An error occurred. Please try again.');
      if (chart) chart.destroy();
    }
  };

  return (
    <div className="container">
      <h1>Keto-Friendly Checker</h1>
      <form id="foodForm" onSubmit={handleSubmit}>
        <input
          type="text"
          id="foodInput"
          placeholder="Enter food or grocery item"
          value={foodItem}
          onChange={(e) => setFoodItem(e.target.value)}
          required
        />
        <button type="submit">Check</button>
      </form>
      <div id="result">{result}</div>
      <canvas id="nutritionChart" width="400" height="400"></canvas>
    </div>
  );
};

export default KetoFriendlyChecker;
