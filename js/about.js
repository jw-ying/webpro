document.addEventListener('DOMContentLoaded', function() {
    // 返回按钮事件处理
    const backButton = document.getElementById('back-button');
    
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
    
    // 添加页面加载动画
    const cards = document.querySelectorAll('.about-card');
    cards.forEach((card, index) => {
        // 添加延迟以实现动画效果
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            // 触发动画
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
        }, index * 150);
    });
    
    // 添加图标悬停效果
    const icons = document.querySelectorAll('.card-icon');
    icons.forEach(icon => {
        icon.addEventListener('mouseover', function() {
            this.style.transform = 'scale(1.2) rotate(10deg)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        icon.addEventListener('mouseout', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
    });
});