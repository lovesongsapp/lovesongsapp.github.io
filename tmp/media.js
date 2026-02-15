
// Setup Media Session
if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Minha Playlist',
        artist: 'Artista',
        album: 'Álbum',
        artwork: [
            { src: 'path/to/artwork.jpg', sizes: '96x96', type: 'image/jpeg' },
            { src: 'path/to/artwork.jpg', sizes: '128x128', type: 'image/jpeg' },
            { src: 'path/to/artwork.jpg', sizes: '192x192', type: 'image/jpeg' },
            { src: 'path/to/artwork.jpg', sizes: '256x256', type: 'image/jpeg' },
            { src: 'path/to/artwork.jpg', sizes: '384x384', type: 'image/jpeg' },
            { src: 'path/to/artwork.jpg', sizes: '512x512', type: 'image/jpeg' },
        ]
    });

    navigator.mediaSession.setActionHandler('play', function() {
        // Code to play the audio
        document.querySelector('video').play();
    });
    navigator.mediaSession.setActionHandler('pause', function() {
        // Code to pause the audio
        document.querySelector('video').pause();
    });
    navigator.mediaSession.setActionHandler('seekbackward', function() {
        // Code to seek backward
        let video = document.querySelector('video');
        video.currentTime = Math.max(video.currentTime - 10, 0);
    });
    navigator.mediaSession.setActionHandler('seekforward', function() {
        // Code to seek forward
        let video = document.querySelector('video');
        video.currentTime = Math.min(video.currentTime + 10, video.duration);
    });
    navigator.mediaSession.setActionHandler('previoustrack', function() {
        // Code for previous track
        // Implement track switching logic here
    });
    navigator.mediaSession.setActionHandler('nexttrack', function() {
        // Code for next track
        // Implement track switching logic here
    });
}

// Show Notification
function showNotification() {
    if ('serviceWorker' in navigator && 'Notification' in window) {
        navigator.serviceWorker.ready.then(function(registration) {
            registration.showNotification('Playing Music', {
                body: 'Your music is playing in the background',
                icon: 'path/to/icon.png',
                tag: 'music-notification',
                actions: [
                    { action: 'pause', title: 'Pause' },
                    { action: 'stop', title: 'Stop' }
                ]
            });
        });
    }
}
