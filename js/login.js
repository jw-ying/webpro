document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const wechatIcon = document.getElementById('wechat');
    const iphoneIcon = document.getElementById('iphone');
    const emailInput = document.getElementById('emailInput');
    const logoButton = document.getElementById('logo-button'); // Logo按钮

    // 登录按钮点击事件
    loginBtn.addEventListener('click', () => {
        // 切换按钮样式
        loginBtn.classList.add('active');
        registerBtn.classList.remove('active');

        // 切换表单显示
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    });

    // 注册按钮点击事件
    registerBtn.addEventListener('click', () => {
        // 切换按钮样式
        registerBtn.classList.add('active');
        loginBtn.classList.remove('active');

        // 切换表单显示
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    });

    // Logo按钮点击事件 - 返回主页
    logoButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // 表单提交处理
    loginForm.addEventListener('submit', e => {
        // 阻止默认提交行为
        e.preventDefault();
        // 如果emailinput为空，提示用户输入
        if (!emailInput.value.trim()) {
            alert('请输入邮箱地址');
        } else {
            alert('登录功能待实现');
            // 这里可以添加AJAX登录逻辑
        }
    });

    registerForm.addEventListener('submit', e => {
        // 阻止默认提交行为
        e.preventDefault();
        // 如果emailinput为空，提示用户输入
        if (!emailInput.value.trim()) {
            alert('请输入邮箱地址');
        } else {
            alert('注册功能待实现');
            // 这里可以添加AJAX注册逻辑
        }
    });
});