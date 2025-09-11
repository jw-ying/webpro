document.addEventListener('DOMContentLoaded', function() {
    // TMDB API密钥和图片基础URL
    const apiKey = '54e8474294e14f56475b3af052014213';
    const imageBaseUrl = 'https://image.tmdb.org/t/p/w200';

    // 获取页面中的DOM元素
    const movieGrid = document.querySelector('.movie-grid');
    const loadMoreBtnContainer = document.querySelector('.load-more-container');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const contentTitle = document.getElementById('content-title');
    const navLinks = document.querySelectorAll('.left-sidebar nav a');
    const rankingTitle = document.getElementById('ranking-title');
    const rankingList = document.getElementById('ranking-list');
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');
    const userLoginBtn = document.getElementById('user-login-btn');
    const userStatusPanel = document.getElementById('user-status-panel');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const switchAccountBtn = document.getElementById('switch-account-btn');
    const loginIndicator = document.querySelector('.login-indicator');
    const userInfo = document.querySelector('.user-info p');
    const aboutBtn = document.getElementById('about-btn');

    // 轮播图相关元素
    const carouselSlides = document.querySelectorAll('.carousel-slide');
    const carouselIndicators = document.querySelectorAll('.carousel-indicator');
    let currentSlide = 0;
    let carouselInterval;

    // 当前页面状态变量
    let currentPage = 1;
    let currentCategory = 'home'; // 默认分类为首页
    let currentSearchQuery = ''; // 当前搜索关键词

    // 检查用户登录状态
    function checkLoginStatus() {
        // 从localStorage获取当前用户信息
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            // 用户已登录，更新UI状态
            const user = JSON.parse(currentUser);
            userInfo.textContent = `已登录: ${user.email}`;
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
            switchAccountBtn.style.display = 'block';
            loginIndicator.classList.add('show'); // 显示登录状态指示器
        } else {
            // 用户未登录，更新UI状态
            userInfo.textContent = '未登录';
            loginBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
            switchAccountBtn.style.display = 'none';
            loginIndicator.classList.remove('show'); // 隐藏登录状态指示器
        }
    }

    // 添加国内影视剧过滤参数，只显示中文原声且地区为中国大陆的影视作品
    const chinaParams = '&with_original_language=zh&region=CN';

    // API配置对象，包含各分类的API端点和参数
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

    // 启动轮播图自动播放
    function startCarousel() {
        // 每2秒切换一次幻灯片
        carouselInterval = setInterval(() => {
            showSlide((currentSlide + 1) % carouselSlides.length);
        }, 2000);
    }

    // 显示指定索引的幻灯片
    function showSlide(index) {
        // 隐藏所有幻灯片和指示器
        carouselSlides.forEach(slide => slide.classList.remove('active'));
        carouselIndicators.forEach(indicator => indicator.classList.remove('active'));
        
        // 显示当前幻灯片和对应的指示器
        carouselSlides[index].classList.add('active');
        carouselIndicators[index].classList.add('active');
        
        // 更新当前幻灯片索引
        currentSlide = index;
    }

    // 为轮播图指示器添加点击事件
    carouselIndicators.forEach(indicator => {
        indicator.addEventListener('click', () => {
            // 清除自动播放定时器
            clearInterval(carouselInterval);
            // 显示指定幻灯片
            showSlide(parseInt(indicator.dataset.slide));
            // 重新启动自动播放
            startCarousel();
        });
    });

    // 为轮播图添加点击事件，通过标题搜索影片并跳转到观影页面
    document.querySelector('.carousel-container').addEventListener('click', (event) => {
        // 查找当前激活的幻灯片
        const activeSlide = document.querySelector('.carousel-slide.active');
        if (activeSlide) {
            // 获取媒体类型和标题
            const mediaType = activeSlide.dataset.type;
            const mediaTitle = activeSlide.dataset.title;
            
            if (mediaType && mediaTitle) {
                // 显示加载提示
                const loadingDiv = document.createElement('div');
                loadingDiv.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 18px; background: rgba(0,0,0,0.7); padding: 10px; border-radius: 5px; z-index: 10;';
                loadingDiv.textContent = '搜索中...';
                activeSlide.appendChild(loadingDiv);
                
                // 使用TMDB API搜索影片
                const searchUrl = `https://api.themoviedb.org/3/search/${mediaType}?api_key=${apiKey}&language=zh-CN&query=${encodeURIComponent(mediaTitle)}`;
                
                fetch(searchUrl)
                    .then(response => response.json())
                    .then(data => {
                        if (data.results && data.results.length > 0) {
                            // 获取第一个搜索结果的ID
                            const mediaId = data.results[0].id;
                            // 跳转到观影页面
                            window.location.href = `watch.html?type=${mediaType}&id=${mediaId}`;
                        } else {
                            // 如果没有找到结果，尝试使用通用搜索
                            const multiSearchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=zh-CN&query=${encodeURIComponent(mediaTitle)}`;
                            return fetch(multiSearchUrl)
                                .then(response => response.json())
                                .then(multiData => {
                                    if (multiData.results && multiData.results.length > 0) {
                                        // 获取媒体类型和ID
                                        const media = multiData.results[0];
                                        const type = media.media_type || (media.title ? 'movie' : 'tv');
                                        const id = media.id;
                                        // 跳转到观影页面
                                        window.location.href = `watch.html?type=${type}&id=${id}`;
                                    } else {
                                        // 恢复原始内容并显示错误信息
                                        if (activeSlide.contains(loadingDiv)) {
                                            activeSlide.removeChild(loadingDiv);
                                        }
                                        alert('未找到相关影片: ' + mediaTitle);
                                    }
                                });
                        }
                    })
                    .catch(error => {
                        // 处理搜索错误
                        console.error('搜索影片时出错:', error);
                        if (activeSlide.contains(loadingDiv)) {
                            activeSlide.removeChild(loadingDiv);
                        }
                        alert('搜索影片时出错，请稍后重试');
                    });
            }
        }
    });

    // 创建电影项目卡片的辅助函数
    function createMovieItem(item, category) {
        // 如果没有海报路径，则不创建卡片
        if (!item.poster_path) return null;

        // 创建卡片元素
        const movieItem = document.createElement('a');
        movieItem.className = 'movie-item';
        movieItem.href = `watch.html?type=${category}&id=${item.id}`;

        // 创建评分元素
        const rating = document.createElement('div');
        rating.className = 'movie-rating';
        rating.textContent = item.vote_average.toFixed(1);

        // 创建图片元素
        const image = document.createElement('img');
        image.src = `${imageBaseUrl}${item.poster_path}`;
        image.alt = item.title || item.name;
        // 处理图片加载失败的情况
        image.onerror = function() {
            this.src = 'source/default-poster.png';
            this.alt = '图片加载失败';
        };

        // 创建标题元素
        const title = document.createElement('h4');
        title.textContent = item.title || item.name;

        // 组装卡片元素
        movieItem.appendChild(rating);
        movieItem.appendChild(image);
        movieItem.appendChild(title);
        
        // 添加延迟以实现动画效果
        setTimeout(() => {
            movieItem.style.animationDelay = '0s';
        }, 0);
        
        return movieItem;
    }

    // 显示首页内容的函数
    async function displayHomePage() {
        // 清空电影网格并隐藏加载更多按钮
        movieGrid.innerHTML = '';
        loadMoreBtnContainer.style.display = 'none';
        contentTitle.textContent = apiConfig.home.title;

        // 显示轮播图
        document.querySelector('.carousel-container').style.display = 'block';

        // 定义需要显示的分类
        const categoriesToDisplay = {
            movie: '热门电影推荐',
            tv: '热门电视剧推荐',
            anime: '热门动漫推荐',
            variety: '热门综艺推荐'
        };

        // 依次获取并显示各分类内容
        for (const catKey of Object.keys(categoriesToDisplay)) {
            const sectionTitleText = categoriesToDisplay[catKey];
            const config = apiConfig[catKey];
            const params = config.params || '';
            const url = `https://api.themoviedb.org/3/${config.endpoint}?sort_by=popularity.desc&api_key=${apiKey}&language=zh-CN&page=1${params}`;

            try {
                // 发起API请求
                const response = await fetch(url);
                if (!response.ok) throw new Error(`获取 ${catKey} 数据失败`);
                const data = await response.json();
                // 获取前10个结果
                const items = data.results.slice(0, 10);

                if (items.length > 0) {
                    // 创建并添加分类标题
                    const sectionTitle = document.createElement('h3');
                    sectionTitle.className = 'home-section-title';
                    sectionTitle.textContent = sectionTitleText;
                    movieGrid.appendChild(sectionTitle);

                    // 添加该分类的项目
                    items.forEach(item => {
                        const movieItem = createMovieItem(item, catKey);
                        if (movieItem) movieGrid.appendChild(movieItem);
                    });
                }
            } catch (error) {
                // 处理错误情况
                console.error(`获取 "${sectionTitleText}" 失败:`, error);
                const errorTitle = document.createElement('h3');
                errorTitle.className = 'home-section-title';
                errorTitle.textContent = `${sectionTitleText} (加载失败)`;
                errorTitle.style.color = '#888';
                movieGrid.appendChild(errorTitle);
            }
        }
    }

    // 搜索电影功能
    function searchMovies(query, page = 1) {
        // 如果查询为空则返回
        if (!query) return;

        // 更新当前搜索状态
        currentSearchQuery = query;
        const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=zh-CN&query=${encodeURIComponent(query)}&page=${page}`;

        // 如果是第一页，清空电影网格并更新标题
        if (page === 1) {
            movieGrid.innerHTML = '';
            contentTitle.textContent = `搜索结果: "${query}"`;
            document.querySelector('.carousel-container').style.display = 'none';
            loadMoreBtnContainer.style.display = 'block';
        }

        // 更新加载按钮状态
        loadMoreBtn.textContent = '加载中...';
        loadMoreBtn.disabled = true;

        // 发起搜索请求
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const items = data.results;
                // 如果没有结果，更新按钮状态
                if (!items || items.length === 0) {
                    loadMoreBtn.textContent = '没有更多了';
                    if (page === 1) {
                        movieGrid.innerHTML = '<p>没有找到相关影视作品。</p>';
                    }
                    return;
                }

                // 添加搜索结果到页面
                items.forEach(item => {
                    const category = item.media_type === 'movie' ? 'movie' : 'tv';
                    const movieItem = createMovieItem(item, category);
                    if (movieItem) movieGrid.appendChild(movieItem);
                });

                // 恢复加载按钮状态
                loadMoreBtn.textContent = '加载更多';
                loadMoreBtn.disabled = false;
            })
            .catch(error => {
                // 处理搜索错误
                console.error('搜索失败:', error);
                if (page === 1) {
                    movieGrid.innerHTML = '<p style="color: #e50914;">搜索失败，请检查网络连接。</p>';
                }
                loadMoreBtn.textContent = '加载失败';
            });
    }

    // 获取指定分类的内容
    function fetchContent(category, page) {
        // 如果当前是搜索状态，则执行搜索而不是分类内容加载
        if (currentSearchQuery) {
            searchMovies(currentSearchQuery, page);
            return;
        }

        // 构建API请求URL
        const config = apiConfig[category];
        const params = config.params || '';
        const url = `https://api.themoviedb.org/3/${config.endpoint}?sort_by=popularity.desc&api_key=${apiKey}&language=zh-CN&page=${page}${params}`;
        
        // 更新加载按钮状态
        loadMoreBtn.textContent = '加载中...';
        loadMoreBtn.disabled = true;

        // 发起请求
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const items = data.results;
                // 如果没有结果，更新按钮状态
                if (!items || items.length === 0) {
                    loadMoreBtn.textContent = '没有更多了';
                    if (page === 1) {
                        movieGrid.innerHTML = '<p>未能加载内容，请稍后再试。</p>';
                    }
                    return;
                }

                // 添加内容到页面
                items.forEach(item => {
                    const movieItem = createMovieItem(item, category);
                    if(movieItem) movieGrid.appendChild(movieItem);
                });

                // 恢复加载按钮状态
                loadMoreBtn.textContent = '加载更多';
                loadMoreBtn.disabled = false;
            })
            .catch(error => {
                // 处理加载错误
                console.error('获取信息失败:', error);
                if (page === 1) {
                    movieGrid.innerHTML = '<p style="color: #e50914;">加载失败，请检查网络或API密钥。</p>';
                }
                loadMoreBtn.textContent = '加载失败';
            });
    }

    // 获取排行榜数据
    function fetchRankings(category) {
        // 构建API请求URL
        const config = apiConfig[category];
        const params = config.rankingParams || '';
        const url = `https://api.themoviedb.org/3/${config.rankingEndpoint}?api_key=${apiKey}&language=zh-CN&page=1${params}`;

        // 显示加载提示
        rankingList.innerHTML = '<li>加载中...</li>';
        rankingTitle.textContent = config.rankingTitle;

        // 发起请求
        fetch(url)
            .then(response => response.json())
            .then(data => {
                // 清空加载提示
                rankingList.innerHTML = '';
                // 获取前10名结果
                const items = data.results.slice(0, 10);

                // 如果没有结果，显示提示信息
                if (!items || items.length === 0) {
                    rankingList.innerHTML = '<li>暂无排行数据</li>';
                    return;
                }

                // 添加排行榜项目到页面
                items.forEach((item, index) => {
                    const li = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = `watch.html?type=${category === 'home' ? (item.media_type || (item.title ? 'movie' : 'tv')) : category}&id=${item.id}`;
                    link.textContent = item.title || item.name;

                    const span = document.createElement('span');
                    span.textContent = item.vote_average.toFixed(1);

                    li.appendChild(link);
                    li.appendChild(span);
                    rankingList.appendChild(li);
                    
                    // 添加延迟以实现动画效果
                    setTimeout(() => {
                        li.style.animationDelay = `${index * 0.1}s`;
                    }, 0);
                });
            })
            .catch(error => {
                // 处理加载错误
                console.error('获取排行榜信息失败:', error);
                rankingList.innerHTML = '<li>加载排行榜失败</li>';
            });
    }

    // 切换分类
    function switchCategory(category) {
        // 更新当前状态
        currentCategory = category;
        currentSearchQuery = '';
        currentPage = 1;
        movieGrid.innerHTML = '';
        
        // 非首页时隐藏轮播图
        if (category !== 'home') {
            document.querySelector('.carousel-container').style.display = 'none';
        }
        
        // 更新主标题
        contentTitle.textContent = apiConfig[category].title;
        
        // 更新侧边栏激活链接
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.category === category) {
                link.classList.add('active');
            }
        });

        // 根据分类处理显示内容
        if (category === 'home') {
            displayHomePage();
            // 启动轮播图
            startCarousel();
        } else {
            loadMoreBtnContainer.style.display = 'block';
            fetchContent(currentCategory, currentPage);
        }

        // 更新排行榜
        fetchRankings(currentCategory);
    }

    // 处理搜索事件
    function handleSearch() {
        // 获取搜索查询
        const query = searchInput.value.trim();
        if (query) {
            // 清除当前分类状态并执行搜索
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
        e.stopPropagation();
        // 切换显示/隐藏用户状态面板
        userStatusPanel.classList.toggle('show');
    });

    // 关于按钮点击事件处理
    aboutBtn.addEventListener('click', function() {
        window.location.href = 'about.html';
    });

    // 点击登录按钮跳转到登录页面
    loginBtn.addEventListener('click', function() {
        window.location.href = 'login.html';
    });

    // 点击退出登录按钮
    logoutBtn.addEventListener('click', function() {
        // 清除当前用户信息
        localStorage.removeItem('currentUser');
        
        // 更新UI状态
        userInfo.textContent = '未登录';
        logoutBtn.style.display = 'none';
        switchAccountBtn.style.display = 'none';
        loginBtn.style.display = 'block';
        loginIndicator.classList.remove('show');
        
        // 隐藏用户状态面板
        userStatusPanel.classList.remove('show');
    });

    // 点击切换账号按钮跳转到登录页面
    switchAccountBtn.addEventListener('click', function() {
        // 清除当前用户信息
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });

    // 点击页面其他地方隐藏用户状态面板
    document.addEventListener('click', function(e) {
        if (!userStatusPanel.contains(e.target) && e.target !== userLoginBtn) {
            userStatusPanel.classList.remove('show');
        }
    });

    // 为导航链接添加点击事件
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.dataset.category;
            if (category !== currentCategory) {
                switchCategory(category);
            }
        });
    });

    // 为加载更多按钮添加点击事件
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
    
    // 检查用户登录状态
    checkLoginStatus();
});