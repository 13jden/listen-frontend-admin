import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
    {
        path: '/',
        redirect: '/login',
    },
    {
        path: '/login',
        name: 'login',
        meta: {
            title: '登录',
        },
        component: () => import('../view/Login.vue') // 确保路径正确
    },
    {
        path: '/home',
        name: 'Home',
        meta: {
            title: '主页',
            requiresAuth: true,
        },
        component: () => import('../view/Home.vue'),
        redirect: '/home/index',
        children: [
            {
                path: 'index',
                name: 'Index',
                meta: {
                    title: '首页',
                },
                component: () => import('../view/Welcome.vue')
            },
            {
                path: 'user',
                name: 'UserManagement',
                meta: {
                    title: '用户管理',
                },
                component: () => import('../view/UserManagement.vue') // 创建 UserManagement.vue 文件
            },
            {
                path: 'audio',
                name: 'AudioManagement',
                meta: {
                    title: '测试音频管理',
                },
                component: () => import('../view/AudioManagement.vue') // 创建 AudioManagement.vue 文件
            },
            {
                path: 'test',
                name: 'TestResults',
                meta: {
                    title: '测试情况',
                },
                component: () => import('../view/TestResults.vue') 
            },
            {
                path: 'hospital',
                name: 'Hospital',
                meta: {
                    title: '医院管理',
                },
                component: () => import('../view/Hospital.vue')
            },
            // 数据统计
            {
                path: 'statistics',
                name: 'Statistics',
                meta: {
                    title: '数据统计',
                },
                component: () => import('../view/Statistics.vue')
            },
            // AI辅助分析
            {
                path: 'ai-analysis',
                name: 'AIAnalysis',
                meta: {
                    title: 'AI辅助分析',
                },
                component: () => import('../view/AIAnalysis.vue')
            },
            // 管理员管理
            {
                path: 'admin',
                name: 'AdminManagement',
                meta: {
                    title: '管理员管理',
                },
                component: () => import('../view/AdminManagement.vue')
            },
            // 角色权限
            {
                path: 'role',
                name: 'RoleManagement',
                meta: {
                    title: '角色权限',
                },
                component: () => import('../view/RoleManagement.vue')
            }
        ]
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    //
    // base:process.env.BASE_URL,
    routes,
});

router.beforeEach((to, from, next) => {
    const admin = sessionStorage.getItem('admin');
    console.log('Admin:', admin); // 检查是否正确获取到 admin 数据
    if (to.meta.requiresAuth) {
        if (!admin) {
            console.log('未登录，跳转到登录页');
            next({ name: 'login' });
        } else {
            console.log('已登录，继续访问');
            next();
        }
    } else {
        next();
    }
});


// 获取 cookie 值的工具方法
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

export default router;
