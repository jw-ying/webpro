document.addEventListener('DOMContentLoaded', function() {
    const apiKey = '54e8474294e14f56475b3af052014213';
    const imageBaseUrl = 'https://image.tmdb.org/t/p/w200';

    const movieGrid = document.querySelector('.movie-grid');
    const loadMoreBtnContainer = document.querySelector('.load-more-container');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const contentTitle = document.getElementById('content-title');
    const navLinks = document.querySelectorAll('.left-sidebar nav a');
    const rankingTitle = document.getElementById('ranking-title');
    const rankingList = document.getElementById('ranking-list');

    let currentPage = 1;
    let currentCategory = 'home'; // 默认分类

    const apiConfig = {
        home:    { title: '精选推荐', rankingEndpoint: 'movie/top_rated', rankingTitle: '电影排行榜' },
        movie:   { endpoint: 'discover/movie', title: '热门电影', rankingEndpoint: 'movie/top_rated', rankingTitle: '电影排行榜' },
        tv:      { endpoint: 'discover/tv',    title: '热门电视剧', rankingEndpoint: 'tv/top_rated', rankingTitle: '电视剧排行榜' },
        anime:   { endpoint: 'discover/tv',    title: '热门动漫', params: '&with_genres=16', rankingEndpoint: 'tv/top_rated', rankingTitle: '动漫排行榜', rankingParams: '&with_genres=16' },
        variety: { endpoint: 'discover/tv',    title: '热门综艺', params: '&with_genres=10764', rankingEndpoint: 'tv/top_rated', rankingTitle: '综艺排行榜', rankingParams: '&with_genres=10764' }
    };

    // --- Helper function to create a movie item card ---
    function createMovieItem(item, category) {
        if (!item.poster_path) return null;

        const movieItem = document.createElement('a'); // Change div to a
        movieItem.className = 'movie-item';
        movieItem.href = `watch.html?type=${category}&id=${item.id}`; // Set the link to the watch page

        const rating = document.createElement('div');
        rating.className = 'movie-rating';
        rating.textContent = item.vote_average.toFixed(1);

        const image = document.createElement('img');
        image.src = `${imageBaseUrl}${item.poster_path}`;
        const itemName = item.title || item.name;
        image.alt = itemName;

        const title = document.createElement('h4');
        title.textContent = itemName;

        movieItem.appendChild(rating);
        movieItem.appendChild(image);
        movieItem.appendChild(title);
        return movieItem;
    }

    // --- Function to display the special home page ---
    async function displayHomePage() {
        movieGrid.innerHTML = ''; // Clear the grid
        loadMoreBtnContainer.style.display = 'none'; // Hide load more button on home
        contentTitle.textContent = apiConfig.home.title;

        const categoriesToDisplay = {
            movie: '热门电影推荐',
            tv: '热门电视剧推荐',
            anime: '热门动漫推荐',
            variety: '热门综艺推荐'
        };

        // Fetch and display categories sequentially
        for (const catKey of Object.keys(categoriesToDisplay)) {
            const sectionTitleText = categoriesToDisplay[catKey];
            const config = apiConfig[catKey];
            const params = config.params || '';
            const url = `https://api.themoviedb.org/3/${config.endpoint}?sort_by=popularity.desc&api_key=${apiKey}&language=zh-CN&page=1${params}`;

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to fetch ${catKey}`);
                const data = await response.json();
                const items = data.results.slice(0, 10); // Get top 10 for 2 rows

                if (items.length > 0) {
                    // Create and append section title directly to the main grid
                    const sectionTitle = document.createElement('h3');
                    sectionTitle.className = 'home-section-title';
                    sectionTitle.textContent = sectionTitleText;
                    movieGrid.appendChild(sectionTitle);

                    // Append items for this section directly to the main grid
                    items.forEach(item => {
                        const movieItem = createMovieItem(item, catKey);
                        if (movieItem) movieGrid.appendChild(movieItem);
                    });
                }
            } catch (error) {
                console.error(`获取 "${sectionTitleText}" 失败:`, error);
                // Optionally display an error message for the failed section
                const errorTitle = document.createElement('h3');
                errorTitle.className = 'home-section-title';
                errorTitle.textContent = `${sectionTitleText} (加载失败)`;
                errorTitle.style.color = '#888';
                movieGrid.appendChild(errorTitle);
            }
        }
    }


    function fetchContent(category, page) {
        const config = apiConfig[category];
        const params = config.params || '';
        const url = `https://api.themoviedb.org/3/${config.endpoint}?sort_by=popularity.desc&api_key=${apiKey}&language=zh-CN&page=${page}${params}`;
        
        loadMoreBtn.textContent = '加载中...';
        loadMoreBtn.disabled = true;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const items = data.results;
                if (!items || items.length === 0) {
                    loadMoreBtn.textContent = '没有更多了';
                    if (page === 1) {
                        movieGrid.innerHTML = '<p>未能加载内容，请稍后再试。</p>';
                    }
                    return;
                }

                items.forEach(item => {
                    const movieItem = createMovieItem(item, category);
                    if(movieItem) movieGrid.appendChild(movieItem);
                });

                loadMoreBtn.textContent = '加载更多';
                loadMoreBtn.disabled = false;
            })
            .catch(error => {
                console.error('获取信息失败:', error);
                if (page === 1) {
                    movieGrid.innerHTML = '<p style="color: #e50914;">加载失败，请检查网络或API密钥。</p>';
                }
                loadMoreBtn.textContent = '加载失败';
            });
    }

    function fetchRankings(category) {
        const config = apiConfig[category];
        const params = config.rankingParams || '';
        const url = `https://api.themoviedb.org/3/${config.rankingEndpoint}?api_key=${apiKey}&language=zh-CN&page=1${params}`;

        rankingList.innerHTML = '<li>加载中...</li>'; // 清空旧的排行榜并显示加载提示
        rankingTitle.textContent = config.rankingTitle;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                rankingList.innerHTML = ''; // 清空加载提示
                const items = data.results.slice(0, 10); // 只取前10名

                if (!items || items.length === 0) {
                    rankingList.innerHTML = '<li>暂无排行数据</li>';
                    return;
                }

                items.forEach(item => {
                    const li = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = `watch.html?type=${category}&id=${item.id}`; // 可以设置为详情页链接
                    link.textContent = item.title || item.name;

                    const span = document.createElement('span');
                    span.textContent = item.vote_average.toFixed(1);

                    li.appendChild(link);
                    li.appendChild(span);
                    rankingList.appendChild(li);
                });
            })
            .catch(error => {
                console.error('获取排行榜信息失败:', error);
                rankingList.innerHTML = '<li>加载排行榜失败</li>';
            });
    }

    function switchCategory(category) {
        currentCategory = category;
        currentPage = 1;
        movieGrid.innerHTML = '';
        
        // Update main title
        contentTitle.textContent = apiConfig[category].title;
        
        // Update active link in sidebar
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.category === category) {
                link.classList.add('active');
            }
        });

        // Handle display based on category
        if (category === 'home') {
            displayHomePage();
        } else {
            loadMoreBtnContainer.style.display = 'block'; // Show load more button
            fetchContent(currentCategory, currentPage);
        }

        fetchRankings(currentCategory); // Always update rankings
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.dataset.category;
            if (category !== currentCategory) {
                switchCategory(category);
            }
        });
    });

    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        fetchContent(currentCategory, currentPage);
    });

    // 初始加载首页内容
    switchCategory('home');
});
