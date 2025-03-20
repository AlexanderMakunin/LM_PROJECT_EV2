const { app, BrowserWindow, ipcMain } = require('electron');
const puppeteer = require('puppeteer');

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        frame: false,
        fullscreen: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
});

ipcMain.on('form-submitted', async (event, { user, region }) => {
    console.log('Datos del formulario:', { user, region });

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const url = `https://www.leagueofgraphs.com/es/summoner/${region}/${user}`;

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const userInfo = await page.evaluate(() => {
        const name = document.querySelector('h2') ? document.querySelector('h2').innerText : 'Nombre no encontrado';
        const level = document.querySelector('.bannerSubtitle') ? document.querySelector('.bannerSubtitle').innerText : 'Nivel no encontrado';
        const avatarElement = document.querySelector('img[src*="summonerIcons"]');

        let avatar = avatarElement ? avatarElement.getAttribute('src') : '';
        if (avatar.startsWith('//')) {
            avatar = 'https:' + avatar;
        }

        const tableRows = document.querySelectorAll('.recentGamesTableHeader.filtersBlock + table tbody tr');
        const recentGames = [];

        tableRows.forEach(row => {
            const columns = row.querySelectorAll('td');
            if (columns.length > 0) {
                recentGames.push({
                    champion: columns[0]?.innerText?.trim() || 'Desconocido',
                    kda: columns[1]?.innerText?.trim() || 'N/A',
                    win: columns[2]?.innerText?.trim() || 'N/A'
                });
            }
        });

        return { name, level, avatar, recentGames };
    });

    console.log('User Info:', userInfo);

    mainWindow.webContents.send('user-info', userInfo);

    await browser.close();
});

