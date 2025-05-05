const https = require('https');

async function getDataFromApi(city, apiKey) {
    return new Promise((resolve, reject) => {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=uk`;
        
        https.get(url, (res) => {
            let data = '';

            if (res.statusCode !== 200) {
                reject(new Error(`Помилка API. Код статусу: ${res.statusCode}`));
                return;
            }

            res.on('data', chunk => data += chunk);

            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    resolve(parsedData);
                } catch (error) {
                    reject(new Error('Помилка парсингу JSON-відповіді'));
                }
            });
        }).on('error', (error) => {
            reject(new Error(`Помилка запиту: ${error.message}`));
        });
    });
}