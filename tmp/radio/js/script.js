class RadioPlayer {
  constructor() {
    this.elements = {
      cover: document.getElementById('cover'),
      title: document.getElementById('title'),
      artist: document.getElementById('artist'),
      player: document.querySelector('.player'),
      noCover: document.querySelector('.no-cover')
    };
    
    this.state = {
      lastSongId: null,
      isLoading: false,
      retryCount: 0,
      maxRetries: 3
    };

    // Endpoint GraphQL Talpa
    this.GRAPHQL_URL = 'https://graph.talparad.io/';
    this.API_KEY = 'da2-abza7qpnqbfe5ihpk4jhcslpgy';
    this.stationSlug = 'radio-10-love-songs';
    this.profile = 'radio-brand-web';

    // Adiciona elementos de controle
    this.audioPlayer = document.getElementById('audio-player');
    this.playButton = document.getElementById('playButton');
    
    this.lyricsOriginal = '';
    this.lyricsTranslation = '';
    this.artistInfo = {};

    this.setupAudioControls();
    this.setupLyricsModalHandlers();
    this.setupArtistModalHandler();
  }

  setupAudioControls() {
    this.playButton.addEventListener('click', () => this.togglePlay());
    
    // Atualiza ícone quando o estado do áudio muda
    this.audioPlayer.addEventListener('play', () => {
      this.playButton.querySelector('.material-icons').textContent = 'pause';
    });
    
    this.audioPlayer.addEventListener('pause', () => {
      this.playButton.querySelector('.material-icons').textContent = 'play_arrow';
    });
  }

  togglePlay() {
    if (this.audioPlayer.paused) {
      this.audioPlayer.play();
    } else {
      this.audioPlayer.pause();
    }
  }

  async fetchWithTimeout(url, timeout = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: this.headers,
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-cache'
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Requisição excedeu o tempo limite');
      }
      // Não tenta mais JSONP, apenas lança o erro para ser tratado no getCurrentSong
      throw error;
    }
  }

  setupLyricsModalHandlers() {
    // Letra original
    const lyricsOriginalBtn = document.getElementById('lyricsOriginalBtn');
    if (lyricsOriginalBtn) {
      lyricsOriginalBtn.addEventListener('click', () => {
        window.modalManager.open('lyrics-original.html').then(() => {
          const el = document.getElementById('lyrics-original-content');
          if (el) {
            el.innerHTML = this.lyricsOriginal || '<p>Letra não disponível.</p>';
          }
        });
      });
    }
    // Letra traduzida
    const lyricsTranslationBtn = document.getElementById('lyricsTranslationBtn');
    if (lyricsTranslationBtn) {
      lyricsTranslationBtn.addEventListener('click', () => {
        window.modalManager.open('lyrics-translation.html').then(() => {
          const el = document.getElementById('lyrics-translation-content');
          if (el) {
            el.innerHTML = this.lyricsTranslation || '<p>Tradução não disponível.</p>';
          }
        });
      });
    }
  }

  setupArtistModalHandler() {
    // Corrigido para selecionar o botão correto
    const artistBtn = document.querySelector('.icon-button[aria-label="Artista"]');
    if (artistBtn) {
      artistBtn.addEventListener('click', () => {
        window.modalManager.open('artist-info.html').then(() => {
          const el = document.getElementById('artist-modal-content');
          if (el) {
            el.innerHTML = `
              <h3>${this.artistInfo.name || 'Artista indisponível'}</h3>
              ${this.artistInfo.album ? `<p><strong>Álbum:</strong> ${this.artistInfo.album}</p>` : ''}
              ${this.artistInfo.year ? `<p><strong>Ano:</strong> ${this.artistInfo.year}</p>` : ''}
              ${this.artistInfo.bio ? `<div class="artist-bio">${this.artistInfo.bio}</div>` : '<p>Biografia não disponível.</p>'}
            `;
          }
        });
      });
    }
  }

  validateSongData(response) {
    try {
      console.log('Dados brutos recebidos:', response);
      
      // Verifica se temos os dados necessários
      if (!response?.data) {
        throw new Error('Dados inválidos da API');
      }

      const data = response.data;
      // Salva as letras para uso nos modais
      this.lyricsOriginal = data.lyrics || '';
      this.lyricsTranslation = data.lyricsTranslation || '';
      this.artistInfo = {
        name: data.artist || '',
        album: data.album || '',
        year: data.year || '',
        bio: data.artistShortBio || ''
      };
      
      return {
        id: Date.now(), // Usa timestamp como ID para forçar atualização
        title: data.song || 'Título indisponível',
        artist: data.artist || 'Artista indisponível',
        cover: data.cover || null,
        album: data.album || '',
        year: data.year || ''
      };
    } catch (error) {
      console.error('Erro ao validar dados:', error);
      return null;
    }
  }

  async updateUI(songData, animate = true) {
    if (!songData) return;

    try {
      // Atualiza texto primeiro
      this.elements.title.textContent = songData.title;
      this.elements.artist.textContent = songData.artist;

      // Tratamento específico para a capa
      if (songData.cover) {
        // Tenta carregar a imagem com proxy se necessário
        const tryLoadImage = async (url) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = () => reject();
            img.src = url;
          });
        };

        try {
          // Tenta carregar diretamente
          const directUrl = songData.cover;
          const proxyUrl = `https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&url=${encodeURIComponent(songData.cover)}`;
          
          let finalUrl;
          try {
            finalUrl = await tryLoadImage(directUrl);
          } catch {
            try {
              finalUrl = await tryLoadImage(proxyUrl);
            } catch {
              throw new Error('Falha ao carregar imagem');
            }
          }

          // Atualiza a imagem com fade
          this.elements.cover.style.opacity = '0';
          this.elements.noCover.style.display = 'none';
          this.elements.cover.style.display = 'block';
          
          // Força o reflow para garantir a transição
          void this.elements.cover.offsetWidth;
          
          this.elements.cover.src = finalUrl;
          this.elements.cover.style.opacity = '1';
          
          console.log('Capa atualizada com sucesso:', finalUrl);
        } catch (imgError) {
          console.error('Erro ao carregar capa:', imgError);
          this.elements.cover.style.display = 'none';
          this.elements.noCover.style.display = 'flex';
        }
      } else {
        this.elements.cover.style.display = 'none';
        this.elements.noCover.style.display = 'flex';
      }
    } catch (error) {
      console.error('Erro ao atualizar UI:', error);
    }
  }

  
  async fetchLyrics(artist, title) {
    // Busca letra original na API lyrics.ovh
    try {
      const resp = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
      if (!resp.ok) return '';
      const data = await resp.json();
      return data.lyrics || '';
    } catch {
      return '';
    }
  }

 async fetchTranslation(lyrics, targetLang = 'pt') {
    // Usa a API de tradução do LibreTranslate (gratuita, mas limitada)
    try {
      const resp = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: lyrics,
          source: 'en',
          target: targetLang,
          format: 'text'
        })
      });
      if (!resp.ok) return '';
      const data = await resp.json();
      return data.translatedText || '';
    } catch {
      return '';
    }
  }

  async updateLyricsAndTranslation(artist, title) {
    // Busca letra original
    this.lyricsOriginal = await this.fetchLyrics(artist, title);
    // Busca tradução se houver letra original
    if (this.lyricsOriginal) {
      this.lyricsTranslation = await this.fetchTranslation(this.lyricsOriginal, 'pt');
    } else {
      this.lyricsTranslation = '';
    }
  }

  async getCurrentSong() {
    if (this.state.isLoading) return;

    try {
      this.state.isLoading = true;
      this.elements.player.classList.add('loading');

      // Monta a query GraphQL
      const query = `
        query CurrentTrackQuery($stationSlug: String!, $profile: String!) {
          station(slug: $stationSlug) {
            playouts(profile: $profile) {
              track {
                id
                title
                artistName
                images {
                  uri
                  imageType
                  title
                }
              }
            }
          }
        }
      `;
      const variables = {
        stationSlug: this.stationSlug,
        profile: this.profile
      };

      let data;
      try {
        const resp = await fetch(this.GRAPHQL_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.API_KEY
          },
          body: JSON.stringify({ query, variables }),
        });
        data = await resp.json();
      } catch (proxyError) {
        console.warn('Não foi possível atualizar a música. Verifique sua conexão ou tente novamente mais tarde.');
        this.state.isLoading = false;
        this.elements.player.classList.remove('loading');
        return;
      }

      // Adapta os dados recebidos para o formato esperado pela UI
      let track = null;
      if (
        data &&
        data.data &&
        data.data.station &&
        data.data.station.playouts &&
        data.data.station.playouts.length > 0 &&
        data.data.station.playouts[0].track
      ) {
        track = data.data.station.playouts[0].track;
      }

      if (track) {
        // Busca a imagem de capa (preferencialmente tipo 'cover')
        let cover = null;
        if (track.images && Array.isArray(track.images)) {
          const coverImg = track.images.find(img => img.imageType === 'cover') || track.images[0];
          if (coverImg) cover = coverImg.uri;
        }

        const songData = {
          id: track.id || Date.now(),
          title: track.title || 'Título indisponível',
          artist: track.artistName || 'Artista indisponível',
          cover: cover,
          album: '', // Não fornecido
          year: ''   // Não fornecido
        };
        // Busca letras e tradução
        await this.updateLyricsAndTranslation(songData.artist, songData.title);

        this.artistInfo = {
          name: songData.artist,
          album: songData.album,
          year: songData.year,
          bio: ''
        };
        await this.updateUI(songData);
        this.state.retryCount = 0;
      }

    } catch (error) {
      if (error.name !== 'TypeError') {
        console.error('Erro detalhado:', error);
      }
      this.state.retryCount++;
      if (this.state.retryCount <= this.state.maxRetries) {
        setTimeout(() => this.getCurrentSong(), 5000);
      }
    } finally {
      this.state.isLoading = false;
      this.elements.player.classList.remove('loading');
    }
  }

  start() {
    console.log('Iniciando RadioPlayer...');
    this.getCurrentSong();
    // Reduzindo o intervalo para 10 segundos para atualização mais frequente
    setInterval(() => this.getCurrentSong(), 10000);
  }
}

// Inicialização com tratamento de erros
document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('DOM carregado, iniciando player...');
    const player = new RadioPlayer();
    player.start();
  } catch (error) {
    console.error('Erro ao inicializar o player:', error);
  }
});