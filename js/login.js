document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginEmailInput = document.getElementById('loginEmailInput');
    const loginPasswordInput = document.getElementById('loginPasswordInput');
    const registerEmailInput = document.getElementById('registerEmailInput');
    const registerPasswordInput = document.getElementById('registerPasswordInput');
    const logoButton = document.getElementById('logo-button'); // Logo按钮


    // 从localStorage获取现有用户或创建空数组
    const users = JSON.parse(localStorage.getItem('users') || '[]');

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
        // 获取当前输入框的值
        const loginemail = loginEmailInput.value;
        const loginpassword = loginPasswordInput.value;
        
        if (!loginemail || !loginpassword) {
            alert('请填写邮箱以及密码！');
            return;
        }
        const user = searchUser(loginemail);
        if (user) {
            if (user.password === loginpassword) {
                alert('登录成功！');
                // 保存当前用户信息到localStorage
                localStorage.setItem('currentUser', JSON.stringify(user));
                window.location.href = 'index.html';
            } else {
                alert('密码错误！');
            }
        } else {
            alert('用户不存在！');
        }
    });

    registerForm.addEventListener('submit', e => {
        // 阻止默认提交行为
        e.preventDefault();
        // 获取当前输入框的值
        const registeremail = registerEmailInput.value;
        const registerpassword = registerPasswordInput.value;
        
        if (!registeremail || !registerpassword) {
            alert('请填写邮箱以及密码！');
            return;
        }
        // 检查用户是否已存在
        if (searchUser(registeremail)) {
            alert('该邮箱已被注册！');
            return;
        }
        addUser(registeremail, registerpassword);
    });

    function addUser(email, password) {
        // 添加新用户
        users.push({
            id: Date.now(),// 使用时间戳作为ID
            email: email,
            password: password
        });

        // 保存回localStorage
        localStorage.setItem('users', JSON.stringify(users));

        // 清空表单
        registerEmailInput.value = '';
        registerPasswordInput.value = '';

        alert('用户注册成功！');
    }

    function searchUser(email) {
        // 从localStorage获取现有用户或创建空数组
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        // 遍历用户数据，查找匹配的邮箱
        for (let i = 0; i < users.length; i++) {
            if (users[i].email === email) {
                return users[i];
            }
        }
        return null;
    }

});