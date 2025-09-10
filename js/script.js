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
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');
    const userLoginBtn = document.getElementById('user-login-btn'); // 用户登录按钮
    const userStatusPanel = document.getElementById('user-status-panel'); // 用户状态面板
    const loginBtn = document.getElementById('login-btn'); // 登录按钮
    const logoutBtn = document.getElementById('logout-btn'); // 退出登录按钮
    const switchAccountBtn = document.getElementById('switch-account-btn'); // 切换账号按钮

    // 轮播图相关元素
    const carouselSlides = document.querySelectorAll('.carousel-slide');
    const carouselIndicators = document.querySelectorAll('.carousel-indicator');
    let currentSlide = 0;
    let carouselInterval;

    let currentPage = 1;
    let currentCategory = 'home'; // 默认分类
    let currentSearchQuery = ''; // 当前搜索关键词

    // 添加国内影视剧过滤参数
    const chinaParams = '&with_original_language=zh&region=CN';

    const apiConfig = {
        home:    { 
            title: '精选推荐', 
            rankingEndpoint: 'discover/movie', 
            rankingTitle: '总排行榜', 
            rankingParams: '&sort_by=popularity.desc' + chinaParams 
        },
        movie:   { 
            endpoint: 'discover/movie', 
            title: '热门电影', 
            rankingEndpoint: 'movie/top_rated', 
            rankingTitle: '电影排行榜', 
            params: chinaParams, 
            rankingParams: chinaParams 
        },
        tv:      { 
            endpoint: 'discover/tv',    
            title: '热门电视剧', 
            rankingEndpoint: 'tv/top_rated', 
            rankingTitle: '电视剧排行榜', 
            params: chinaParams, 
            rankingParams: chinaParams 
        },
        anime:   { 
            endpoint: 'discover/tv',    
            title: '热门动漫', 
            params: '&with_genres=16' + chinaParams, 
            rankingEndpoint: 'discover/tv', 
            rankingTitle: '动漫排行榜', 
            rankingParams: '&with_genres=16&sort_by=popularity.desc' + chinaParams 
        },
        variety: { 
            endpoint: 'discover/tv',    
            title: '热门综艺', 
            params: '&with_genres=10764' + chinaParams, 
            rankingEndpoint: 'discover/tv', 
            rankingTitle: '综艺排行榜', 
            rankingParams: '&with_genres=10764&sort_by=popularity.desc' + chinaParams 
        }
    };

    // 启动轮播图
    function startCarousel() {
        carouselInterval = setInterval(() => {
            showSlide((currentSlide + 1) % carouselSlides.length);
        }, 2000); // 每5秒切换一次
    }

    // 显示指定幻灯片
    function showSlide(index) {
        // 隐藏所有幻灯片
        carouselSlides.forEach(slide => slide.classList.remove('active'));
        carouselIndicators.forEach(indicator => indicator.classList.remove('active'));
        
        // 显示当前幻灯片
        carouselSlides[index].classList.add('active');
        carouselIndicators[index].classList.add('active');
        
        currentSlide = index;
    }

    // 为指示器添加点击事件
    carouselIndicators.forEach(indicator => {
        indicator.addEventListener('click', () => {
            clearInterval(carouselInterval);
            showSlide(parseInt(indicator.dataset.slide));
            startCarousel(); // 重新启动自动播放
        });
    });

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
        // 处理图片加载失败的情况
        image.src = `${imageBaseUrl}${item.poster_path}`;
        image.alt = item.title || item.name;
        image.onerror = function() {
            // 当图片加载失败时，使用默认图片或显示错误信息
            this.src = 'source/default-poster.png'; // 使用默认图片
            this.alt = '图片加载失败';
        };

        const title = document.createElement('h4');
        title.textContent = item.title || item.name;

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

        // 显示轮播图
        document.querySelector('.carousel-container').style.display = 'block';

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

    // --- 搜索功能 ---
    function searchMovies(query, page = 1) {
        if (!query) return;

        currentSearchQuery = query;
        const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=zh-CN&query=${encodeURIComponent(query)}&page=${page}`;

        // 显示搜索状态
        if (page === 1) {
            movieGrid.innerHTML = '';
            contentTitle.textContent = `搜索结果: "${query}"`;
            document.querySelector('.carousel-container').style.display = 'none';
            loadMoreBtnContainer.style.display = 'block';
        }

        loadMoreBtn.textContent = '加载中...';
        loadMoreBtn.disabled = true;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const items = data.results;
                if (!items || items.length === 0) {
                    loadMoreBtn.textContent = '没有更多了';
                    if (page === 1) {
                        movieGrid.innerHTML = '<p>没有找到相关影视作品。</p>';
                    }
                    return;
                }

                items.forEach(item => {
                    // 确定项目类型（电影或电视剧）
                    const category = item.media_type === 'movie' ? 'movie' : 'tv';
                    const movieItem = createMovieItem(item, category);
                    if (movieItem) movieGrid.appendChild(movieItem);
                });

                loadMoreBtn.textContent = '加载更多';
                loadMoreBtn.disabled = false;
            })
            .catch(error => {
                console.error('搜索失败:', error);
                if (page === 1) {
                    movieGrid.innerHTML = '<p style="color: #e50914;">搜索失败，请检查网络连接。</p>';
                }
                loadMoreBtn.textContent = '加载失败';
            });
    }

    function fetchContent(category, page) {
        // 如果当前是搜索状态，则执行搜索而不是分类内容加载
        if (currentSearchQuery) {
            searchMovies(currentSearchQuery, page);
            return;
        }

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
                    link.href = `watch.html?type=${category === 'home' ? (item.media_type || (item.title ? 'movie' : 'tv')) : category}&id=${item.id}`; // 可以设置为详情页链接
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
        currentSearchQuery = ''; // 清除搜索状态
        currentPage = 1;
        movieGrid.innerHTML = '';
        
        // 非首页时隐藏轮播图
        if (category !== 'home') {
            document.querySelector('.carousel-container').style.display = 'none';
        }
        
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
            // 启动轮播图
            startCarousel();
        } else {
            loadMoreBtnContainer.style.display = 'block'; // Show load more button
            fetchContent(currentCategory, currentPage);
        }

        fetchRankings(currentCategory); // Always update rankings
    }

    // 搜索事件处理
    function handleSearch() {
        const query = searchInput.value.trim();
        if (query) {
            // 清除当前分类状态
            navLinks.forEach(link => link.classList.remove('active'));
            searchMovies(query, 1);
            currentPage = 1;
        } else {
            // 如果搜索框为空，则返回主页
            switchCategory('home');
            // 设置首页链接为激活状态
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.dataset.category === 'home') {
                    link.classList.add('active');
                }
            });
        }
    }

    // 用户登录按钮点击事件处理
    userLoginBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // 阻止事件冒泡
        // 切换显示/隐藏用户状态面板
        userStatusPanel.classList.toggle('show');
    });

    // 点击登录按钮跳转到登录页面
    loginBtn.addEventListener('click', function() {
        window.location.href = 'login.html';
    });

    // 点击退出登录按钮
    logoutBtn.addEventListener('click', function() {
        // 隐藏退出登录和切换账号按钮
        logoutBtn.style.display = 'none';
        switchAccountBtn.style.display = 'none';
        
        // 显示登录按钮
        loginBtn.style.display = 'block';
        
        // 更新用户信息显示
        document.querySelector('.user-info p').textContent = '未登录';
    });

    // 点击切换账号按钮跳转到登录页面
    switchAccountBtn.addEventListener('click', function() {
        window.location.href = 'login.html';
    });

    // 点击页面其他地方隐藏用户状态面板
    document.addEventListener('click', function(e) {
        if (!userStatusPanel.contains(e.target) && e.target !== userLoginBtn) {
            userStatusPanel.classList.remove('show');
        }
    });

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
        if (currentSearchQuery) {
            searchMovies(currentSearchQuery, currentPage);
        } else {
            fetchContent(currentCategory, currentPage);
        }
    });

    // 添加搜索事件监听器
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // 初始加载首页内容
    switchCategory('home');
});