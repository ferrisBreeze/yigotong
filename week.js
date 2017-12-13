/**
 * Created by hexiaoguo on 2016/12/02.
 */

define(function (require, exports, module) {
    var $ = require('zepto');
    var Dialog = require('dialog');
    var Storage = require('Storage');
    var openUrl = require('modules/pick/active/open-url.js');
    var CAR_COUPON_WEEKSHOW = "CAR_COUPON_WEEKSHOW0";
	
	
	// 是否为图链
	var isImgLinks = 1 
	// 图链的链接
	var imgLinks = "//m.tuniu.com/m2015/car/carActive/travalHoliday"
	
	
    var cdn = window.m2015Config ? window.m2015Config.cdnHost : '';
    var couponWrap,
        couponInner,
        couponPage,
        getCouponBtn,
        closeBtn;
    var isLogin = $('#isLogin').val(); //是否登录
    var isNative = $('#popForNative').val(); //是否在native中
    var strClose;
        if (!isNative) {
            strClose = '<i class="iconclose J_close"><img src="' + cdn + "/site/m2015/images/car/coupon/shut.png" + '" alt=""></i>'
        } else {
            strClose = '<i class="iconclose J_close"><a href="javascript:javascript.close()"><img src="' + cdn + "/site/m2015/images/car/coupon/shut.png" + '" alt=""></a></i>'
        }
    var localCache = new Storage({
        type: 'local'
    });
    var newDate = new Date(),
        today = newDate.getFullYear()+'/'+(newDate.getMonth()+1)+'/'+newDate.getDate(),
        todayTimestamp =  Date.parse(today);
    var weeks = newDate.getDay(),
        sunday, inter = 24*60*60*1000;
    var coupon = {
        /*   判定当前状态，
         2(未领取)显示添加手机领取红包页面，
         1（领取成功）显示领取成功页面，
         0（领取失败）不显示红包页面
         */
        customState: '',
        htmlWrap: '<div class="coupon-tip-wrap coupon-tip-index hide J_coupon">'
            //<!--蒙层-->
        + '<div class="mask active">&nbsp;</div>'
        + '<div class="coupon-box">'
        + '<div class="inner-content">'
        + strClose
            //<!--未登录-->
        + '<div class="coupon-page page-one hide">'
        + '<img src="' + cdn + "/site/m2015/images/car/coupon/pop-1201.png" + '" alt="">'
        + '<input type="text" value="" placeholder="输入手机号，惊喜从天降！" maxlength=11>'
        + '<button class="J_getCoupon">&nbsp;</button>'
        + '</div>'

            /*输入号码后弹出层*/
        + '<div class="coupon-page hide">'
        + '<img src="' + cdn + "/site/m2015/images/car/coupon/pop-1201-list.png" + '" alt="">'
        + '</div>'

            //<!--已登录-->
        + '<div class="coupon-page hide">'
        + '<img src="' + cdn + "/site/m2015/images/car/coupon/pop-1201-list-login.png" + '" alt="">'
        + '</div> </div> </div> </div>',
		
		// 图链的html
		htmlImgLinksWrap: '<div class="coupon-tip-wrap coupon-tip-index J_coupon showToMiddle">'
            //<!--蒙层-->
        + '<div class="mask active">&nbsp;</div>'
        + '<div class="coupon-box">'
        + '<div class="inner-content">'
        + strClose
        + '<div class="coupon-page">'
        + '<a href="'+ imgLinks +'"><img src="' + cdn + "/site/m2015/images/car/coupon/active.png" + '" alt=""></a>'
        + '</div> </div> </div> </div>',
		
		

        getActiveStatus: function (callback) {
            $.ajax({
                url: '/event/lottery/util/getTimeOneAjax?actId=1827',
                dataType: 'json',
                type: 'get',
                data: '',
                success: function (res) {
					res.data.status && callback(res);
                }
            });
        },
        setCustomState: function (tel, fun) {
            var self = this;
            $.ajax({
                url: '/event/lottery/opeLottery/lotteryAndSendAjax',
                dataType: 'json',
                type: 'get',
                data: {
                    "tel": tel ? tel : '',
                    "actId": 1827,
                    "mark": 'yctjhb4',
                    "offCode": '',
                    "type": tel ? 1 : 0, //登录了则不填手机号
                    "one": 0 //只为一次
                },
                success: function (data) {
                    if (data.success) {
                        /*如果未中奖则提示失败*/
                        if (data.data.status != 1) {
                            Dialog.tip(data.msg);
                        }
                        self.customState = data.data.status;
                    } else {
                        /*已输入手机号码，提示*/
                        if (tel) {
                            if (data.errorCode == 710008) {
                                Dialog.tip('亲，你已经抢过礼品了，把机会让给其他小伙伴吧');
                            } else {
                                self.customState = '';
                                Dialog.tip(data.msg);
                            }
                        }
                    }
                    if(fun) fun();

                    // 在native中终止后续动作
                    if (isNative) return;

                    self.initShowPage();
                }
            });

        },
        /*绑定节点事件*/
        bindEvent: function () {
            var self = this;
            couponWrap = $(".J_coupon");
            couponInner = couponWrap.find(".inner-content");
            couponPage = couponWrap.find(".coupon-page");
            getCouponBtn = couponWrap.find(".J_getCoupon");
            closeBtn = couponWrap.find(".J_close");
			openUrlBtn = couponWrap.find(".open-url");
            closeBtn.on('click', function () {
                couponWrap.addClass('hide');
            });
			
			openUrlBtn.on('click', function () {
				couponWrap.addClass('hide');
				location.href = openUrl(isNative, '/m2015/car/carActive/Festival?car=yy&apd=yy&train=yy&abroad=yy');
            });
			
            // native中已登录后 后续不再执行
            if(this.GetQueryString('isLogin') == 1) return;

            if(!isLogin){
                couponWrap.removeClass('hide');
                couponPage.eq(0).removeClass('hide');
                couponInner.addClass('showToMiddle');
            }
            getCouponBtn.on('click', function () {
                var telVal = $(this).prev('input').val();
                if (!(/^1[3|4|5|7|8]\d{9}$/.test(telVal))) {
                    Dialog.tip('手机号码格式不正确');
                } else {
                    self.customState = 0;
                    self.setCustomState(telVal, function(){
                        if (self.customState == 1) {
                            couponPage.eq(0).addClass('hide');
                            couponPage.eq(1).removeClass('hide');
                            couponInner.addClass('showToMiddle');
                        }
                        self.customState = 0;
                    });
                }
            });
            if (weeks != 0) {
                sunday = todayTimestamp + (8 - weeks)*inter - 1
            } else {
                sunday = todayTimestamp + inter - 1
            }
            localCache.set(CAR_COUPON_WEEKSHOW, [sunday, 1]);
        },
        initShowPage: function () {
            var self = this;
            switch (self.customState) {
                case 2:
                    couponWrap.removeClass('hide');
                    couponPage.eq(0).removeClass('hide');
                    couponInner.addClass('showToMiddle');
                    break;
                case 1:
                    couponWrap.removeClass('hide');
                    couponPage.eq(2).removeClass('hide');
                    couponInner.addClass('showToMiddle');
                    break;
                case 0:
                    break;
                default:
                    couponWrap.addClass('hide')
            }
        },
        GetQueryString: function(par) {
            var local_url = location.href;
            var get = local_url.indexOf(par +"=");
            if(get == -1){
                return false;
            }
            var get_par = local_url.slice(par.length + get + 1);
            var nextPar = get_par.indexOf("&");
            if(nextPar != -1){
                get_par = get_par.slice(0, nextPar);
            }
            return get_par;
        },
        native: function(){
            var queryLogin = this.GetQueryString('isLogin');
            this.bindEvent();
            queryLogin == 0 ? this.customState = 2 : this.customState = 1
            this.initShowPage();
        },

        init: function () {
            var self = this;
            // 判断是在native中
            if (isNative) {
                $('body').append(self.htmlWrap);
                this.native();
            } else {
                var hasShow = localCache.get(CAR_COUPON_WEEKSHOW);
                if (hasShow && todayTimestamp < hasShow[0]) {
                    return;
                }
				
				// 图链
				
				//if(isImgLinks) {
				//	$('body').append(self.htmlImgLinksWrap);
				//	self.bindEvent();
				//	return;
				//}
				
                if (hasShow && isLogin) {
                   return;
                }
                /*当在互动期内则展示活动信息*/
                self.getActiveStatus(function () {
                    $('body').append(self.htmlWrap);
                    self.bindEvent();
                    /*模板渲染*/
                    if(isLogin) {
                      self.setCustomState();
                    }
                });
            }
        }
    };
    module.exports = coupon;
});
