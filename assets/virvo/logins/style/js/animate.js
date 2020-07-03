$(function() {

    //Click "library desc" scroll to ...
    $('#libdescIndex').on('click', function() {
        // $(window).scrollTop
        $('html,body').animate({
            scrollTop : $('#libdesc').offset().top - 30
        });
    });

    $('#DMA').on('click', function() {
        // $(window).scrollTop
        $('html,body').animate({
            scrollTop : $('#screenIphoneImage').offset().top - 150
        });
    });


    $('#PT').on('click', function() {
        // $(window).scrollTop
        $('html,body').animate({
            scrollTop : $('#s6TitleImage').offset().top - 350
        });
    });

    //setting default
    //S2
    $('#screen2Image1, #screen2Image2, #screen2Image3, #screen2Image4').css({
        width : 100,
        height : 100,
        left : 100,
        top : 50,
        opacity : 0
    });

    //S3
     $('#screen3Image').css({
     'margin-left' : '-100px',
     'opacity' : '0'
     }).hide();
     
    $('#s3TitleImage').css({
        top : 130,
        opacity : 0
    });
    $('#s3Description').css({
        top : 273,
        opacity : 0
    });
    
    $('#s3IconShandle').css({
        top: 263,
        opacity: 0
    });
    
    //S4
    $('#screen4Image').css({
        left : 100,
        opacity : 0
    }).hide();

    $('#s4List').css({
        top : 252,
        opacity : 0
    });
    $('#s4TitleImage').css({
        top : -20,
        opacity : 0
    });

    //S5
    $('#screen5Image').css({
        left : 100,
        opacity : 0
    }).hide();

    $('#s5TitleImage').css({
        top : -20,
        opacity : 0
    });
    $('#s5Description').css({
        top : 307,
        opacity : 0
    });
    //S6
    $('#s6TitleImage').css({
        top : 250,
        opacity : 0
    });
    $('#s6Description').css({
        top : 20,
        opacity : 0
    });

    //S6-1
    $('#screen6Image1').css({
        left : 100,
        top : 120,
        opacity : 0,
        zIndex : 3
    }).hide();

    //S6-2
    $('#screen6Image2').css({
        left : 200,
        top : 30,
        opacity : 0,
        zIndex : 2
    }).hide();

    //S6-3
    $('#screen6Image3').css({
        left : 300,
        top : -53,
        opacity : 0,
        zIndex : 1
    }).hide();

    //S7
    $('#s7TitleImage').css({
        top : 70,
        opacity : 0
    });

    $('#s7Description').css({
        top : 225,
        opacity : 0
    });

    //S7-1
    $('#screen7Image1').css({
        top : 10,
        left : 148,
        opacity : 0
    }).hide();

   /* //S7-2
    $('#screen7Image2').css({
        top : '-70px',
        opacity : 0
    }).hide();

    //S7-3
    $('#screen7Image3').css({
        top : '-30px',
        left : -148,
        opacity : 0
    }).hide();*/
});

var setScreen2Animate = function(id) {

    var _options = {
        overDuration : 200,
        outDuration : 100,
        over : {
            width : 210,
            height : 210,
            left : 45,
            top : -5,
            opacity : 1
        },
        out : {
            width : 200,
            height : 200,
            left : 50,
            top : 0,
            opacity : 1
        }
    };

    $(id).stop().animate(_options.over, _options.overDuration, '', function() {
        $(id).stop().animate(_options.out, _options.outDuration);
    });

    $(id).on('mouseenter', function() {
        $(this).stop().animate(_options.over, _options.overDuration);
    });

    $(id).on('mouseleave', function() {
        $(this).stop().animate(_options.out, _options.outDuration);
    });
};

