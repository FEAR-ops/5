const fs = require('fs').promises;
const readline = require('readline');
const https = require('https');

async function loadConfig(filename) { /* ... */ }
async function getDataFromApi(city, apiKey) { /* ... */ }

async function saveToFile(data, filename) {
    try {
        await fs.writeFile(filename, JSON.stringify(data, null, 2));
        console.log(`Дані успішно збережено у файл ${filename}`);
    } catch (error) {
        console.error('Помилка при збереженні даних:', error.message);
    }
}

function getUserInput(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
    }));
}

async function main() {
    try {
        const config = await loadConfig('config.json');
        console.log('Конфігурацію успішно завантажено');

        const city = await getUserInput('Введіть назву міста для отримання погоди: ');
        console.log('Виконується запит до API...');

        const weatherData = await getDataFromApi(city, config.api_key);

        console.log('\nПогода у місті', weatherData.name);
        console.log('Температура:', weatherData.main.temp, '°C');
        console.log('Відчувається як:', weatherData.main.feels_like, '°C');
        console.log('Опис:', weatherData.weather[0].description);
        console.log('Вологість:', weatherData.main.humidity, '%');
        console.log('Швидкість вітру:', weatherData.wind.speed, 'м/с');

        await saveToFile(weatherData, 'output.json');
    } catch (error) {
        console.error('Помилка у виконанні програми:', error.message);
    }
}

main();