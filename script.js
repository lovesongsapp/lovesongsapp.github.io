let player;
const settings = {
    maxQuality: 'medium',
    minQuality: 'low',
    themeColors: { dark: '#13051f', light: '#f0f4f9' },
    playlistId: 'PLX_YaKXOr1s6u6O3srDxVJn720Zi2RRC5',
    initialVideoId: 'eT5_neXR3FI'
};
let isPlaying = false;
let mode = 'repeat'; // 'repeat', 'repeat_one', 'shuffle'
let playlistData = [];

// DOM Elements
let progressBar, currentTimeDisplay, durationDisplay;

// Helper: Format time (mm:ss)
const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};

// Helper: Fetch video details
const fetchVideoDetails = async (videoId) => {
    try {
        const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching video details:', error);
        return null;
    }
};

// Fetch playlist data
const fetchPlaylistData = async () => {
    const playlist = player.getPlaylist();
    playlistData = await Promise.all(
        playlist.map(async (videoId, index) => {
            const videoDetails = await fetchVideoDetails(videoId);
            return {
                videoId,
                index,
                title: videoDetails?.title || 'Unknown Title',
                author: videoDetails?.author_name || 'Unknown Author'
            };
        })
    );
    renderPlaylist(playlistData);
};

// Render playlist
const renderPlaylist = (videos) => {
    const playlistContainer = document.getElementById('playlist-items');
    playlistContainer.innerHTML = '';

    videos.forEach((video) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <img src="https://img.youtube.com/vi/${video.videoId}/default.jpg" alt="${video.title}">
            <div class="text-container">
                <span class="title">${video.title}</span>
                <span class="author">${video.author}</span>
            </div>
        `;
        listItem.addEventListener('click', () => {
            player.playVideoAt(video.index);
            document.getElementById('playlist-overlay').style.display = 'none';
        });
        playlistContainer.appendChild(listItem);
    });
};

// Update progress bar and time displays
const updateProgressBar = () => {
    if (player && player.getCurrentTime) {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        if (duration > 0) {
            progressBar.value = (currentTime / duration) * 100;
            currentTimeDisplay.textContent = formatTime(currentTime);
            durationDisplay.textContent = formatTime(duration);
        }
    }
};

// Set video quality
const setVideoQuality = (quality) => player.setPlaybackQuality(quality);

// Initialize YouTube Player
function onYouTubeIframeAPIReady() {
    const videoId = new URLSearchParams(window.location.search).get('videoId') || settings.initialVideoId;

    player = new YT.Player('music-player', {
        height: '100%',
        width: '100%',
        videoId,
        playerVars: {
            listType: 'playlist',
            list: settings.playlistId,
            autoplay: 0,
            controls: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0
        },
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange
        }
    });
}

// On player ready
function onPlayerReady() {
    setVideoQuality(settings.minQuality);
    initializeControls();
    fetchPlaylistData();

    setInterval(updateProgressBar, 1000);

    progressBar.addEventListener('input', () => {
        const duration = player.getDuration();
        player.seekTo((progressBar.value / 100) * duration, true);
    });
}

// Initialize control buttons
const initializeControls = () => {
    const controls = {
        playPause: document.querySelector('.control-button.play-pause'),
        previous: document.querySelector('.control-button.previous'),
        next: document.querySelector('.control-button.next'),
        modeToggle: document.querySelector('.control-button.mode'),
        playlist: document.querySelector('.control-button.playlist')
    };

    controls.playPause.addEventListener('click', () => {
        if (isPlaying) {
            player.pauseVideo();
            controls.playPause.innerHTML = '<ion-icon name="play-circle-outline"></ion-icon>';
        } else {
            player.playVideo();
            controls.playPause.innerHTML = '<ion-icon name="pause-circle-outline"></ion-icon>';
        }
        isPlaying = !isPlaying;
    });

    controls.previous.addEventListener('click', () => player.previousVideo());
    controls.next.addEventListener('click', () => player.nextVideo());

    controls.modeToggle.addEventListener('click', () => {
        switch (mode) {
            case 'repeat':
                mode = 'repeat_one';
                controls.modeToggle.innerHTML = '<ion-icon name="repeat-outline"></ion-icon><span class="repeat-number">1</span>';
                break;
            case 'repeat_one':
                mode = 'shuffle';
                controls.modeToggle.innerHTML = '<ion-icon name="shuffle-outline"></ion-icon>';
                break;
            case 'shuffle':
                mode = 'repeat';
                controls.modeToggle.innerHTML = '<ion-icon name="repeat-outline"></ion-icon>';
                break;
        }
    });

    controls.playlist.addEventListener('click', () => {
        document.getElementById('playlist-overlay').style.display = 'flex';
        renderPlaylist(playlistData);
    });

    document.getElementById('close-playlist').addEventListener('click', () => {
        document.getElementById('playlist-overlay').style.display = 'none';
    });
}

// Handle player state change
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        isPlaying = false;
        document.querySelector('.control-button.play-pause').innerHTML = '<ion-icon name="play-circle-outline"></ion-icon>';

        if (mode === 'repeat_one') {
            player.seekTo(0);
            player.playVideo();
        } else if (mode === 'shuffle') {
            const nextIndex = Math.floor(Math.random() * player.getPlaylist().length);
            player.playVideoAt(nextIndex);
        } else {
            player.nextVideo();
        }
    }
}

// Document ready
document.addEventListener('DOMContentLoaded', () => {
    progressBar = document.getElementById('progress');
    currentTimeDisplay = document.getElementById('current-time');
    durationDisplay = document.getElementById('duration');

    if (progressBar && currentTimeDisplay && durationDisplay) {
        onYouTubeIframeAPIReady();
    } else {
        console.error('Essential DOM elements missing!');
    }
});
