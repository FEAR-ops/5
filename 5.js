const fs = require('fs').promises;
const readline = require('readline');
const https = require('https');

// Функція для завантаження конфігурації
async function loadConfig(filename) {
    try {
        const data = await fs.readFile(filename, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Помилка при завантаженні конфігурації:', error.message);
        process.exit(1);
    }
}

// Функція для отримання даних з API
async function getDataFromApi(city, apiKey) {
    return new Promise((resolve, reject) => {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=uk`;
        
        https.get(url, (res) => {
            let data = '';
            
            // Перевірка коду відповіді
            if (res.statusCode !== 200) {
                reject(new Error(`Помилка API. Код статусу: ${res.statusCode}`));
                return;
            }
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
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

// Функція для збереження даних у файл
async function saveToFile(data, filename) {
    try {
        await fs.writeFile(filename, JSON.stringify(data, null, 2));
        console.log(`Дані успішно збережено у файл ${filename}`);
    } catch (error) {
        console.error('Помилка при збереженні даних:', error.message);
    }
}

// Функція для отримання введення користувача
function getUserInput(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

// Головна функція
async function main() {
    try {
        // Завантажити конфігурацію
        const config = await loadConfig('config.json');
        console.log('Конфігурацію успішно завантажено');
        
        // Запитати місто у користувача
        const city = await getUserInput('Введіть назву міста для отримання погоди: ');
        
        // Отримати дані про погоду з API
        console.log('Виконується запит до API...');
        const weatherData = await getDataFromApi(city, config.api_key);
        
        // Вивести основну інформацію про погоду
        console.log('\nПогода у місті', weatherData.name);
        console.log('Температура:', weatherData.main.temp, '°C');
        console.log('Відчувається як:', weatherData.main.feels_like, '°C');
        console.log('Опис:', weatherData.weather[0].description);
        console.log('Вологість:', weatherData.main.humidity, '%');
        console.log('Швидкість вітру:', weatherData.wind.speed, 'м/с');
        
        // Зберегти повну відповідь у файл
        await saveToFile(weatherData, 'output.json');
        
    } catch (error) {
        console.error('Помилка у виконанні програми:', error.message);
    }
}

// Запуск програми
main();