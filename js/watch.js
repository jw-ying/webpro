document.addEventListener('DOMContentLoaded', function() {
    const apiKey = '54e8474294e14f56475b3af052014213';

    // --- DOM Elements ---
    const playerContainer = document.getElementById('video-player-container');
    const titleEl = document.getElementById('media-title');
    const releaseDateEl = document.getElementById('media-release-date');
    const genresEl = document.getElementById('media-genres');
    const ratingEl = document.getElementById('media-rating');
    const overviewEl = document.getElementById('media-overview');
    const seasonsSection = document.getElementById('seasons-section');
    const seasonsTabs = document.getElementById('seasons-tabs');
    const episodesList = document.getElementById('episodes-list');

    // --- Get media details from URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const mediaType = urlParams.get('type'); // 'movie' or 'tv'
    const mediaId = urlParams.get('id');

    if (!mediaType || !mediaId) {
        playerContainer.innerHTML = '<p>无效的影片信息，请返回首页。</p>';
        return;
    }

    // --- Fetch and display media details ---
    async function fetchMediaDetails() {
        const url = `https://api.themoviedb.org/3/${mediaType}/${mediaId}?api_key=${apiKey}&language=zh-CN&append_to_response=credits,videos`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('获取影片信息失败');
            const data = await response.json();

            // Populate details section
            titleEl.textContent = data.title || data.name;
            releaseDateEl.textContent = `上映日期: ${data.release_date || data.first_air_date}`;
            genresEl.textContent = `类型: ${data.genres.map(g => g.name).join(', ')}`;
            ratingEl.textContent = `评分: ${data.vote_average.toFixed(1)}`;
            overviewEl.textContent = data.overview || '暂无简介。';

            // Load video player
            loadVideoPlayer(mediaType, mediaId);

            // If it's a TV show, fetch and display seasons/episodes
            if (mediaType === 'tv') {
                seasonsSection.style.display = 'block';
                displaySeasons(data.seasons);
                if (data.seasons.length > 0) {
                    fetchEpisodes(data.seasons[0].season_number); // Load first season episodes by default
                }
            }

        } catch (error) {
            console.error(error);
            playerContainer.innerHTML = `<p>${error.message}</p>`;
        }
    }

    // --- Load the video player ---
    function loadVideoPlayer(type, id, season = null, episode = null) {
        // 使用 vidsrc.me 作为视频源
        let src = '';
        if (type === 'movie') {
            src = `https://vidsrc.me/embed/${type}?tmdb=${id}`;
        } else if (type === 'tv') {
            src = `https://vidsrc.me/embed/${type}?tmdb=${id}`;
            // 如果提供了季和集，则添加到URL中
            if (season !== null && episode !== null) {
                src += `&season=${season}&episode=${episode}`;
            }
        }

        if (src) {
            playerContainer.innerHTML = `<iframe src="${src}" allowfullscreen></iframe>`;
            // playerContainer.innerHTML = `<iframe src="${src}" sandbox="allow-scripts allow-same-origin allow-fullscreen" allowfullscreen></iframe>`;
            // playerContainer.innerHTML = `<iframe src="//player.bilibili.com/player.html?isOutside=true&aid=113350730056489&bvid=BV1SyyWYKEmK&cid=26407078067&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>`;
        } else {
            playerContainer.innerHTML = `<p>无法为该类型内容加载播放器。</p>`;
        }
    }

    // --- Display season tabs for TV shows ---
    function displaySeasons(seasons) {
        seasonsTabs.innerHTML = '';
        seasons.forEach((season, index) => {
            if (season.season_number === 0) return; // Skip "Specials"
            const tab = document.createElement('button');
            tab.className = 'season-tab';
            tab.textContent = season.name;
            tab.dataset.seasonNumber = season.season_number;
            if (index === 1 || (index === 0 && season.season_number !== 0)) { // Default to first non-special season
                tab.classList.add('active');
            }
            tab.addEventListener('click', () => {
                document.querySelectorAll('.season-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                fetchEpisodes(season.season_number);
            });
            seasonsTabs.appendChild(tab);
        });
    }

    // --- Fetch and display episodes for a given season ---
    async function fetchEpisodes(seasonNumber) {
        episodesList.innerHTML = '<p>加载中...</p>';
        const url = `https://api.themoviedb.org/3/tv/${mediaId}/season/${seasonNumber}?api_key=${apiKey}&language=zh-CN`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('获取剧集信息失败');
            const data = await response.json();
            
            episodesList.innerHTML = '';
            data.episodes.forEach(episode => {
                const item = document.createElement('div');
                item.className = 'episode-item';
                item.textContent = `第 ${episode.episode_number} 集`;
                item.dataset.episodeNumber = episode.episode_number;
                item.dataset.seasonNumber = seasonNumber;

                item.addEventListener('click', () => {
                    document.querySelectorAll('.episode-item').forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    loadVideoPlayer('tv', mediaId, seasonNumber, episode.episode_number);
                });
                episodesList.appendChild(item);
            });

        } catch (error) {
            console.error(error);
            episodesList.innerHTML = `<p>${error.message}</p>`;
        }
    }

    // --- Initial load ---
    fetchMediaDetails();
});
