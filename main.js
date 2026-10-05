async function fetchAndRenderCards() {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}readings.json`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    const allReadings = data.flatMap(city => 
      city.readings.map(reading => ({ ...reading, city: city.city }))
    );

    const cityAverages = allReadings.reduce((acc, reading) => {
      const { city, pm25 } = reading;
      if (!acc[city]) {
        acc[city] = { total: 0, count: 0 };
      }
      acc[city].total += pm25;
      acc[city].count += 1;
      return acc;
    }, {});

    const cities = Object.entries(cityAverages).map(([city, { total, count }]) => ({
      city,
      average: (total / count).toFixed(1),
    }));

    const cardsContainer = document.getElementById('cards');
    cardsContainer.innerHTML = '';

    cities.forEach(({ city, average }) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3>${city}</h3>
        <p>PM2.5: ${average}</p>
      `;
      cardsContainer.appendChild(card);
    });

    const sortOrderSelect = document.getElementById('sort-order');
    sortOrderSelect.addEventListener('change', () => {
      let sortedCities = [...cities];

      if (sortOrderSelect.value === 'asc') {
        sortedCities = [...cities].sort((a, b) => a.city.localeCompare(b.city));
      } else if (sortOrderSelect.value === 'desc') {
        sortedCities = [...cities].sort((a, b) => b.city.localeCompare(a.city));
      } else if (sortOrderSelect.value === 'pm25-desc') {
        sortedCities = [...cities].sort((a, b) => {
          const aVal = parseFloat(a.average);
          const bVal = parseFloat(b.average);
          return bVal - aVal;
        });
      }

      cardsContainer.innerHTML = '';
      sortedCities.forEach(({ city, average }) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <h3>${city}</h3>
          <p>PM2.5: ${average}</p>
        `;
        cardsContainer.appendChild(card);
      });
    });
  } catch (error) {
    console.error('Error fetching or rendering data:', error);
  }
}

fetchAndRenderCards();