const { ipcRenderer } = require('electron');

document.getElementById('user-form').addEventListener('submit', (event) => {
    event.preventDefault();

    let user = document.getElementById('user').value;
    const region = document.getElementById('region').value;
    user = user.replace(/#([^#]*)$/, '-$1');

    const searchButton = document.querySelector('button');
    searchButton.disabled = true;

    let seconds = 0;
    const timerElement = document.getElementById('timer');
    timerElement.innerText = '0s';
    const timerInterval = setInterval(() => {
        seconds++;
        timerElement.innerText = `${seconds}s`;
    }, 1000);

    document.getElementById('searching-message').style.display = 'block';
    document.getElementById('user-info').style.display = 'none';

    ipcRenderer.send('form-submitted', { user, region });

    ipcRenderer.once('user-info', (event, userInfo) => {
        clearInterval(timerInterval);
        document.getElementById('searching-message').style.display = 'none';

        document.getElementById('user-info').style.display = 'flex';

        const avatarImg = document.getElementById('user-avatar');
        avatarImg.src = userInfo.avatar || 'default-avatar.png';
        avatarImg.style.display = 'block';
        avatarImg.classList.add('loaded');

        document.getElementById('user-name').innerText = userInfo.name;
        document.getElementById('user-level').innerText = userInfo.level;

        const recentGamesContainer = document.getElementById('recent-games');
        recentGamesContainer.innerHTML = '<h3>Últimos Juegos</h3>';

        if (userInfo.recentGames.length === 0) {
            recentGamesContainer.innerHTML += '<p>No hay datos de juegos recientes.</p>';
        } else {
            userInfo.recentGames.forEach(game => {
                const gameElement = document.createElement('p');
                gameElement.innerHTML = `<strong>Campeón:</strong> ${game.champion} | 
                                         <strong>KDA:</strong> ${game.kda} | 
                                         <strong>Resultado:</strong> ${game.win}`;
                recentGamesContainer.appendChild(gameElement);
            });
        }

        searchButton.disabled = false;
    });

    ipcRenderer.once('user-info-error', () => {
        clearInterval(timerInterval);
        document.getElementById('searching-message').style.display = 'none';
        searchButton.disabled = false;
    });

    
});
