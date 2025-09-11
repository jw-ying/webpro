document.addEventListener('DOMContentLoaded', () => {
    // 获取登录和注册相关的DOM元素
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginEmailInput = document.getElementById('loginEmailInput');
    const loginPasswordInput = document.getElementById('loginPasswordInput');
    const registerEmailInput = document.getElementById('registerEmailInput');
    const registerPasswordInput = document.getElementById('registerPasswordInput');
    const logoButton = document.getElementById('logo-button');

    // 从localStorage获取现有用户数据，如果不存在则创建空数组
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // 为登录按钮添加点击事件监听器
    loginBtn.addEventListener('click', () => {
        // 设置登录按钮为激活状态，注册按钮为非激活状态
        loginBtn.classList.add('active');
        registerBtn.classList.remove('active');

        // 显示登录表单，隐藏注册表单
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    });

    // 为注册按钮添加点击事件监听器
    registerBtn.addEventListener('click', () => {
        // 设置注册按钮为激活状态，登录按钮为非激活状态
        registerBtn.classList.add('active');
        loginBtn.classList.remove('active');

        // 显示注册表单，隐藏登录表单
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    });

    // 为Logo按钮添加点击事件，点击后返回主页
    logoButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // 处理登录表单提交事件
    loginForm.addEventListener('submit', e => {
        // 阻止表单默认提交行为
        e.preventDefault();
        // 获取用户输入的邮箱和密码
        const loginemail = loginEmailInput.value;
        const loginpassword = loginPasswordInput.value;
        
        // 检查邮箱和密码是否为空
        if (!loginemail || !loginpassword) {
            alert('请填写邮箱以及密码！');
            return;
        }
        // 查找用户是否存在
        const user = searchUser(loginemail);
        if (user) {
            // 检查密码是否正确
            if (user.password === loginpassword) {
                alert('登录成功！');
                // 将当前用户信息保存到localStorage
                localStorage.setItem('currentUser', JSON.stringify(user));
                // 跳转到主页
                window.location.href = 'index.html';
            } else {
                alert('密码错误！');
            }
        } else {
            alert('用户不存在！');
        }
    });

    // 处理注册表单提交事件
    registerForm.addEventListener('submit', e => {
        // 阻止表单默认提交行为
        e.preventDefault();
        // 获取用户输入的邮箱和密码
        const registeremail = registerEmailInput.value;
        const registerpassword = registerPasswordInput.value;
        
        // 检查邮箱和密码是否为空
        if (!registeremail || !registerpassword) {
            alert('请填写邮箱以及密码！');
            return;
        }
        // 检查用户邮箱是否已被注册
        if (searchUser(registeremail)) {
            alert('该邮箱已被注册！');
            return;
        }
        // 添加新用户
        addUser(registeremail, registerpassword);
    });

    // 添加新用户到用户列表
    function addUser(email, password) {
        // 创建新用户对象并添加到用户数组
        users.push({
            id: Date.now(), // 使用时间戳作为用户ID
            email: email,
            password: password
        });

        // 将更新后的用户数据保存到localStorage
        localStorage.setItem('users', JSON.stringify(users));

        // 清空注册表单输入框
        registerEmailInput.value = '';
        registerPasswordInput.value = '';

        alert('用户注册成功！');
    }

    // 根据邮箱查找用户
    function searchUser(email) {
        // 从localStorage获取用户数据
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        // 遍历用户数组查找匹配的邮箱
        for (let i = 0; i < users.length; i++) {
            if (users[i].email === email) {
                return users[i];
            }
        }
        return null;
    }

});