let player;
    let maxQuality = 'large'; // Definir resolução máxima
    let minQuality = 'medium'; // Definir resolução mínima
    let isPlaying = false;
    let isShuffle = false;
    let mode = 'repeat'; // 'repeat', 'repeat_one', 'shuffle'
    let progressBar, currentTimeDisplay, durationDisplay;
    let playlistData = [];
    let filteredPlaylist = [];

    document.addEventListener('DOMContentLoaded', function() {
        progressBar = document.getElementById('progress');
        currentTimeDisplay = document.getElementById('current-time');
        durationDisplay = document.getElementById('duration');

        // Verifique se todos os elementos DOM necessários estão presentes
        if (progressBar && currentTimeDisplay && durationDisplay) {
            onYouTubeIframeAPIReady();
        } else {
            console.error('Um ou mais elementos DOM não foram encontrados.');
        }
    });

    function onYouTubeIframeAPIReady() {
        player = new YT.Player('music-player', {
            height: '100%',
            width: '100%',
            videoId: 'xiN4EOqpvwc',
            playerVars: {
                listType: 'playlist',
                list: 'PLX_YaKXOr1s6u6O3srDxVJn720Zi2RRC5',
                autoplay: 0,
                controls: 0
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }

    function onPlayerReady(event) {
        setVideoQuality(minQuality); // Define a qualidade inicial para 'medium'
        document.querySelector('.control-button:nth-child(3)').addEventListener('click', function() {
            if (isPlaying) {
                player.pauseVideo();
                this.innerHTML = '<ion-icon name="play-outline" class="play-outline"></ion-icon>';
            } else {
                player.playVideo();
                this.innerHTML = '<ion-icon name="pause-outline" class="pause-outline"></ion-icon>';
            }
            isPlaying = !isPlaying;
        });

        document.querySelector('.control-button:nth-child(2)').addEventListener('click', function() {
            player.previousVideo();
        });

        document.querySelector('.control-button:nth-child(4)').addEventListener('click', function() {
            player.nextVideo();
        });

        document.querySelector('.control-button:nth-child(1)').addEventListener('click', function() {
            switch (mode) {
                case 'repeat':
                    mode = 'repeat_one';
                    this.innerHTML = '<ion-icon name="repeat-outline"></ion-icon><span class="repeat-number">1</span>';
                    break;
                case 'repeat_one':
                   mode = 'shuffle';
                    this.innerHTML = '<ion-icon name="shuffle-outline"></ion-icon>';
                    break;
                case 'shuffle':
                    mode = 'repeat';
                    this.innerHTML = '<ion-icon name="repeat-outline"></ion-icon>';
                    break;
            }
        });

        document.querySelector('.control-button:nth-child(5)').addEventListener('click', function() {
            document.getElementById('playlist-overlay').style.display = 'block';
            playlistData = [];
            filteredPlaylist = [];
            getPlaylistData();
        });

        progressBar.addEventListener('input', function() {
            player.seekTo(progressBar.value, true);
        });

        player.addEventListener('onStateChange', function(event) {
            if (event.data === YT.PlayerState.ENDED) {
                switch (mode) {
                    case 'repeat':
                        player.playVideo();
                        break;
                    case 'repeat_one':
                        player.playVideoAt(player.getPlaylistIndex());
                        break;
                    case 'shuffle':
                        const randomIndex = Math.floor(Math.random() * player.getPlaylist().length);
                        player.playVideoAt(randomIndex);
                        break;
                }
            }
        });

        player.addEventListener('onReady', function() {
            const videoDuration = player.getDuration();
            durationDisplay.textContent = formatTime(videoDuration);
        });

        player.addEventListener('onStateChange', function(event) {
            if (event.data === YT.PlayerState.PLAYING) {
                isPlaying = true;
                document.querySelector('.control-button:nth-child(3)').innerHTML = '<ion-icon name="pause-outline" class="pause-outline"></ion-icon>';
            } else if (event.data === YT.PlayerState.PAUSED) {
                isPlaying = false;
                document.querySelector('.control-button:nth-child(3)').innerHTML = '<ion-icon name="play-outline" class="play-outline"></ion-icon>';
            }
        });

        player.addEventListener('onStateChange', function(event) {
            if (event.data === YT.PlayerState.BUFFERING) {
                progressBar.value = 0;
            }
        });

        player.addEventListener('onProgress', function() {
            const currentTime = player.getCurrentTime();
            progressBar.value = (currentTime / durationDisplay.textContent) * 100;
            currentTimeDisplay.textContent = formatTime(currentTime);
        });
    }

    function onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.BUFFERING) {
            progressBar.value = 0;
        }
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secondsLeft = Math.floor(seconds % 60);
        return `${minutes}:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;
    }

    function setVideoQuality(quality) {
        player.setPlaybackQuality(quality);
    }

    function getPlaylistData() {
        const playlist = player.getPlaylist();
        const playlistItems = document.querySelectorAll('#playlist-items li');

        playlistItems.forEach(function(item) {
            item.remove();
        });

        playlist.forEach(function(videoId, index) {
            const videoInfo = getVideoInfo(videoId);
            videoInfo.then(function(videoInfo) {
                const li = document.createElement('li');
                li.dataset.videoId = videoId;
                li.innerHTML = `
                    <img src="${videoInfo.thumbnailUrl}" alt="${videoInfo.title}">
                    <div class="info">
                        <p class="title">${videoInfo.title}</p>
                        <p class="author">${videoInfo.author}</p>
                    </div>
                `;
                li.addEventListener('click', function(){
                    player.playVideoAt(index);
                    document.getElementById('playlist-overlay').style.display = 'none';
                });
                document.getElementById('playlist-items').appendChild(li);
                playlistData.push({
                    videoId: videoId,
                    title: videoInfo.title,
                    author: videoInfo.author
                });
                filteredPlaylist = playlistData;
                renderPlaylist(filteredPlaylist);
            });
        });
    }

    function getVideoInfo(videoId) {
        return fetch(`https://www.googleapis.com/youtube/v3/videos?part=id,snippet&id=${videoId}&key=YOUR_API_KEY`)
           .then(response => response.json())
           .then(data => {
                const videoInfo = data.items[0].snippet;
                return {
                    title: videoInfo.title,
                    author: videoInfo.channelTitle,
                    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/default.jpg`
                };
            });
    }

    document.getElementById('search-input').addEventListener('keyup', function(event) {
        const searchText = event.target.value.toLowerCase();
        filteredPlaylist = filterPlaylist(searchText, playlistData);
        renderPlaylist(filteredPlaylist);
    });

    function filterPlaylist(searchText, playlist) {
        return playlist.filter(video => {
            const title = video.title.toLowerCase();
            const author = video.author.toLowerCase();
            return title.includes(searchText) || author.includes(searchText);
        });
    }

    function renderPlaylist(playlist) {
        const playlistContainer = document.getElementById('playlist-items');
        playlistContainer.innerHTML = '';

        playlist.forEach((video, index) => {
            const listItem = document.createElement('li');

            const thumbnail = document.createElement('img');
            thumbnail.src = `https://img.youtube.com/vi/${video.videoId}/default.jpg`;
            listItem.appendChild(thumbnail);

            const textContainer = document.createElement('div');
            textContainer.className = 'text-container';

            const titleText = document.createElement('span');
            titleText.className = 'title';
            titleText.textContent = video.title;
            textContainer.appendChild(titleText);

            const authorText = document.createElement('span');
            authorText.className = 'author';
            authorText.textContent = video.author;
            textContainer.appendChild(authorText);

            listItem.appendChild(textContainer);

            listItem.addEventListener('click', () => {
                player.playVideoAt(index);
                document.getElementById('playlist-overlay').style.display = 'none';
            });

            playlistContainer.appendChild(listItem);
        });
    }
