/**
 * layuiAdmin 公共业务模块
 * 公共业务的逻辑处理，此模块切换任何页面都会执行
 */
layui.define('global',function (exports) {
    var $ = layui.$,
        layer = layui.layer,
        laytpl = layui.laytpl,
        setter = layui.setter,
        view = layui.view,
        util = layui.util,
        admin = layui.admin;
    
    
    /*
    Unable to infer base url. This is common when using dynamic servlet registration or when the API is behind an API Gateway. The base url is the root of where all the swagger resources are served. For e.g. if the api is available at http://example.org/api/v2/api-docs then the base url is http://example.org/api/. Please enter the location manually:
    //  */
    // if (!admin.terminal('mobile')) {
    //     $('.area').perfectScrollbar({
    //         cursorwidth: 6,
    //     });
    //     $('.sidebar-body').perfectScrollbar();
    // }
    
    //对外暴露的接口
    exports('common', {});
});
