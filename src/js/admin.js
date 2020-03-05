/**
 * layuiAdmin 核心模块
 */
layui.define(['view', 'fakeLoader'], function (exports) {
    var $ = layui.jquery,
        laytpl = layui.laytpl,
        element = layui.element,
        setter = layui.setter,
        view = layui.view,
        fakeLoader = layui.fakeLoader,
        device = layui.device(),
        
        $win = $(window),
        $body = $('body'),
        container = $('#' + setter.container),
        
        SHOW = 'layui-show',
        HIDE = 'layui-hide',
        THIS = 'layui-this',
        DISABLED = 'layui-disabled',
        TEMP = 'template',
        APP_BODY = '#nj_app_body',
        APP_FLEXIBLE = 'LAY_app_flexible',
        FILTER_TAB_TBAS = 'layadmin-layout-tabs',
        APP_SPREAD_SM = 'layadmin-side-spread-sm',
        TABS_BODY = 'layadmin-tabsbody-item',
        ICON_SHRINK = 'layui-icon-shrink-right',
        ICON_SPREAD = 'layui-icon-spread-left',
        SIDE_SHRINK = 'layadmin-side-shrink',
        SIDE_MENU = 'LAY-system-side-menu';
    
    // 通用方法
    var admin = {
        v: '1.2.1 pro',
        
        // 数据的异步请求
        req: view.req,
        
        getAction: function (url, data, callback) {
            return $.ajax({
                type: "get",
                url: url,
                data: data,
                success: function (result) {
                    if (typeof callback == 'function') {
                        callback(result)
                    }
                },
                error: function (e, code) {
                    var error = [
                        '请求异常，请重试<br><cite>错误信息：</cite>' + code
                    ].join('');
                    view.error(error);
                }
            });
        },
        
        postAction: function (url, data, callback) {
            return $.ajax({
                type: "post",
                url: url,
                data: data,
                success: function (result) {
                    if (typeof callback == 'function') {
                        callback(result)
                    }
                },
                error: function (e, code) {
                    var error = [
                        '请求异常，请重试<br><cite>错误信息：</cite>' + code
                    ].join('');
                    view.error(error);
                }
            });
        },
        
        // 清除本地 token，并跳转到登入页
        exit: view.exit,
        
        prevRouter: {
            title: "",
            href: ""
        },
        
        currentRouter: {
            title: "",
            href: ""
        },
        
        // xss 转义
        escape: function (html) {
            return String(html || '').replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
            .replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/'/g, '&#39;').replace(/"/g, '&quot;');
        },
        
        // 事件监听
        on: function (events, callback) {
            return layui.onevent.call(this, setter.MOD_NAME, events, callback);
        },
        
        // 弹出面板
        popup: view.popup,
        
        // 右侧面板
        popupRight: function (options) {
            //layer.close(admin.popup.index);
            return admin.popup.index = layer.open($.extend({
                type: 1
                , id: 'LAY_adminPopupR'
                , anim: -1
                , title: false
                , closeBtn: false
                , offset: 'r'
                , shade: 0.2
                , shadeClose: true
                , skin: 'layui-anim layui-anim-rl layui-layer-adminRight'
                , area: '300px'
            }, options));
        },
        
        // 页面加载动画
        loader: {
            
            // 初始化页面加载动画
            init: function (options) {
                $body.prepend(`<div id="fakeloader"></div>`);
                var fakeLoader = $("#fakeloader");
                fakeLoader.fakeLoader($.extend({
                    timeToHide: 9999999999,
                    bgColor: "#2B313D",
                    zIndex: '9999999999',
                    spinner: "spinner" + admin.random(1, 7),
                }, options));
            },
            
            // 销毁页面加载动画
            destroy: function () {
                var fakeLoader = $("#fakeloader");
                setTimeout(function () {
                    fakeLoader.fadeOut();
                    setTimeout(function () {
                        fakeLoader.remove();
                    }, 500);
                }, 500);
            }
            
        },
        
        // 操作浏览器标题
        title: {
            vars: {
                sourceTitle: document.title,
                counter: 0
            },
            typeWriter: function () {
                document.title = this.vars.sourceTitle.substring(0, this.vars.counter);
                if (this.vars.counter == this.vars.sourceTitle.length) {
                    this.vars.counter = 0;
                    setTimeout("Title.typeWriter()", 200);
                } else {
                    this.vars.counter++;
                    setTimeout("Title.typeWriter()", 400);
                }
            },
            marquee: function () {
                document.title = this.vars.sourceTitle.substring(this.vars.counter, this.vars.sourceTitle.length) + " " + this.vars.sourceTitle.substring(0, this.vars.counter);
                this.vars.counter++;
                if (this.vars.counter > this.vars.sourceTitle.length) {
                    this.vars.counter = 0;
                }
                setTimeout("Title.marquee()", 200);
            },
            pref: function (param) {
                if (param.trim() != "") {
                    this.vars.sourceTitle = document.title = param + " " + this.vars.sourceTitle;
                }
            },
            suf: function (param) {
                if (param.trim() != "") {
                    this.vars.sourceTitle = document.title = this.vars.sourceTitle + " " + param;
                }
            },
            change: function (param) {
                this.vars.sourceTitle = document.title = param;
            },
            animation: function (param) {
                switch (param) {
                    case "typeWriter":
                        this.typeWriter();
                        break;
                    case "marquee":
                        this.marquee();
                        break;
                }
            }
        },
        
        // 预览json数据
        logJson: function (json, options) {
            var data = eval(json);
            admin.popup($.extend({
                title: "Json Viewer",
                shade: 0,
                // maxmin: true,
                content: `<pre id="json-renderer"></pre>`,
                area: admin.screen() < 2 ? ['90%', '70%'] : ['500px', '600px'],
                id: 'json-viewer-log',
                skin: 'layui-page-modal',
                resize: true,
                shadeClose: false,
                success: function (layero, index) {
                    layero.find(".layui-layer-content").css('overflow', 'hidden');
                    layero.find('#json-renderer').jsonViewer(data, {
                        collapsed: false,
                        withQuotes: false
                    });
                }
            }, options));
        },
        
        // 发送验证码
        sendAuthCode: function (options) {
            options = $.extend({
                seconds: 60
                , elemPhone: '#LAY_phone'
                , elemVercode: '#LAY_vercode'
            }, options);
            
            var seconds = options.seconds
                , token = null
                , timer, countDown = function (loop) {
                var btn = $(options.elem)
                seconds--;
                if (seconds < 0) {
                    btn.removeClass(DISABLED).html('获取验证码');
                    seconds = options.seconds;
                    clearInterval(timer);
                } else {
                    btn.addClass(DISABLED).html(seconds + '秒后重获');
                }
                
                if (!loop) {
                    timer = setInterval(function () {
                        countDown(true);
                    }, 1000);
                }
            };
            
            $body.off('click', options.elem).on('click', options.elem, function () {
                options.elemPhone = $(options.elemPhone);
                options.elemVercode = $(options.elemVercode);
                
                var elemPhone = options.elemPhone
                    , value = elemPhone.val();
                
                if (seconds !== options.seconds || $(this).hasClass(DISABLED)) return;
                
                if (!/^1\d{10}$/.test(value)) {
                    elemPhone.focus();
                    return layer.msg('请输入正确的手机号')
                }
                
                if (typeof options.ajax === 'object') {
                    var success = options.ajax.success;
                    delete options.ajax.success;
                }
                admin.req($.extend(true, {
                    url: '/auth/code'
                    , type: 'get'
                    , data: {
                        phone: value
                    }
                    , success: function (res) {
                        layer.msg('验证码已发送至你的手机，请注意查收', {
                            icon: 1
                            , shade: 0
                        });
                        options.elemVercode.focus();
                        countDown();
                        success && success(res);
                    }
                }, options.ajax));
            });
        },
        
        // 屏幕类型
        screen: function () {
            var width = $win.width();
            if (width > 1200) {
                return 3; // 大屏幕
            } else if (width > 992) {
                return 2; // 中屏幕
            } else if (width > 768) {
                return 1; // 小屏幕
            } else {
                return 0; // 超小屏幕
            }
        },
        
        // 获取当前的终端
        terminal: function (key) {
            var regs = {
                // 安卓
                "android": /android/i,
                // 苹果平板电脑
                "iPad": /ipad/i,
                // 苹果手机
                "iphone": /iphone/i,
                // 苹果操作系统
                "mac": /macintosh/i,
                // 微软操作系统
                "windows": /windows/i,
                // 移动端
                "mobile": /(nokia|iphone|android|ipad|motorola|^mot\-|softbank|foma|docomo|kddi|up\.browser|up\.link|htc|dopod|blazer|netfront|helio|hosin|huawei|novarra|CoolPad|webos|techfaith|palmsource|blackberry|alcatel|amoi|ktouch|nexian|samsung|^sam\-|s[cg]h|^lge|ericsson|philips|sagem|wellcom|bunjalloo|maui|symbian|smartphone|midp|wap|phone|windows ce|iemobile|^spice|^bird|^zte\-|longcos|pantech|gionee|^sie\-|portalmmm|jig\s browser|hiptop|^ucweb|^benq|haier|^lct|opera\s*mobi|opera\*mini|320x320|240x320|176x220)/i
            };
            return regs[key].test(window.navigator.userAgent);
        },
        
        // 禁用某些功能
        disableEvent: function () {
            // 'contextmenu' 右键
            // 'selectstart' 选择
            // 'copy'        复制
            ['selectstart', 'copy'].forEach(function (ev) {
                document.addEventListener(ev, function (event) {
                    return event.returnValue = false
                })
            });
        },
        
        // 侧边伸缩
        sideFlexible: function (status) {
            var app = container
                , iconElem = $('#' + APP_FLEXIBLE)
                , screen = admin.screen();
            
            //设置状态，PC：默认展开、移动：默认收缩
            if (status === 'spread') {
                //切换到展开状态的 icon，箭头：←
                iconElem.removeClass(ICON_SPREAD).addClass(ICON_SHRINK);
                
                //移动：从左到右位移；PC：清除多余选择器恢复默认
                if (screen < 2) {
                    app.addClass(APP_SPREAD_SM);
                } else {
                    app.removeClass(APP_SPREAD_SM);
                }
                
                app.removeClass(SIDE_SHRINK)
            } else {
                //切换到搜索状态的 icon，箭头：→
                iconElem.removeClass(ICON_SHRINK).addClass(ICON_SPREAD);
                
                //移动：清除多余选择器恢复默认；PC：从右往左收缩
                if (screen < 2) {
                    app.removeClass(SIDE_SHRINK);
                } else {
                    app.addClass(SIDE_SHRINK);
                }
                
                app.removeClass(APP_SPREAD_SM)
            }
            
            layui.event.call(this, setter.MOD_NAME, 'side({*})', {
                status: status
            });
        },
        
        // 重置主体区域表格尺寸
        resizeTable: function (delay) {
            var that = this, runResizeTable = function () {
                that.tabsBody(admin.tabsPage.index).find('.layui-table-view').each(function () {
                    var tableID = $(this).attr('lay-id');
                    layui.table.resize(tableID);
                });
            };
            if (!layui.table) return;
            delay ? setTimeout(runResizeTable, delay) : runResizeTable();
        },
        
        // 主题设置
        theme: function (options) {
            var theme = setter.theme
                , local = layui.data(setter.tableName)
                , id = 'LAY_layadmin_theme'
                , style = document.createElement('style')
                , styleText = laytpl([
                //主题色
                '.layui-side-menu,'
                , '.layadmin-pagetabs .layui-tab-title li:after,'
                , '.layadmin-pagetabs .layui-tab-title li.layui-this:after,'
                , '.layui-layer-admin .layui-layer-title,'
                , '.layadmin-side-shrink .layui-side-menu .layui-nav>.layui-nav-item>.layui-nav-child'
                , '{background-color:{{d.color.main}} !important;}'
                
                //选中色
                , '.layui-nav-tree .layui-this,'
                , '.layui-nav-tree .layui-this>a,'
                , '.layui-nav-tree .layui-nav-child dd.layui-this,'
                , '.layui-nav-tree .layui-nav-child dd.layui-this a'
                , '{background-color:{{d.color.selected}} !important;}'
                
                //logo
                , '.layui-layout-admin .layui-logo{background-color:{{d.color.logo || d.color.main}} !important;}'
                
                //头部色
                , '{{# if(d.color.header){ }}'
                , '.layui-layout-admin .layui-header{background-color:{{ d.color.header }};}'
                , '.layui-layout-admin .layui-header a,'
                , '.layui-layout-admin .layui-header a cite{color: #f8f8f8;}'
                , '.layui-layout-admin .layui-header a:hover{color: #fff;}'
                , '.layui-layout-admin .layui-header .layui-nav .layui-nav-more{border-top-color: #fbfbfb;}'
                , '.layui-layout-admin .layui-header .layui-nav .layui-nav-mored{border-color: transparent; border-bottom-color: #fbfbfb;}'
                , '.layui-layout-admin .layui-header .layui-nav .layui-this:after, .layui-layout-admin .layui-header .layui-nav-bar{background-color: #fff; background-color: rgba(255,255,255,.5);}'
                , '.layadmin-pagetabs .layui-tab-title li:after{display: none;}'
                , '{{# } }}'
            ].join('')).render(options = $.extend({}, local.theme, options))
                , styleElem = document.getElementById(id);
            
            //添加主题样式
            if ('styleSheet' in style) {
                style.setAttribute('type', 'text/css');
                style.styleSheet.cssText = styleText;
            } else {
                style.innerHTML = styleText;
            }
            style.id = id;
            
            styleElem && $body[0].removeChild(styleElem);
            $body[0].appendChild(style);
            $body.attr('layadmin-themealias', options.color.alias);
            
            //本地存储记录
            local.theme = local.theme || {};
            layui.each(options, function (key, value) {
                local.theme[key] = value;
            });
            layui.data(setter.tableName, {
                key: 'theme'
                , value: local.theme
            });
        },
        
        // 初始化主题
        initTheme: function (index) {
            var theme = setter.theme;
            index = index || 0;
            if (theme.color[index]) {
                theme.color[index].index = index;
                admin.theme({
                    color: theme.color[index]
                });
            }
        },
        
        // 记录最近一次点击的页面标签数据
        tabsPage: {},
        
        // 获取标签页的头元素
        tabsHeader: function (index) {
            return $('#LAY_app_tabsheader').children('li').eq(index || 0);
        },
        
        // 获取页面标签主体元素
        tabsBody: function (index) {
            return $(APP_BODY).find('.' + TABS_BODY).eq(index || 0);
        },
        
        // 切换页面标签主体
        tabsBodyChange: function (index) {
            admin.tabsHeader(index).attr('lay-attr', layui.router().href);
            admin.tabsBody(index).addClass(SHOW).siblings().removeClass(SHOW);
            events.rollPage('auto', index);
        },
        
        // resize事件管理
        resize: function (fn) {
            var router = layui.router()
                , key = router.path.join('-');
            
            if (admin.resizeFn[key]) {
                $win.off('resize', admin.resizeFn[key]);
                delete admin.resizeFn[key];
            }
            
            if (fn === 'off') return; //如果是清除 resize 事件，则终止往下执行
            
            fn(), admin.resizeFn[key] = fn;
            $win.on('resize', admin.resizeFn[key]);
        },
        resizeFn: {},
        runResize: function () {
            var router = layui.router(), key = router.path.join('-');
            admin.resizeFn[key] && admin.resizeFn[key]();
        },
        delResize: function () {
            this.resize('off');
        },
        
        // 关闭当前 pageTabs
        closeThisTabs: function () {
            if (!admin.tabsPage.index) return;
            $(TABS_HEADER).eq(admin.tabsPage.index).find('.layui-tab-close').trigger('click');
        },
        
        // 全屏
        fullScreen: function () {
            var ele = document.documentElement
                , reqFullScreen = ele.requestFullScreen || ele.webkitRequestFullScreen
                || ele.mozRequestFullScreen || ele.msRequestFullscreen;
            if (typeof reqFullScreen !== 'undefined' && reqFullScreen) {
                reqFullScreen.call(ele);
            }
        },
        
        // 退出全屏
        exitScreen: function () {
            var ele = document.documentElement
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        },
        
        // 纠正单页路由格式
        correctRouter: function (href) {
            if (!/^\//.test(href)) href = '/' + href;
            
            //纠正首尾
            return href.replace(/^(\/+)/, '/')
            .replace(new RegExp('\/' + setter.entry + '$'), '/'); //过滤路由最后的默认视图文件名（如：index）
        },
        
        // 判断元素是否存在某个属性
        hasAttr: function (selector, attr) {
            return typeof ($(selector).attr(attr)) != "undefined";
        },
        
        // 检测数据是不是除了symbol外的原始数据
        isStatic: function (value) {
            return (
                typeof value === 'string' ||
                typeof value === 'number' ||
                typeof value === 'boolean' ||
                typeof value === 'undefined' ||
                value === null
            )
        },
        
        // 检测数据是不是原始数据
        isPrimitive: function (value) {
            return admin.isStatic(value) || typeof value === 'symbol'
        },
        
        // 判断数据是不是引用类型的数据
        // (例如： arrays, functions, objects, regexes, new Number(0),以及 new String(''))
        isObject: function (value) {
            var type = typeof value;
            return value != null && (type == 'object' || type == 'function');
        },
        
        // 检查 value 是否是 类对象。
        // 如果一个值是类对象，那么它不应该是 null，而且 typeof 后的结果是 "object"
        isObjectLike: function (value) {
            return value != null && typeof value == 'object';
        },
        
        // 获取数据类型，返回结果为 Number、String、Object、Array等
        getRawType: function (value) {
            return Object.prototype.toString.call(value).slice(8, -1)
        },
        
        // 判断数据是不是Object类型的数据
        isPlainObject: function (obj) {
            return Object.prototype.toString.call(obj) === '[object Object]'
        },
        
        // 判断数据是不是数组类型的数据
        isArray: function (arr) {
            return Object.prototype.toString.call(arr) === '[object Array]'
        },
        
        /* 数组去重复数据 */
        deleteRepeat: function (array) {
            var new_arr = [];
            for (var i = 0; i < array.length; i++) {
                var items = array[i];
                if ($.inArray(items, new_arr) == -1) {
                    new_arr.push(items);
                }
            }
            return new_arr;
        },
        
        // 检查数据是否是非数字值
        //  原生的isNaN会把参数转换成数字(valueof)，而null、true、false以及长度小于等于1的数组(元素为非NaN数据)会被转换成数字，这不是我想要的
        //  Symbol类型的数据不具有valueof接口，所以isNaN会抛出错误，这里放在后面，可避免错误
        _isNaN: function (v) {
            return !(typeof v === 'string' || typeof v === 'number') || isNaN(v)
        },
        
        // 求取数组中非NaN数据中的最大值
        max: function (arr) {
            arr = arr.filter(item => !admin._isNaN(item));
            return arr.length ? Math.max.apply(null, arr) : undefined
        },
        
        // 求取数组中非NaN数据中的最小值
        min: function (arr) {
            arr = arr.filter(item => !admin._isNaN(item));
            return arr.length ? Math.min.apply(null, arr) : undefined
        },
        
        // 返回一个lower - upper之间的随机数
        // lower、upper无论正负与大小，但必须是非NaN的数据
        random: function (lower, upper) {
            return Math.floor(Math.random() * (upper - lower + 1) + lower);
        },
        
        // 判断数据是不是正则对象
        isRegExp: function (value) {
            return Object.prototype.toString.call(value) === '[object RegExp]'
        },
        
        // 判断数据是不是时间对象
        isDate: function (value) {
            return Object.prototype.toString.call(value) === '[object Date]'
        },
        
        // 判断 value 是不是浏览器内置函数
        // 内置函数toString后的主体代码块为 [native code]，而非内置函数则为相关代码，所以非内置函数可以进行拷贝(toString后掐头去尾再由Function转)
        isNative: function (value) {
            return typeof value === 'function' && /native code/.test(value.toString())
        },
        
        // 检查 value 是不是函数
        isFunction: function (value) {
            return Object.prototype.toString.call(value) === '[object Function]'
        },
        
        // 检查 value 是否为有效的类数组长度。
        isLength: function (value) {
            return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= Number.MAX_SAFE_INTEGER;
        },
        
        // 检查 value 是否是类数组。
        // 如果一个值被认为是类数组，那么它不是一个函数，并且value.length是个整数，大于等于 0，小于或等于 Number.MAX_SAFE_INTEGER。这里字符串也将被当作类数组
        isArrayLike: function (value) {
            return value != null && admin.isLength(value.length) && !admin.isFunction(value);
        },
        
        // 检查 value 是否为空
        // 如果是null，直接返回true；
        // 如果是类数组，判断数据长度；
        // 如果是Object对象，判断是否具有属性；
        // 如果是其他数据，直接返回false(也可改为返回true)
        isEmpty: function (value) {
            if (value == null) {
                return true;
            }
            if (admin.isArrayLike(value)) {
                return !value.length;
            } else if (admin.isPlainObject(value)) {
                for (var key in value) {
                    if (hasOwnProperty.call(value, key)) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        },
        
        // 字符串首位大写
        capitalize: function (str) {
            return str.charAt(0).toUpperCase() + str.slice(1)
        },
        
        // 将属性混合到目标对象中
        extend: function (to, _from) {
            for (var key in _from) {
                to[key] = _from[key];
            }
            return to
        },
        
        // 克隆数据，可深度克隆
        // 这里列出了原始类型，时间、正则、错误、数组、对象的克隆规则，其他的可自行补充
        clone: function (value, deep) {
            if (admin.isPrimitive(value)) {
                return value
            }
            if (admin.isArrayLike(value)) { //是类数组
                value = Array.prototype.slice.call(value);
                return value.map(item => deep ? admin.clone(item, deep) : item)
            } else if (admin.isPlainObject(value)) { //是对象
                var target = {}, key;
                for (key in value) {
                    value.hasOwnProperty(key) && (target[key] = deep ? admin.clone(value[key], deep) : value[key])
                }
            }
            var type = admin.getRawType(value);
            switch (type) {
                case 'Date':
                case 'RegExp':
                case 'Error':
                    value = new window[type](value);
                    break;
            }
            return value
        },
        
        // 获取浏览器信息
        getExplorerInfo: function () {
            var t = navigator.userAgent.toLowerCase();
            return 0 <= t.indexOf("msie") ? { //ie < 11
                type: "IE",
                version: Number(t.match(/msie ([\d]+)/)[1])
            } : !!t.match(/trident\/.+?rv:(([\d.]+))/) ? { // ie 11
                type: "IE",
                version: 11
            } : 0 <= t.indexOf("edge") ? {
                type: "Edge",
                version: Number(t.match(/edge\/([\d]+)/)[1])
            } : 0 <= t.indexOf("firefox") ? {
                type: "Firefox",
                version: Number(t.match(/firefox\/([\d]+)/)[1])
            } : 0 <= t.indexOf("chrome") ? {
                type: "Chrome",
                version: Number(t.match(/chrome\/([\d]+)/)[1])
            } : 0 <= t.indexOf("opera") ? {
                type: "Opera",
                version: Number(t.match(/opera.([\d]+)/)[1])
            } : 0 <= t.indexOf("Safari") ? {
                type: "Safari",
                version: Number(t.match(/version\/([\d]+)/)[1])
            } : {
                type: t,
                version: -1
            }
        },
        
        // 数组去重，返回一个新数组
        unique: function (arr) {
            if (!isArrayLink(arr)) { //不是类数组对象
                return arr
            }
            var result = [];
            var objarr = [];
            var obj = Object.create(null);
            
            arr.forEach(item => {
                if (admin.isStatic(item)) {//是除了symbol外的原始数据
                    var key = item + '_' + admin.getRawType(item);
                    if (!obj[key]) {
                        obj[key] = true;
                        result.push(item)
                    }
                } else {//引用类型及symbol
                    if (!objarr.includes(item)) {
                        objarr.push(item);
                        result.push(item)
                    }
                }
            });
            
            return resulte
        },
        
        // 检测是否为PC端浏览器模式
        isPCBroswer: function () {
            var e = navigator.userAgent.toLowerCase()
                , t = "ipad" == e.match(/ipad/i)
                , i = "iphone" == e.match(/iphone/i)
                , r = "midp" == e.match(/midp/i)
                , n = "rv:1.2.3.4" == e.match(/rv:1.2.3.4/i)
                , a = "ucweb" == e.match(/ucweb/i)
                , o = "android" == e.match(/android/i)
                , s = "windows ce" == e.match(/windows ce/i)
                , l = "windows mobile" == e.match(/windows mobile/i);
            return !(t || i || r || n || a || o || s || l)
        },
        
        // 获取Url参数，返回一个对象
        getUrlParam: function () {
            var url = document.location.toString();
            var arrObj = url.split("?");
            var params = Object.create(null);
            if (arrObj.length > 1) {
                arrObj = arrObj[1].split("&");
                arrObj.forEach(item => {
                    item = item.split("=");
                    params[item[0]] = item[1]
                })
            }
            return params;
        },
        
        // 全屏
        toFullScreen: function () {
            var elem = document.body;
            elem.webkitRequestFullScreen
                ? elem.webkitRequestFullScreen()
                : elem.mozRequestFullScreen
                ? elem.mozRequestFullScreen()
                : elem.msRequestFullscreen
                    ? elem.msRequestFullscreen()
                    : elem.requestFullScreen
                        ? elem.requestFullScreen()
                        : alert("浏览器不支持全屏");
        },
        
        // 退出全屏
        exitFullscreen: function () {
            var elem = parent.document;
            elem.webkitCancelFullScreen
                ? elem.webkitCancelFullScreen()
                : elem.mozCancelFullScreen
                ? elem.mozCancelFullScreen()
                : elem.cancelFullScreen
                    ? elem.cancelFullScreen()
                    : elem.msExitFullscreen
                        ? elem.msExitFullscreen()
                        : elem.exitFullscreen
                            ? elem.exitFullscreen()
                            : alert("切换失败,可尝试Esc退出");
        },
        
        // 利用 performance.timing 进行性能分析
        performanceAnalysis: function () {
            window.onload = function () {
                setTimeout(function () {
                    var t = performance.timing;
                    console.log('DNS查询耗时 ：' + (t.domainLookupEnd - t.domainLookupStart).toFixed(0) + ' ms');
                    console.log('TCP链接耗时 ：' + (t.connectEnd - t.connectStart).toFixed(0) + ' ms');
                    console.log('request请求耗时 ：' + (t.responseEnd - t.responseStart).toFixed(0) + ' ms');
                    console.log('解析dom树耗时 ：' + (t.domComplete - t.domInteractive).toFixed(0) + ' ms');
                    console.log('白屏时间 ：' + (t.responseStart - t.navigationStart).toFixed(0) + ' ms');
                    console.log('domReady时间 ：' + (t.domContentLoadedEventEnd - t.navigationStart).toFixed(0) + ' ms');
                    console.log('onload时间 ：' + (t.loadEventEnd - t.navigationStart).toFixed(0) + ' ms');
                    
                    if (t = performance.memory) {
                        console.log('js内存使用占比 ：' + (t.usedJSHeapSize / t.totalJSHeapSize * 100).toFixed(2) + '%')
                    }
                })
            };
        },
        
        // 两个纯函数组合之后返回一个新函数
        compose: function (f, g) {
            return function (x) {
                return f(g(x));
            };
        },
        
        // 字节大小转换，参数为b
        bytesToSize: function (bytes) {
            var sizes = ['Bytes', 'KB', 'MB'];
            if (bytes == 0) return 'n/a';
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
            return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
        },
        
        // 通过文件名，返回文件的后缀名
        getFileType: function (name) {
            var nameArr = name.split(".");
            return nameArr[nameArr.length - 1].toLowerCase();
        },
        
        // 文件上传
        uploadFileBox: function (options) {
            admin.uploadOptions = options || {};
            admin.popup({
                title: "上传文件",
                area: ['800px', '470px'],
                id: 'uploadBoxLayer',
                skin: 'layui-page-modal',
                shadeClose: false,
                resize: false,
                success: function (layero, index) {
                    // 渲染弹窗页面视图
                    view(this.id).render('main/upload', {}, 'popup').done(function (res) {
                        layero.find("[data-type='close']").on("click", function () {
                            layer.close(index);
                        });
                    });
                }
            });
        },
        
        /* 序列化表单数据为JSON格式 */
        serializeJSON: function (obj) {
            var formArr = obj.serializeArray();
            var formObj = {};
            $.each(formArr, function () {
                if (formObj[this.name]) {
                    if (!formObj[this.name].push) {
                        formObj[this.name] = [formObj[this.name]];
                    }
                    formObj[this.name].push(this.value || '');
                } else {
                    formObj[this.name] = this.value || '';
                }
            });
            return formObj;
        },
        // 校验规则
        verify: function (key, val) {
            var regs = {
                /* 邮箱 */
                "email": {
                    "rule": /^[0-9a-zA-Z_]+@[0-9a-zA-Z_]+[\.]{1}[0-9a-zA-Z]+[\.]?[0-9a-zA-Z]+$/,
                    "error": "请输入正确的邮箱地址"
                },
                /* 手机 11位数字，以1开头 */
                "phone": {
                    "rule": /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/,
                    "error": "请输入正确的手机号码"
                },
                /* 座机号码 区号+号码，区号以0开头，3位或4位 */
                "mobile": {
                    "rule": /^0\d{2,3}-?\d{7,8}$/,
                    "error": "请输入正确的座机号码"
                },
                /* 超链接 */
                "href": {
                    "rule": /^https?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i,
                    "error": "不合法的链接地址"
                },
                /* 身份证 */
                "idCard": {
                    "rule": /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/,
                    "error": "请输入正确的身份证号码"
                },
                /* 邮政编码 */
                "postal": {
                    "rule": /^[1-9]\d{5}(?!\d)$/,
                    "error": "请输入正确的邮政编码"
                },
                
                /* YY-MM-dd 格式日期 */
                "date": {
                    "rule": /^[1-2][0-9][0-9][0-9]-[0-1]{0,1}[0-9]-[0-3]{0,1}[0-9]$/,
                    "error": "请输入正确的日期格式（如：YY-MM-dd）"
                },
                
                /* QQ */
                "qq": {
                    "rule": /^[1-9][0-9]{4,9}$/,
                    "error": "请输入正确的QQ账号"
                },
                
                /* 全部为数字 */
                "number": {
                    "rule": /"^\d+$/,
                    "error": "必须为数字"
                },
                
                /* 适合的帐号 英文/数字 */
                "befitName": {
                    "rule": /^[a-z0-9A-Z]+$/i,
                    "error": "帐号必须由英文、数字、下划线组成"
                },
                
                /* 适合的密码 英文/数字/下划线 */
                "befitPwd": {
                    "rule": /^[0-9a-zA-Z_]+$/,
                    "error": "密码必须由英文、数字、下划线组成"
                },
                
                /* 是否包含中文 */
                "includeCN": {
                    "rule": /[\u4e00-\u9fa5]/,
                    "error": "不可包含中文"
                },
                /* 必填 */
                "required": {
                    "rule": /\S/,
                    "error": "不能为空"
                },
                /* 26个小写英文字母组成 */
                "lowercase": {
                    "rule": /^[a-z]+$/,
                    "error": "必须由26个小写英文字母组成"
                },
                /* 26个大写英文字母组成 */
                "capital": {
                    "rule": /^[A-Z]+$/,
                    "error": "必须由26个大写英文字母组成"
                },
                /* 26个英文字母组成的 */
                "letters": {
                    "rule": /^[A-Za-z]+$/,
                    "error": "必须由26个英文字母组成的"
                },
            };
            
            return {
                value: regs[key].rule.test(val),
                error: !regs[key].rule.test(val) ? regs[key].error : ""
            };
            
        },
        // 执行校验
        initValidate: function () {
            var verifyItem = $(".custom-form").find("*[data-verify]");
            for (var i = 0; i < verifyItem.length; i++) {
                var item = $(verifyItem[i])
                item.on("focus", function () {
                    var $this = $(this);
                    layer.close($this.data('index'));
                    $this.removeClass("is-invalid");
                }).on("blur", function () {
                    var $this = $(this),
                        verifyResult = admin.verify($this.attr('data-verify'), $this.val());
                    if (!verifyResult.value) {
                        
                        if ($this.hasClass('is-invalid')) {
                            layer.close($this.data('index'));
                        }
                        
                        $this.addClass("is-invalid");
                        var direction = $this.attr("data-direction"),
                            index = admin.errorTip(verifyResult.error, $this, {
                                tips: [admin.screen() < 1 ? 3 : direction || 2, '#dc3545']
                            });
                        $this.data("index", index);
                        
                    } else {
                        $this.removeClass("is-invalid");
                    }
                })
            }
        },
        // 表单校验
        checkForm: function (obj) {
            var form = $(obj),
                verifyItem = $(obj).find("*[data-verify]"),
                action = form.attr('action'),                  // 接口
                method = form.attr('method'),                  // 提交的方式
                async = form.attr('data-async') === 'true';    // 是否异步提交
            
            // 遍历所有需要校验的对象
            for (var i = 0; i < verifyItem.length; i++) {
                
                var item = $(verifyItem[i]),
                    result = admin.verify(item.attr('data-verify'), item.val());  // 执行校验后的结果
                
                // 先判断当前对象本身是否有校验过的错误提示（防止错误提示重复出现）
                if (item.hasClass('is-invalid')) {
                    // 如果有，先清除当前对象的错误提示
                    layer.close(item.data('index'));
                }
                
                if (!result.value) {
                    // 当前对象校验不通过 添加错误提示
                    item.addClass("is-invalid");
                    var direction = item.attr("data-direction"),
                        index = admin.errorTip(result.error, item, {
                            tips: [admin.screen() < 1 ? 3 : direction || 2, '#dc3545']
                        });
                    item.data("index", index);
                    return false;  // 跳出当前循环
                    
                } else {
                    // 当前对象校验通过
                    item.removeClass("is-invalid");
                    layer.close(item.data('index'));
                }
            }
            
            // 校验完成后执行提交操作
            if (!async) {    // 同步提交
                form.submit();
            } else {         // 异步提交
                admin.req({
                    url: action,
                    type: method,
                    data: admin.serializeJSON(form),
                    success: function (res) {
                        layer.msg("提交成功", {icon: 1});
                    },
                    error: function (e, code) {
                        layer.msg("提交失败 " + code, {icon: 2, anim: 6});
                    }
                })
            }
            
        },
        // 表单校验错误提示
        errorTip: function (msg, elem, options) {
            return layer.tips(msg, elem, $.extend({
                tips: [admin.screen() < 1 ? 3 : 2, '#dc3545'],
                time: -1,
                tipsMore: true
            }, options));
        },
        // 清除表单里所有的错误提示
        clearFormError: function (obj) {
            var verifyItem = $(obj).find("*[data-verify]");
            layer.closeAll('tips');
            for (var i = 0; i < verifyItem.length; i++) {
                var item = $(verifyItem[i]);
                if (item.hasClass('is-invalid')) {
                    item.removeClass('is-invalid');
                }
            }
        },
        // 初始化简单的文件上传
        initSimpleUpload: function (id) {
            var removeFile = $('.removeFile');
            
            var addNotes = function (fileName, type) {
                return `<div class="notes notes-custom">
                         <span class="notes-text">${fileName}</span>
                         <button type="button" class="notes-close removeFile" layadmin-event="closeNotes">&times;</button>
                    </div>`;
            }
            
            
            var initChangeEvent = function () {
                var fileUpload = $("#" + id),
                    fileBox = fileUpload.parent();
                
                fileUpload.on("change", function () {
                    var filePath = $(this).val();
                    if (filePath.length > 0) {
                        var arr = filePath.split('\\');
                        var fileName = arr[arr.length - 1];   // 文件名
                        if (fileBox.find('.notes').length > 0) {
                            fileBox.find('.notes').children('.notes-text').html(fileName);
                        } else {
                            fileBox.append(addNotes(fileName));
                        }
                    } else {
                        fileBox.find('.notes').remove();
                        fileBox.append(addNotes("您未上传文件，或者您上传文件类型有误！", 'error'));
                        return false;
                    }
                });
            }
            
            removeFile.on("click", function () {
                var file = document.getElementById('file-upload');
                file.outerHTML = file.outerHTML;
                initChangeEvent();
            });
            
            initChangeEvent();
        }
        
    };
    
    // 事件
    var events = admin.events = {
        
        //伸缩
        flexible: function (othis) {
            var iconElem = othis.find('#' + APP_FLEXIBLE)
                , isSpread = iconElem.hasClass(ICON_SPREAD);
            admin.sideFlexible(isSpread ? 'spread' : null); //控制伸缩
            admin.resizeTable(350);
        },
        
        //刷新
        refresh: function () {
            layui.index.render();
        },
        
        //输入框搜索
        serach: function (othis) {
            othis.off('keypress').on('keypress', function (e) {
                if (!this.value.replace(/\s/g, '')) return;
                //回车跳转
                if (e.keyCode === 13) {
                    var href = othis.attr('lay-action'),
                        text = othis.attr('lay-text') || '搜索';
                    
                    href = href + this.value;
                    text = text + ' <span style="color: #FF5722;">' + admin.escape(this.value) + '</span>';
                    
                    //打开标签页
                    location.hash = admin.correctRouter(href)
                    
                    //如果搜索关键词已经打开，则刷新页面即可
                    events.serach.keys || (events.serach.keys = {});
                    events.serach.keys[admin.tabsPage.index] = this.value;
                    if (this.value === events.serach.keys[admin.tabsPage.index]) {
                        events.refresh(othis);
                    }
                    
                    //清空输入框
                    this.value = '';
                }
            });
        },
        
        //点击消息
        message: function (othis) {
            othis.find('.layui-badge-dot').remove();
        },
        
        //弹出主题面板
        theme: function () {
            admin.popupRight({
                id: 'LAY_adminPopupTheme',
                success: function () {
                    view(this.id).render('system/theme')
                }
            });
        },
        
        //便签
        note: function (othis) {
            var mobile = admin.screen() < 2,
                note = layui.data(setter.tableName).note;
            
            events.note.index = admin.popup({
                title: '便签',
                shade: 0,
                offset: [
                    '41px'
                    , (mobile ? null : (othis.offset().left - 250) + 'px')
                ],
                anim: -1,
                id: 'LAY_adminNote',
                skin: 'layadmin-note layui-anim layui-anim-upbit',
                content: '<textarea placeholder="内容"></textarea>',
                resize: false,
                success: function (layero, index) {
                    var textarea = layero.find('textarea'),
                        value = note === undefined ? '便签中的内容会存储在本地，这样即便你关掉了浏览器，在下次打开时，依然会读取到上一次的记录。是个非常小巧实用的本地备忘录' : note;
                    
                    textarea.val(value).focus().on('keyup', function () {
                        layui.data(setter.tableName, {
                            key: 'note',
                            value: this.value
                        });
                    });
                }
            })
        },
        
        //全屏
        fullscreen: function (othis) {
            var SCREEN_FULL = 'layui-icon-screen-full',
                SCREEN_REST = 'layui-icon-screen-restore',
                iconElem = othis.children("i");
            
            if (iconElem.hasClass(SCREEN_FULL)) {
                admin.fullScreen();
                iconElem.addClass(SCREEN_REST).removeClass(SCREEN_FULL);
            } else {
                admin.exitScreen();
                iconElem.addClass(SCREEN_FULL).removeClass(SCREEN_REST);
            }
        },
        
        //弹出关于面板
        about: function () {
            admin.popupRight({
                id: 'LAY_adminPopupAbout',
                success: function () {
                    view(this.id).render('system/about')
                }
            });
        },
        
        //弹出更多面板
        more: function () {
            admin.popupRight({
                id: 'LAY_adminPopupMore',
                success: function () {
                    view(this.id).render('system/more')
                }
            });
        },
        
        //返回上一页
        back: function () {
            history.back();
        },
        
        //主题设置
        setTheme: function (othis) {
            var index = othis.data('index'),
                nextIndex = othis.siblings('.layui-this').data('index');
            
            if (othis.hasClass(THIS)) return;
            
            othis.addClass(THIS).siblings('.layui-this').removeClass(THIS);
            admin.initTheme(index);
        },
        
        // 左右滚动页面标签
        rollPage: function (type, index) {
            var tabsHeader = $('#LAY_app_tabsheader'),
                liItem = tabsHeader.children('li'),
                scrollWidth = tabsHeader.prop('scrollWidth'),
                outerWidth = tabsHeader.outerWidth(),
                tabsLeft = parseFloat(tabsHeader.css('left'));
            
            // 右左往右
            if (type === 'left') {
                if (!tabsLeft && tabsLeft <= 0) return;
                
                //当前的left减去可视宽度，用于与上一轮的页标比较
                var prefLeft = -tabsLeft - outerWidth;
                
                liItem.each(function (index, item) {
                    var li = $(item),
                        left = li.position().left;
                    
                    if (left >= prefLeft) {
                        tabsHeader.css('left', -left);
                        return false;
                    }
                });
            } else if (type === 'auto') { //自动滚动
                (function () {
                    var thisLi = liItem.eq(index), thisLeft;
                    
                    if (!thisLi[0]) return;
                    thisLeft = thisLi.position().left;
                    
                    //当目标标签在可视区域左侧时
                    if (thisLeft < -tabsLeft) {
                        return tabsHeader.css('left', -thisLeft);
                    }
                    
                    //当目标标签在可视区域右侧时
                    if (thisLeft + thisLi.outerWidth() >= outerWidth - tabsLeft) {
                        var subLeft = thisLeft + thisLi.outerWidth() - (outerWidth - tabsLeft);
                        liItem.each(function (i, item) {
                            var li = $(item)
                                , left = li.position().left;
                            
                            //从当前可视区域的最左第二个节点遍历，如果减去最左节点的差 > 目标在右侧不可见的宽度，则将该节点放置可视区域最左
                            if (left + tabsLeft > 0) {
                                if (left - tabsLeft > subLeft) {
                                    tabsHeader.css('left', -left);
                                    return false;
                                }
                            }
                        });
                    }
                }());
            } else {
                //默认向左滚动
                liItem.each(function (i, item) {
                    var li = $(item),
                        left = li.position().left;
                    
                    if (left + li.outerWidth() >= outerWidth - tabsLeft) {
                        tabsHeader.css('left', -left);
                        return false;
                    }
                });
            }
        },
        
        //向右滚动页面标签
        leftPage: function () {
            events.rollPage('left');
        },
        
        //向左滚动页面标签
        rightPage: function () {
            events.rollPage();
        },
        
        //关闭当前标签页
        closeThisTabs: function () {
            admin.closeThisTabs();
        },
        
        //关闭其它标签页
        closeOtherTabs: function (type) {
            var TABS_REMOVE = 'LAY-system-pagetabs-remove';
            if (type === 'all') {
                $(TABS_HEADER + ':gt(0)').remove();
                $(APP_BODY).find('.' + TABS_BODY + ':gt(0)').remove();
            } else {
                $(TABS_HEADER).each(function (index, item) {
                    if (index && index != admin.tabsPage.index) {
                        $(item).addClass(TABS_REMOVE);
                        admin.tabsBody(index).addClass(TABS_REMOVE);
                    }
                });
                $('.' + TABS_REMOVE).remove();
            }
        },
        
        //关闭全部标签页
        closeAllTabs: function () {
            events.closeOtherTabs('all');
            location.hash = '';
        },
        
        //遮罩
        shade: function () {
            admin.sideFlexible();
        },
        
        closeNotes: function (othis) {
            othis.parent().remove();
        },
        
        // 提交表单 会先执行校验
        submit: function (othis) {
            var form = othis.parents('.custom-form');
            admin.checkForm(form);
        },
        
        // 重置表单
        reset: function (othis) {
            var form = othis.parents('.custom-form');
            admin.clearFormError(form);
            form[0].reset();
        },
        
        // 退出登录
        logout: function () {
            layer.msg("退出登录成功", {icon: 1});
        }
        
    };
    
    // 初始
    !function () {
        
        // 禁止水平滚动
        $body.addClass('layui-layout-body');
        
        // 移动端强制不开启页面标签功能
        if (admin.screen() < 1) {
            delete setter.pageTabs;
        }
        
        // 不开启页面标签时
        if (!setter.pageTabs) {
            container.addClass('layadmin-tabspage-none');
        }
        
        // 低版本IE提示
        if (device.ie && device.ie < 10) {
            view.error('IE' + device.ie + '下访问可能不佳，推荐使用：Chrome / Firefox / Edge 等高级浏览器', {
                offset: 'auto',
                id: 'LAY_errorIE'
            });
        }
        
    }();
    
    // 初始化页面加载动画
    if (setter.loaderAnimation) {
        admin.loader.init();
    }
    
    // 监听 hash 改变侧边状态
    admin.on('hash(side)', function (router) {
        var path = router.path, getData = function (item) {
                return {
                    list: item.children('.layui-nav-child')
                    , name: item.data('name')
                    , jump: item.data('jump')
                }
            },
            sideMenu = $('#' + SIDE_MENU),
            SIDE_NAV_ITEMD = 'layui-nav-itemed',
            
            //捕获对应菜单
            matchMenu = function (list) {
                var pathURL = admin.correctRouter(path.join('/'));
                list.each(function (index1, item1) {
                    var othis1 = $(item1)
                        , data1 = getData(othis1)
                        , listChildren1 = data1.list.children('dd')
                        , matched1 = path[0] == data1.name || (index1 === 0 && !path[0])
                        || (data1.jump && pathURL == admin.correctRouter(data1.jump));
                    
                    listChildren1.each(function (index2, item2) {
                        var othis2 = $(item2)
                            , data2 = getData(othis2)
                            , listChildren2 = data2.list.children('dd')
                            , matched2 = (path[0] == data1.name && path[1] == data2.name)
                            || (data2.jump && pathURL == admin.correctRouter(data2.jump));
                        
                        listChildren2.each(function (index3, item3) {
                            var othis3 = $(item3)
                                , data3 = getData(othis3)
                                , matched3 = (path[0] == data1.name && path[1] == data2.name && path[2] == data3.name)
                                || (data3.jump && pathURL == admin.correctRouter(data3.jump))
                            
                            if (matched3) {
                                var selected = data3.list[0] ? SIDE_NAV_ITEMD : THIS;
                                othis3.addClass(selected).siblings().removeClass(selected); //标记选择器
                                return false;
                            }
                            
                        });
                        
                        if (matched2) {
                            var selected = data2.list[0] ? SIDE_NAV_ITEMD : THIS;
                            othis2.addClass(selected).siblings().removeClass(selected); //标记选择器
                            return false
                        }
                        
                    });
                    
                    if (matched1) {
                        var selected = data1.list[0] ? SIDE_NAV_ITEMD : THIS;
                        othis1.addClass(selected).siblings().removeClass(selected); //标记选择器
                        return false;
                    }
                    
                });
            }
        
        //重置状态
        sideMenu.find('.' + THIS).removeClass(THIS);
        
        //移动端点击菜单时自动收缩
        if (admin.screen() < 2) admin.sideFlexible();
        
        //开始捕获
        matchMenu(sideMenu.children('li'));
    });
    
    // 监听侧边导航点击事件
    element.on('nav(layadmin-system-side-menu)', function (elem) {
        if (elem.siblings('.layui-nav-child')[0] && container.hasClass(SIDE_SHRINK)) {
            admin.sideFlexible('spread');
            layer.close(elem.data('index'));
        }
        admin.tabsPage.type = 'nav';
    });
    
    // 监听选项卡的更多操作
    element.on('nav(layadmin-pagetabs-nav)', function (elem) {
        var dd = elem.parent();
        dd.removeClass(THIS);
        dd.parent().removeClass(SHOW);
    });
    
    // 同步路由
    var setThisRouter = function (othis) {
        var layid = othis.attr('lay-id'),
            attr = othis.attr('lay-attr'),
            index = othis.index();
        
        location.hash = layid === setter.entry ? '/' : (attr || '/');
        admin.tabsBodyChange(index);
    }, TABS_HEADER = '#LAY_app_tabsheader>li';
    
    // 页面标签点击
    $body.on('click', TABS_HEADER, function () {
        var othis = $(this),
            index = othis.index();
        
        admin.tabsPage.type = 'tab';
        admin.tabsPage.index = index;
        
        //如果是iframe类型的标签页
        if (othis.attr('lay-attr') === 'iframe') {
            return admin.tabsBodyChange(index);
        }
        
        setThisRouter(othis); //同步路由
        admin.runResize(); //执行resize事件，如果存在的话
        admin.resizeTable(); //重置当前主体区域的表格尺寸
    });
    
    // 监听 tabspage 删除
    element.on('tabDelete(layadmin-layout-tabs)', function (obj) {
        var othis = $(TABS_HEADER + '.layui-this');
        
        obj.index && admin.tabsBody(obj.index).remove();
        setThisRouter(othis);
        
        //移除resize事件
        admin.delResize();
    });
    
    // 页面跳转
    $body.on('click', '*[lay-href]', function () {
        var othis = $(this),
            href = othis.attr('lay-href'),
            router = layui.router();
        admin.tabsPage.elem = othis;
        
        var local = layui.data(setter.tableName);
        
        admin.prevRouter.title = admin.currentRouter.title;
        admin.prevRouter.href = router.href;
        local.prevRouter = local.prevRouter || {};
        
        layui.data(setter.tableName, {
            key: 'prevRouter',
            value: admin.prevRouter
        });
        
        //执行跳转
        location.hash = admin.correctRouter(href);
    });
    
    // 点击事件
    $body.on('click', '*[layadmin-event]', function () {
        var othis = $(this),
            attrEvent = othis.attr('layadmin-event');
        
        events[attrEvent] && events[attrEvent].call(this, othis);
    });
    
    // tips
    $body.on('mouseenter', '*[lay-tips]', function () {
        var othis = $(this);
        
        if (othis.parent().hasClass('layui-nav-item') && !container.hasClass(SIDE_SHRINK)) return;
        
        var tips = othis.attr('lay-tips'),
            offset = othis.attr('lay-offset'),
            direction = othis.attr('lay-direction'),
            color = othis.attr('lay-color'),
            index = layer.tips(tips, this, {
                tips: [admin.screen() < 1 ? 3 : direction || 1, color || '#333333'],
                time: -1,
                id: "globalTips",
                tipsMore: true,
                success: function (layero, index) {
                    if (offset) {
                        var position = offset.split(",");
                        layero.css({
                            'margin-left': position[0] + 'px',
                            'margin-top': position[1] + 'px'
                        });
                    }
                }
            });
        othis.data('index', index);
        
    }).on('mouseleave', '*[lay-tips]', function () {
        layer.close($(this).data('index'));
    });
    
    // 窗口resize事件
    var resizeSystem = layui.data.resizeSystem = function () {
        //layer.close(events.note.index);
        layer.closeAll('tips');
        
        if (!resizeSystem.lock) {
            setTimeout(function () {
                admin.sideFlexible(admin.screen() < 2 ? '' : 'spread');
                delete resizeSystem.lock;
            }, 100);
        }
        
        resizeSystem.lock = true;
    }
    
    $win.on('resize', layui.data.resizeSystem);
    
    String.prototype.trim = function () {
        return this.replace(/(^\s*)|(\s*$)/g, "");
    };
    
    //接口输出
    exports('admin', admin);
});