var scrollSet = function() {
    var windowScrollTop = $(window).scrollTop();
    var screenHeight = $(window).height();

    // console.log((windowScrollTop) + ' ' + ($('#screen2Image1').offset().top - screenHeight ) + ' ' + screenHeight);

    //S2
    if (windowScrollTop > ($('#screen2Image1').offset().top - screenHeight + 150) && $('#screen2Image1').data('animate') == "0") {

        setScreen2Animate('#screen2Image1');
        $('#screen2Image1').data('animate', 1);

        setTimeout(function() {
            setScreen2Animate('#screen2Image2');
        }, 150);

        setTimeout(function() {
            setScreen2Animate('#screen2Image3');
        }, 300);

        setTimeout(function() {
            setScreen2Animate('#screen2Image4');
        }, 450);
    }

    //S3
    if (windowScrollTop > 980 && $('#screen3Image').data('animate') == "0") {

        $('#screen3Image').animate({
         'margin-left' : '-15px',
         'opacity' : 1
         }, 1000).show().data('animate', 1);
         
         $('#s3IconShandle').animate({
             top: 243,
             opacity: 1
         });
         
        $('#s3TitleImage').animate({
            top : 150,
            opacity : 1
        });
        $('#s3Description').animate({
            top : 253,
            opacity : 1
        });
    }

    //S4
    if (windowScrollTop > 1680 && $('#screen4Image').data('animate') == "0") {
        $('#screen4Image').animate({
            'left' : '0px',
            'opacity' : 1
        }, 1000).show().data('animate', 1);

        $('#s4List').animate({
            top : 232,
            opacity : 1
        });
        $('#s4TitleImage').animate({
            top : 0,
            opacity : 1
        });
    }
    
    //add iphone clean 
    if (windowScrollTop > ( $('#screenIphoneOffset').offset().top - screenHeight + 400 ) && $('#screenIphoneImage').data('animate') == "0") {
        
        $('#screenIphoneImage').animate({
            left : '0px',
            opacity : 1
        }, 1000).show().data('animate', 1);
        
        $('#IphoneTitleImage').animate({
            top : 0,
            opacity : 1
        });

        $('#IphoneDescription').animate({
            top : 287,
            opacity : 1
        });
    }

    //S5
    if (windowScrollTop > ( $('#screen5Offset').offset().top - screenHeight + 400 ) && $('#screen5Image').data('animate') == "0") {
        $('#screen5Image').animate({
            left : '0px',
            opacity : 1
            
        }, 1000).show().data('animate', 1);
        $('#s5TitleImage').animate({
            top : 0,
            opacity : 1
        });

        $('#s5Description').animate({
            top : 287,
            opacity : 1
        });
    }

    //S6
    // console.log( windowScrollTop + ' ' + ($('#screen6AnimateOffset').offset().top - screenHeight + 400) );
    if (windowScrollTop > ($('#screen6AnimateOffset').offset().top - screenHeight + 400 ) && $('#screen6Image1').data('animate') == "0") {

        //S6-1
        $('#screen6Image1').animate({
            left : 0,
            opacity : 1
        }, 1000).show().data('animate', 1);

        $('#s6TitleImage').animate({
            top : 270,
            opacity : 1
        });

        $('#s6Description').animate({
            top : 0,
            opacity : 1
        });

        //S6-2
        setTimeout(function() {
            $('#screen6Image2').animate({
                left : 100,
                opacity : 1
            }, 1000).show();
        }, 200);

        //S6-3
        setTimeout(function() {
            $('#screen6Image3').animate({
                left : 200,
                opacity : 1
            }, 1000).show();
        }, 500);
    }

    //S7
    if (windowScrollTop > ($('#screen7AnimateOffset').offset().top - screenHeight + 150 ) /*&& $('#screen7Image2').data('animate') == "0"*/) {

        $('#s7TitleImage').animate({
            top : 90,
            opacity : 1
        });

        $('#s7Description').animate({
            top : 205,
            opacity : 1
        });

        //S7-1
        setTimeout(function() {
            $('#screen7Image1').animate({
                top : 100,
                left : 0,
                opacity : 1
            }, 700).show();
        }, 300);

    /*    //S7-2
        $('#screen7Image2').animate({
            top : 0,
            opacity : 1
        }, 1000).show().data('animate', 1);

        //S7-3
        setTimeout(function() {
            $('#screen7Image3').animate({
                top : 0,
                left : 0,
                opacity : 1
            }, 1000).show();
        }, 800);*/
    }
};

setTimeout(function() {
    scrollSet();
    $(window).scroll(scrollSet);
}, 200);
/**
 * Banner 动画
 */
