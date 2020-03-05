/**
 * 全局配置
 */

layui.define(['laytpl', 'layer', 'element', 'util'], function (exports) {
    
    exports('setter', {
        container: 'RESUME_app',
        base: layui.cache.base,
        views: layui.cache.base + 'views/',  // 视图所在目录
        entry: 'index',                      // 默认视图文件名
        engine: '.html',                     // 视图文件后缀名
        pageTabs: false,                     // 是否开启页面选项卡功能。单页版不推荐开启
        support: '技术支持',                  // 技术支持
        name: 'WEB简历',                     // 系统名称
        tableName: 'layuiAdmin',             // 本地存储表名
        MOD_NAME: 'admin',                   // 模块事件名
        transition: true,                    // 是否开启页面内过渡动画效果
        loaderAnimation: true,               // 是否开启页面加载动画
        debug: true,                         // 是否开启调试模式。如开启，接口异常时会抛出异常 URL 等信息
        interceptor: false,                  // 是否开启未登入拦截
        request: {                           // 自定义请求字段
            tokenName: 'access_token'        // 自动携带 token 的字段名。可设置 false 不携带。
        },
        response: {                          // 自定义响应字段
            statusName: 'code',              // 数据状态的字段名称
            statusCode: {
                ok: 0,                       // 数据状态一切正常的状态码
                logout: 1001                 // 登录状态失效的状态码
            },
            msgName: 'msg',                  // 状态信息的字段名称
            dataName: 'data'                 // 数据详情的字段名称
        },
        indPage: [],                         // 独立页面路由，可随意添加（无需写参数）
        // 接口地址前缀
        apiPath: '',
        extend: []                           // 扩展的第三方模块
    });
    
});
