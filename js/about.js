document.addEventListener('DOMContentLoaded', function() {
    // 获取返回按钮元素
    const backButton = document.getElementById('back-button');
    
    // 如果返回按钮存在，则添加点击事件监听器
    if (backButton) {
        backButton.addEventListener('click', function() {
            // 点击后跳转到首页
            window.location.href = 'index.html';
        });
    }
    
    // 获取所有关于卡片元素
    const cards = document.querySelectorAll('.about-card');
    cards.forEach((card, index) => {
        // 为每个卡片设置动画延迟，实现逐个出现的效果
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            // 触发动画，使卡片淡入并向上移动
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
        }, index * 150);
    });
    
    // 获取所有图标元素
    const icons = document.querySelectorAll('.card-icon');
    icons.forEach(icon => {
        // 添加鼠标悬停事件
        icon.addEventListener('mouseover', function() {
            // 图标放大并旋转
            this.style.transform = 'scale(1.2) rotate(10deg)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        // 添加鼠标离开事件
        icon.addEventListener('mouseout', function() {
            // 图标恢复原始大小和旋转角度
            this.style.transform = 'scale(1) rotate(0deg)';
        });
    });
});