$(function() {

    //自定义变量

    var _setting = {
        moving : false, //是否正在做动画
        movingIndex : 0, //当前显示的索引
        movingIndexLast : 0, //最后一个显示索引
        timer : null, //定时器
        tabTimer : 3000, //Tab切换时间 ms
        moveBlockAnimationName : 'linear', //移动动画名称
        moveBlockDuration : 200, //移动速度
        moveBlockHeight : 56, //定义移动块高度

        mainDuration : 300 //banner主动画速度
    };

    //动画
    var _animate = {
        tab1 : {
            mouseIn : function() {

                $('#tab-show-1').css({
                    left : 300,
                    top : 21,
                    opacity : 0
                }).show();

                $('#tab-show-1-font').css({
                    left : 52,
                    top : 300,
                    opacity : 0
                }).show();

                $('#tab-show-1').animate({
                    top : 21,
                    left : 184,
                    opacity : 1
                    //filter: 'alpha(opacity:100)'
                    //zoom:1
                }, _setting.mainDuration);
                $('#tab-show-1-font').animate({
                    top : 150,
                    left : 52,
                    opacity : 1
                }, _setting.mainDuration);

            },
            mouseOut : function() {

                $('#tab-show-1').animate({
                    top : 21,
                    left : 100,
                    opacity : 0
                }, _setting.mainDuration, '', function() {
                    $('#tab-show-1').hide();
                });
                $('#tab-show-1-font').animate({
                    top : 80,
                    left : 52,
                    opacity : 0
                }, _setting.mainDuration, '', function() {
                    $('#tab-show-1-font').hide();
                });
            }
        },
        tab2 : {
            mouseIn : function() {

                $('#tab-show-2').css({
                    left : 300,
                    top : 21,
                    opacity : 0
                }).show();
                $('#tab-show-2-font').css({
                    left : 52,
                    top : 300,
                    opacity : 0
                }).show();

                $('#tab-show-2').stop().animate({
                    top : 21,
                    left : 184,
                    opacity : 1
                }, _setting.mainDuration);
                $('#tab-show-2-font').stop().animate({
                    top : 150,
                    left : 52,
                    opacity : 1
                }, _setting.mainDuration);
            },
            mouseOut : function() {

                $('#tab-show-2').stop().animate({
                    top : 21,
                    left : 100,
                    opacity : 0
                }, _setting.mainDuration, '', function() {
                    $('#tab-show-2').hide();
                });
                $('#tab-show-2-font').stop().animate({
                    top : 80,
                    left : 52,
                    opacity : 0
                }, _setting.mainDuration, '', function() {
                    $('#tab-show-2-font').hide();
                });
            }
        },
        tab3 : {
            mouseIn : function() {
                $('#tab-show-3').css({
                    left : 230,
                    top : 31,
                    opacity : 0
                }).show();
                $('#tab-show-3-font').css({
                    left : 52,
                    top : 300,
                    opacity : 0
                }).show();

                $('#tab-show-3').stop().animate({
                    top : 31,
                    left : 114,
                    opacity : 1
                }, _setting.mainDuration);
                $('#tab-show-3-font').stop().animate({
                    top : 150,
                    left : 52,
                    opacity : 1
                }, _setting.mainDuration);
            },
            mouseOut : function() {
                $('#tab-show-3').stop().animate({
                    top : 31,
                    left : 100,
                    opacity : 0
                }, _setting.mainDuration, '', function() {
                    $('#tab-show-3').hide();
                });
                $('#tab-show-3-font').stop().animate({
                    top : 80,
                    left : 52,
                    opacity : 0
                }, _setting.mainDuration, '', function() {
                    $('#tab-show-3-font').hide();
                });
            }
        },
        tab4 : {
            mouseIn : function() {
                $('#tab-show-4').css({
                    left : 306,
                    top : 20,
                    opacity : 0
                }).show();
                $('#tab-show-4-font').css({
                    left : 52,
                    top : 300,
                    opacity : 0
                }).show();

                $('#tab-show-4').stop().animate({
                    top : 20,
                    left : 236,
                    opacity : 1
                }, _setting.mainDuration);
                $('#tab-show-4-font').stop().animate({
                    top : 150,
                    left : 52,
                    opacity : 1
                }, _setting.mainDuration );
            },
            mouseOut : function() {
                $('#tab-show-4').stop().animate({
                	left : 106,
                    top : 20,
                    opacity : 0
                }, _setting.mainDuration, '', function() {
                    $('#tab-show-4').hide();
                });
                $('#tab-show-4-font').stop().animate({
                    top : 80,
                    left : 52,
                    opacity : 0
                }, _setting.mainDuration, '', function() {
                    $('#tab-show-4-font').hide();
                });
            }
        },
        tab5 : {
            mouseIn : function() {
                $('#tab-show-5').css({
                    left : 270,
                    top : 41,
                    opacity : 0
                }).show();
                $('#tab-show-5-font').css({
                    left : 52,
                    top : 300,
                    opacity : 0
                }).show();

                $('#tab-show-5').stop().animate({
                    top : 41,
                    left : 154,
                    opacity : 1
                }, _setting.mainDuration);
                $('#tab-show-5-font').stop().animate({
                    top : 150,
                    left : 52,
                    opacity : 1
                }, _setting.mainDuration);
            },
            mouseOut : function() {
                $('#tab-show-5').stop().animate({
                    top : 41,
                    left : 100,
                    opacity : 0
                }, _setting.mainDuration, '', function() {
                    $('#tab-show-5').hide();
                });
                $('#tab-show-5-font').stop().animate({
                    top : 80,
                    left : 52,
                    opacity : 0
                }, _setting.mainDuration, '', function() {
                    $('#tab-show-5-font').hide();
                });
            }
        },
        tab6: {
        	mouseIn : function() {
                $('#tab-show-6').css({
                    left : 290,
                    top : 26,
                    opacity : 0
                }).show();
                $('#tab-show-6-font').css({
                    left : 52,
                    top : 300,
                    opacity : 0
                }).show();

                $('#tab-show-6').stop().animate({
                    top : 26,
                    left : 174,
                    opacity : 1
                }, _setting.mainDuration);
                $('#tab-show-6-font').stop().animate({
                    top : 150,
                    left : 52,
                    opacity : 1
                }, _setting.mainDuration);
            },
            mouseOut : function() {
                $('#tab-show-6').stop().animate({
                    top : 26,
                    left : 100,
                    opacity : 0
                }, _setting.mainDuration, '', function() {
                    $('#tab-show-6').hide();
                });
                $('#tab-show-6-font').stop().animate({
                    top : 80,
                    left : 52,
                    opacity : 0
                }, _setting.mainDuration, '', function() {
                    $('#tab-show-6-font').hide();
                });
            }
        }
    };

    var debug = function(string) {
        try {
            // console.log(string);
        } catch(e) {
            return;
        }
    };

    //移动实例
    var moveEntity = function() {
        if (_setting.moving) {
            return;
        };
        debug("当前实例：" + (_setting.movingIndex + 1));

        //set button style
        $('#bannerTab li').each(function(i, el) {
            if (i == _setting.movingIndex) {
                moving(el);
                $(el).find('a').addClass('curr');
            } else {
                $(el).find('a').removeClass('curr');
            }
        });

        //animate in
        if (_setting.movingIndex == 0) {
            _animate.tab1.mouseIn();
        } else if (_setting.movingIndex == 1) {
            _animate.tab2.mouseIn();
        } else if (_setting.movingIndex == 2) {
            _animate.tab3.mouseIn();
        } else if (_setting.movingIndex == 3) {
            _animate.tab4.mouseIn();
        } else if (_setting.movingIndex == 4) {
            _animate.tab5.mouseIn();
        } else if ( _setting.movingIndex == 5 ) {
        	_animate.tab6.mouseIn();
        }

        //animate out
        if (_setting.movingIndex == 0 && _setting.movingIndexLast == 0) {

        } else if (_setting.movingIndexLast == 0) {
            _animate.tab1.mouseOut();
        } else if (_setting.movingIndexLast == 1) {
            _animate.tab2.mouseOut();
        } else if (_setting.movingIndexLast == 2) {
            _animate.tab3.mouseOut();
        } else if (_setting.movingIndexLast == 3) {
            _animate.tab4.mouseOut();
        } else if (_setting.movingIndexLast == 4) {
            _animate.tab5.mouseOut();
        } else if (_setting.movingIndexLast == 5) {
            _animate.tab6.mouseOut();
        }

        _setting.movingIndexLast = _setting.movingIndex;

        _setting.movingIndex++;
        if (_setting.movingIndex > 5) {
            _setting.movingIndex = 0;
        };
    };

    //鼠标移动到焦点
    var mouseenterEntity = function(el) {
        stopTimer();
        var elIndex = parseInt($(el.currentTarget).data('index'), 10);

        debug('Mouseenter: ' + _setting.movingIndex + ' ' + elIndex);

        //当鼠标移动到已经是焦点的元素时,直接返回
        if (_setting.movingIndexLast == elIndex)
            return;

        //设置将要移动到的索引
        _setting.movingIndex = parseInt($(el.currentTarget).data('index'), 10);

        moving(el, '', function() {
            moveEntity();
        });
    };

    /**
     *
     * @param {Object} 移动的对象
     * @param {Function} 移动中回调
     * @param {Function} 移动完成回调
     */
    var moving = function(el, movingFunction, callback) {

        //判断是否需要移动
        var tmpInterval = null;
        var top = parseInt($('.banner-moveblock .block').css('top'), 10);
        var moveTo = _setting.movingIndex * _setting.moveBlockHeight;
        if (top == moveTo)
            return;
        if ( typeof movingFunction == 'function')
            tmpInterval = setInterval(movingFunction, 20);
        $('.banner-moveblock .block').stop().animate({
            top : moveTo
        }, _setting.moveBlockDuration, _setting.moveBlockAnimationName, function() {

            if ( typeof callback == 'function')
                callback();

            if (tmpInterval != null)
                clearInterval(tmpInterval);
        });
    };

    //鼠标离开焦点
    var mouseleaveEntity = function(el) {
        startTimer();
    };

    //启动定时器
    var startTimer = function() {
        _setting.timer = setInterval(moveEntity, _setting.tabTimer);
    };

    //停止定时器
    var stopTimer = function() {
        if (_setting.timer != null)
            clearInterval(_setting.timer);
    };

    //绑定鼠标事件
    $('#bannerTab li').on('mouseenter', mouseenterEntity);
    $('#bannerTab li').on('mouseleave', mouseleaveEntity);

    //初始启动
    startTimer();
    moveEntity();
    setTimeout(moveEntity, 1000);
});

