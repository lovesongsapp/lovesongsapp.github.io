// filepath: g:\www\love\js\app.js

const videoIframe = document.getElementById('video-iframe');
const playButton = document.getElementById('play-button');
const pauseButton = document.getElementById('pause-button');
const progressBar = document.getElementById('progress-bar');
const playlistItems = document.querySelectorAll('.playlist-item');

let currentVideoIndex = 0;

function loadVideo(index) {
    const playlist = 'PLX_YaKXOr1s6u6O3srDxVJn720Zi2RRC5';
    const videoId = getVideoIdFromPlaylist(playlist, index);
    videoIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0`;
}

function getVideoIdFromPlaylist(playlist, index) {
    // Placeholder function to get video ID from the playlist
    // In a real implementation, you would fetch the playlist data from the YouTube API
    const videoIds = [
        'videoId1', // Replace with actual video IDs
        'videoId2',
        'videoId3',
        'videoId4',
        'videoId5'
    ];
    return videoIds[index];
}

playButton.addEventListener('click', () => {
    loadVideo(currentVideoIndex);
});

pauseButton.addEventListener('click', () => {
    videoIframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
});

playlistItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        currentVideoIndex = index;
        loadVideo(currentVideoIndex);
    });
});

// Update progress bar based on video playback
setInterval(() => {
    // Placeholder for updating the progress bar
    // In a real implementation, you would get the current time from the YouTube API
    const currentTime = 0; // Replace with actual current time
    const duration = 100; // Replace with actual duration
    progressBar.value = (currentTime / duration) * 100;
}, 1000);