/**
 * 中部第三屏切换动画
 */
$(function() {

    var _options = {
        defaultIndex : 0,
        duration : 1500,
        
        _timer : null,
        _lastIndex: 0
    };

    var s3 = {
        debug : function(string) {
            try {
                // console.log(string);
            } catch( e) {
            }
        },
        show : function() {
            s3.debug('show: ' + _options.defaultIndex);
            
            var shandleId = "shandle-" + _options.defaultIndex;
            var histogramId = "histogram-" + _options.defaultIndex;
            var histogramIconId = "histogram-icon-" + _options.defaultIndex;
            
            $('.s3-icon .list .icon').css({
                background: 'url(/static/virvo/logins/style/images/bg-gray.png)'
            });
            $('.histogram div').hide();
            $('.histogram-icon div').css({
                backgroundPositionY: 0
            });
            
            
            $('.s3-icon .list #' + shandleId).css({
                background: 'url(/static/virvo/logins/style/images/bg-green.png)'
            });
            $('.histogram #' + histogramId).fadeIn(200);
            $('.histogram-icon #' + histogramIconId ).css({
                backgroundPositionY: -13
            });
            
            
            _options._lastIndex = _options.defaultIndex; 
            _options.defaultIndex++;
            if (_options.defaultIndex > 7) {
                _options.defaultIndex = 0;
            };
        },
        enter : function() {
            s3.stopTimer();

            var now = parseInt($(this).data('index'), 10);
            console.log( now + ' ' + _options._lastIndex);
            if (_options._lastIndex == now)
                return;
                
            _options.defaultIndex = now;
            s3.show();

        },
        leave : function() {
            s3.startTimer();

        },
        startTimer : function() {
            _options._timer = setInterval(s3.show, _options.duration);
        },
        stopTimer : function() {
            if (_options._timer != null)
                clearInterval(_options._timer);
        }
    };

    $('.s3-icon .list .icon').on('mouseenter', s3.enter);
    $('.s3-icon .list .icon').on('mouseleave', s3.leave);

    s3.startTimer();
    s3.show();
});

