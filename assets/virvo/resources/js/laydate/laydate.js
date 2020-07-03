/*! laydate-v5.0.2 日期与时间组件 MIT License  http://www.layui.com/laydate/  By 贤心 */
!
function() {
	var s = window.layui && layui.define,
	o = {
		getPath: function() {
			var A = document.scripts,
			y = A[A.length - 1],
			z = y.src;
			if (y.getAttribute("merge")) {
				return
			}
			return z.substring(0, z.lastIndexOf("/") + 1)
		} (),
		getStyle: function(A, y) {
			var z = A.currentStyle ? A.currentStyle: window.getComputedStyle(A, null);
			return z[z.getPropertyValue ? "getPropertyValue": "getAttribute"](y)
		},
		link: function(y, F, z) {
			if (!l.path) {
				return
			}
			var G = document.getElementsByTagName("head")[0],
			E = document.createElement("link");
			if (typeof F === "string") {
				z = F
			}
			var B = (z || y).replace(/\.|\//g, "");
			var A = "layuicss-" + B,
			D = 0;
			E.rel = "stylesheet";
			E.href = l.path + y;
			E.id = A;
			if (!document.getElementById(A)) {
				G.appendChild(E)
			}
			if (typeof F !== "function") {
				return
			} (function C() {
				if (++D > 8 * 1000 / 100) {
					return window.console && console.error("laydate.css: Invalid")
				}
				parseInt(o.getStyle(document.getElementById(A), "width")) === 1989 ? F() : setTimeout(C, 100)
			} ())
		}
	},
	l = {
		v: "5.0.2",
		config: {},
		index: (window.laydate && window.laydate.v) ? 100000 : 0,
		path: o.getPath,
		set: function(y) {
			var z = this;
			z.config = o.extend({},
			z.config, y);
			return z
		},
		ready: function(A) {
			var z = "laydate",
			y = "",
			B = (s ? "modules/laydate/": "theme/") + "default/laydate.css?v=" + l.v + y;
			s ? layui.addcss(B, A, z) : o.link(B, A, z);
			return this
		}
	},
	r = function() {
		var y = this;
		return {
			hint: function(z) {
				y.hint.call(y, z)
			},
			config: y.config
		}
	},
	k = "laydate",
	d = ".layui-laydate",
	j = "layui-this",
	g = "layui-show",
	u = "layui-hide",
	v = "laydate-disabled",
	c = "开始日期超出了结束日期<br>建议重新选择",
	q = [100, 200000],
	h = "layui-laydate-list",
	n = "laydate-selected",
	x = "layui-laydate-hint",
	a = "laydate-day-prev",
	b = "laydate-day-next",
	w = "layui-laydate-footer",
	p = ".laydate-btns-confirm",
	f = "laydate-time-text",
	m = ".laydate-btns-time",
	t = function(y) {
		var z = this;
		z.index = ++l.index;
		z.config = e.extend({},
		z.config, l.config, y);
		l.ready(function() {
			z.init()
		})
	},
	e = function(y) {
		return new i(y)
	},
	i = function(y) {
		var z = 0,
		A = typeof y === "object" ? [y] : (this.selector = y, document.querySelectorAll(y || null));
		for (; z < A.length; z++) {
			this.push(A[z])
		}
	};
	i.prototype = [];
	i.prototype.constructor = i;
	e.extend = function() {
		var y = 1,
		z = arguments,
		A = function(D, C) {
			D = D || (C.constructor === Array ? [] : {});
			for (var B in C) {
				D[B] = (C[B] && (C[B].constructor === Object)) ? A(D[B], C[B]) : C[B]
			}
			return D
		};
		z[0] = typeof z[0] === "object" ? z[0] : {};
		for (; y < z.length; y++) {
			if (typeof z[y] === "object") {
				A(z[0], z[y])
			}
		}
		return z[0]
	};
	e.ie = function() {
		var y = navigator.userAgent.toLowerCase();
		return ( !! window.ActiveXObject || "ActiveXObject" in window) ? ((y.match(/msie\s(\d+)/) || [])[1] || "11") : false
	} ();
	e.stope = function(y) {
		y = y || win.event;
		y.stopPropagation ? y.stopPropagation() : y.cancelBubble = true
	};
	e.each = function(B, z) {
		var y, A = this;
		if (typeof z !== "function") {
			return A
		}
		B = B || [];
		if (B.constructor === Object) {
			for (y in B) {
				if (z.call(B[y], y, B[y])) {
					break
				}
			}
		} else {
			for (y = 0; y < B.length; y++) {
				if (z.call(B[y], y, B[y])) {
					break
				}
			}
		}
		return A
	};
	e.digit = function(z, B, y) {
		var C = "";
		z = String(z);
		B = B || 2;
		for (var A = z.length; A < B; A++) {
			C += "0"
		}
		return z < Math.pow(10, B) ? C + (z | 0) : z
	};
	e.elem = function(A, y) {
		var z = document.createElement(A);
		e.each(y || {},
		function(B, C) {
			z.setAttribute(B, C)
		});
		return z
	};
	i.addStr = function(z, y) {
		z = z.replace(/\s+/, " ");
		y = y.replace(/\s+/, " ").split(" ");
		e.each(y,
		function(A, B) {
			if (!new RegExp("\\b" + B + "\\b").test(z)) {
				z = z + " " + B
			}
		});
		return z.replace(/^\s|\s$/, "")
	};
	i.removeStr = function(z, y) {
		z = z.replace(/\s+/, " ");
		y = y.replace(/\s+/, " ").split(" ");
		e.each(y,
		function(A, B) {
			var C = new RegExp("\\b" + B + "\\b");
			if (C.test(z)) {
				z = z.replace(C, "")
			}
		});
		return z.replace(/\s+/, " ").replace(/^\s|\s$/, "")
	};
	i.prototype.find = function(A) {
		var C = this;
		var B = 0,
		z = [],
		y = typeof A === "object";
		this.each(function(D, E) {
			var F = y ? [A] : E.querySelectorAll(A || null);
			for (; B < F.length; B++) {
				z.push(F[B])
			}
			C.shift()
		});
		if (!y) {
			C.selector = (C.selector ? C.selector + " ": "") + A
		}
		e.each(z,
		function(D, E) {
			C.push(E)
		});
		return C
	};
	i.prototype.each = function(y) {
		return e.each.call(this, this, y)
	};
	i.prototype.addClass = function(z, y) {
		return this.each(function(A, B) {
			B.className = i[y ? "removeStr": "addStr"](B.className, z)
		})
	};
	i.prototype.removeClass = function(y) {
		return this.addClass(y, true)
	};
	i.prototype.hasClass = function(z) {
		var y = false;
		this.each(function(A, B) {
			if (new RegExp("\\b" + z + "\\b").test(B.className)) {
				y = true
			}
		});
		return y
	};
	i.prototype.attr = function(y, A) {
		var z = this;
		return A === undefined ?
		function() {
			if (z.length > 0) {
				return z[0].getAttribute(y)
			}
		} () : z.each(function(B, C) {
			C.setAttribute(y, A)
		})
	};
	i.prototype.removeAttr = function(y) {
		return this.each(function(z, A) {
			A.removeAttribute(y)
		})
	};
	i.prototype.html = function(y) {
		return this.each(function(z, A) {
			A.innerHTML = y
		})
	};
	i.prototype.val = function(y) {
		return this.each(function(z, A) {
			A.value = y
		})
	};
	i.prototype.append = function(y) {
		return this.each(function(z, A) {
			typeof y === "object" ? A.appendChild(y) : A.innerHTML = A.innerHTML + y
		})
	};
	i.prototype.remove = function(y) {
		return this.each(function(z, A) {
			y ? A.removeChild(y) : A.parentNode.removeChild(A)
		})
	};
	i.prototype.on = function(y, z) {
		return this.each(function(A, B) {
			B.attachEvent ? B.attachEvent("on" + y,
			function(C) {
				C.target = C.srcElement;
				z.call(B, C)
			}) : B.addEventListener(y, z, false)
		})
	};
	i.prototype.off = function(y, z) {
		return this.each(function(A, B) {
			B.detachEvent ? B.detachEvent("on" + y, z) : B.removeEventListener(y, z, false)
		})
	};
	t.isLeapYear = function(y) {
		return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
	};
	t.prototype.config = {
		type: "date",
		range: false,
		format: "yyyy-MM-dd",
		value: null,
		min: "1900-1-1",
		max: "2099-12-31",
		trigger: "focus",
		show: false,
		showBottom: true,
		btns: ["clear", "now", "confirm"],
		lang: "cn",
		theme: "#6dcff6",
		position: null,
		calendar: false,
		mark: {},
		zIndex: null,
		done: null,
		change: null,
		showTimeLine: false
	};
	t.prototype.lang = function() {
		var z = this,
		y = z.config,
		A = {
			cn: {
				weeks: ["日", "一", "二", "三", "四", "五", "六"],
				time: ["时", "分", "秒"],
				timeTips: "选择时间",
				startTime: "开始时间",
				endTime: "结束时间",
				dateTips: "返回日期",
				month: ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"],
				tools: {
					confirm: "确定",
					clear: "清空",
					now: "现在"
				}
			},
			en: {
				weeks: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
				time: ["Hours", "Minutes", "Seconds"],
				timeTips: "Select Time",
				startTime: "Start Time",
				endTime: "End Time",
				dateTips: "Select Date",
				month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
				tools: {
					confirm: "Confirm",
					clear: "Clear",
					now: "Now"
				}
			}
		};
		return A[y.lang] || A["cn"]
	};
	t.prototype.init = function() {
		var B = this,
		z = B.config,
		A = "yyyy|y|MM|M|dd|d|HH|H|mm|m|ss|s",
		y = z.position === "static",
		C = {
			year: "yyyy",
			month: "yyyy-MM",
			date: "yyyy-MM-dd",
			time: "HH:mm:ss",
			datetime: "yyyy-MM-dd HH:mm:ss"
		};
		z.elem = e(z.elem);
		z.eventElem = e(z.eventElem);
		if (!z.elem[0]) {
			return
		}
		if (z.range === true) {
			z.range = "-"
		}
		if (z.format === C.date) {
			z.format = C[z.type]
		}
		B.format = z.format.match(new RegExp(A + "|.", "g")) || [];
		B.EXP_IF = "";
		B.EXP_SPLIT = "";
		e.each(B.format,
		function(D, F) {
			var E = new RegExp(A).test(F) ? "\\b\\d{1," +
			function() {
				if (/yyyy/.test(F)) {
					return 4
				}
				if (/y/.test(F)) {
					return 308
				}
				return 2
			} () + "}\\b": "\\" + F;
			B.EXP_IF = B.EXP_IF + E;
			B.EXP_SPLIT = B.EXP_SPLIT + (B.EXP_SPLIT ? "|": "") + "(" + E + ")"
		});
		B.EXP_IF = new RegExp("^" + (z.range ? B.EXP_IF + "\\s\\" + z.range + "\\s" + B.EXP_IF: B.EXP_IF) + "$");
		B.EXP_SPLIT = new RegExp(B.EXP_SPLIT, "g");
		if (!B.isInput(z.elem[0])) {
			if (z.trigger === "focus") {
				z.trigger = "click"
			}
		}
		if (!z.elem.attr("lay-key")) {
			z.elem.attr("lay-key", B.index);
			z.eventElem.attr("lay-key", B.index)
		}
		z.mark = e.extend({},
		(z.calendar && z.lang === "cn") ? {
			"0-1-1": "元旦",
			"0-2-14": "情人",
			"0-3-8": "妇女",
			"0-3-12": "植树",
			"0-4-1": "愚人",
			"0-5-1": "劳动",
			"0-5-4": "青年",
			"0-6-1": "儿童",
			"0-9-10": "教师",
			"0-9-18": "国耻",
			"0-10-1": "国庆",
			"0-12-25": "圣诞"
		}: {},
		z.mark);
		e.each(["min", "max"],
		function(G, I) {
			var J = [],
			H = [];
			if (typeof z[I] === "number") {
				var E = z[I],
				K = new Date().getTime(),
				F = 86400000,
				D = new Date(E ? (E < F ? K + E * F: E) : K);
				J = [D.getFullYear(), D.getMonth() + 1, D.getDate()];
				E < F || (H = [D.getHours(), D.getMinutes(), D.getSeconds()])
			} else {
				J = (z[I].match(/\d+-\d+-\d+/) || [""])[0].split("-");
				H = (z[I].match(/\d+:\d+:\d+/) || [""])[0].split(":")
			}
			z[I] = {
				year: J[0] | 0 || new Date().getFullYear(),
				month: J[1] ? (J[1] | 0) - 1 : new Date().getMonth(),
				date: J[2] | 0 || new Date().getDate(),
				hours: H[0] | 0,
				minutes: H[1] | 0,
				seconds: H[2] | 0
			}
		});
		B.elemID = "layui-laydate" + z.elem.attr("lay-key");
		if (z.show || y) {
			B.render()
		}
		y || B.events()
	};
	t.prototype.render = function() {
		var H = this,
		K = H.config,
		B = H.lang(),
		J = K.position === "static",
		E = H.elem = e.elem("div", {
			id: H.elemID,
			"class": ["layui-laydate", K.range ? " layui-laydate-range": "", J ? " layui-laydate-static": "", K.theme && K.theme !== "default" && !/^#/.test(K.theme) ? (" laydate-theme-" + K.theme) : ""].join("")
		}),
		G = H.elemMain = [],
		I = H.elemHeader = [],
		C = H.elemCont = [],
		A = H.table = [],
		F = H.footer = e.elem("div", {
			"class": w
		}),
		D = H.timeline = e.elem("div", {
			"class": "layui-laydate-time"
		});
		if (K.zIndex) {
			E.style.zIndex = K.zIndex
		}
		e.each(new Array(2),
		function(N) {
			if (!K.range && N > 0) {
				return true
			}
			var M = e.elem("div", {
				"class": "layui-laydate-header"
			}),
			R = [function() {
				var S = e.elem("i", {
					"class": "layui-icon laydate-icon laydate-prev-y"
				});
				S.innerHTML = "&#xe65a;";
				return S
			} (),
			function() {
				var S = e.elem("i", {
					"class": "layui-icon laydate-icon laydate-prev-m"
				});
				S.innerHTML = "&#xe603;";
				return S
			} (),
			function() {
				var S = e.elem("div", {
					"class": "laydate-set-ym"
				}),
				T = e.elem("span"),
				U = e.elem("span");
				S.appendChild(T);
				S.appendChild(U);
				return S
			} (),
			function() {
				var S = e.elem("i", {
					"class": "layui-icon laydate-icon laydate-next-m"
				});
				S.innerHTML = "&#xe602;";
				return S
			} (),
			function() {
				var S = e.elem("i", {
					"class": "layui-icon laydate-icon laydate-next-y"
				});
				S.innerHTML = "&#xe65b;";
				return S
			} ()],
			L = e.elem("div", {
				"class": "layui-laydate-content"
			}),
			O = e.elem("table"),
			Q = e.elem("thead"),
			P = e.elem("tr");
			e.each(R,
			function(S, T) {
				M.appendChild(T)
			});
			Q.appendChild(P);
			e.each(new Array(6),
			function(S) {
				var T = O.insertRow(0);
				e.each(new Array(7),
				function(U) {
					if (S === 0) {
						var V = e.elem("th");
						V.innerHTML = B.weeks[U];
						P.appendChild(V)
					}
					T.insertCell(U)
				})
			});
			O.insertBefore(Q, O.children[0]);
			L.appendChild(O);
			G[N] = e.elem("div", {
				"class": "layui-laydate-main laydate-main-list-" + N
			});
			G[N].appendChild(M);
			G[N].appendChild(L);
			I.push(R);
			C.push(L);
			A.push(O)
		});
		e(D).html(function() {
			var L = '<ul class="laydate-timeline-presets">' + '<li time-type="5">5分钟后<div class="laydate-time-button"></div></li>' + '<li time-type="10">10分钟后<div class="laydate-time-button"></div></li>' + '<li time-type="15">15分钟后<div class="laydate-time-button"></div></li>' + '<li time-type="20">20分钟后<div class="laydate-time-button"></div></li>' + "</ul>" + '<div class="laydate-timeline-bar"></div>';
			return L
		} ());
		e(F).html(function() {
			var L = [],
			M = [];
			if (K.type === "datetime") {
				L.push('<span lay-type="datetime" class="laydate-btns-time">' + B.timeTips + "</span>")
			}
			e.each(K.btns,
			function(N, O) {
				var P = B.tools[O] || "btn";
				if (K.range && O === "now") {
					return
				}
				if (J && O === "clear") {
					P = K.lang === "cn" ? "重置": "Reset"
				}
				M.push('<span lay-type="' + O + '" class="laydate-btns-' + O + '">' + P + "</span>")
			});
			L.push('<div class="laydate-footer-btns">' + M.join("") + "</div>");
			return L.join("")
		} ());
		e.each(G,
		function(M, L) {
			E.appendChild(L)
		});
		K.showBottom && E.appendChild(F);
		if (H.config.showTimeLine) {
			E.appendChild(D)
		}
		if (/^#/.test(K.theme)) {
			var z = e.elem("style"),
			y = ["#{{id}} .layui-laydate-header{background-color:{{theme}};}", "#{{id}} .layui-this{background-color:{{theme}} !important;}"].join("").replace(/{{id}}/g, H.elemID).replace(/{{theme}}/g, K.theme);
			if ("styleSheet" in z) {
				z.setAttribute("type", "text/css");
				z.styleSheet.cssText = y
			} else {
				z.innerHTML = y
			}
			e(E).addClass("laydate-theme-molv");
			E.appendChild(z)
		}
		H.remove();
		J ? K.elem.append(E) : (document.body.appendChild(E), H.position());
		H.checkDate().calendar();
		H.changeEvent();
		t.thisElem = H.elemID;
		typeof K.ready === "function" && K.ready(e.extend({},
		K.dateTime, {
			month: K.dateTime.month + 1
		}))
	};
	t.prototype.remove = function() {
		var A = this,
		y = A.config,
		z = e("#" + A.elemID);
		if (z[0] && y.position !== "static") {
			A.checkDate(function() {
				z.remove()
			})
		}
		return A
	};
	t.prototype.position = function() {
		var E = this,
		I = E.config,
		B = E.bindElem || I.elem[0],
		H = B.getBoundingClientRect(),
		D = E.elem.offsetWidth,
		z = E.elem.offsetHeight,
		y = function(J) {
			J = J ? "scrollLeft": "scrollTop";
			return document.body[J] | document.documentElement[J]
		},
		F = function(J) {
			return document.documentElement[J ? "clientWidth": "clientHeight"]
		},
		C = 5,
		A = H.left,
		G = H.bottom;
		if (A + D + C > F("width")) {
			A = F("width") - D - C
		}
		if (G + z + C > F()) {
			G = H.top > z ? H.top - z: F() - z;
			G = G - C * 2
		}
		if (I.position) {
			E.elem.style.position = I.position
		}
		E.elem.style.left = A + (I.position === "fixed" ? 0 : y(1)) + "px";
		E.elem.style.top = G + (I.position === "fixed" ? 0 : y()) + "px"
	};
	t.prototype.hint = function(A) {
		var z = this,
		y = z.config,
		B = e.elem("div", {
			"class": x
		});
		B.innerHTML = A || "";
		e(z.elem).find("." + x).remove();
		z.elem.appendChild(B);
		clearTimeout(z.hinTimer);
		z.hinTimer = setTimeout(function() {
			e(z.elem).find("." + x).remove()
		},
		3000)
	};
	t.prototype.getAsYM = function(z, A, y) {
		y ? A--:A++;
		if (A < 0) {
			A = 11;
			z--
		}
		if (A > 11) {
			A = 0;
			z++
		}
		return [z, A]
	};
	t.prototype.systemDate = function(z) {
		var y = z || new Date();
		return {
			year: y.getFullYear(),
			month: y.getMonth(),
			date: y.getDate(),
			hours: z ? z.getHours() : 0,
			minutes: z ? z.getMinutes() : 0,
			seconds: z ? z.getSeconds() : 0
		}
	};
	t.prototype.checkDate = function(E) {
		var B = this,
		z = new Date(),
		J = B.config,
		I = J.dateTime = J.dateTime || B.systemDate(),
		H,
		D,
		y = B.bindElem || J.elem[0],
		A = B.isInput(y) ? "val": "html",
		G = B.isInput(y) ? y.value: (J.position === "static" ? "": y.innerHTML),
		F = function(K) {
			if (K.year > q[1]) {
				K.year = q[1],
				D = true
			}
			if (K.month > 11) {
				K.month = 11,
				D = true
			}
			if (K.hours > 23) {
				K.hours = 0,
				D = true
			}
			if (K.minutes > 59) {
				K.minutes = 0,
				K.hours++,
				D = true
			}
			if (K.seconds > 59) {
				K.seconds = 0,
				K.minutes++,
				D = true
			}
			H = l.getEndDate(K.month + 1, K.year);
			if (K.date > H) {
				K.date = H,
				D = true
			}
		},
		C = function(N, M, K) {
			var L = ["startTime", "endTime"];
			M = M.match(B.EXP_SPLIT);
			K = K || 0;
			if (J.range) {
				B[L[K]] = B[L[K]] || {}
			}
			e.each(B.format,
			function(O, P) {
				var Q = parseFloat(M[O]);
				if (M[O].length < P.length) {
					D = true
				}
				if (/yyyy|y/.test(P)) {
					if (Q < q[0]) {
						Q = q[0],
						D = true
					}
					N.year = Q
				} else {
					if (/MM|M/.test(P)) {
						if (Q < 1) {
							Q = 1,
							D = true
						}
						N.month = Q - 1
					} else {
						if (/dd|d/.test(P)) {
							if (Q < 1) {
								Q = 1,
								D = true
							}
							N.date = Q
						} else {
							if (/HH|H/.test(P)) {
								if (Q < 1) {
									Q = 0,
									D = true
								}
								N.hours = Q;
								J.range && (B[L[K]].hours = Q)
							} else {
								if (/mm|m/.test(P)) {
									if (Q < 1) {
										Q = 0,
										D = true
									}
									N.minutes = Q;
									J.range && (B[L[K]].minutes = Q)
								} else {
									if (/ss|s/.test(P)) {
										if (Q < 1) {
											Q = 0,
											D = true
										}
										N.seconds = Q;
										J.range && (B[L[K]].seconds = Q)
									}
								}
							}
						}
					}
				}
			});
			F(N)
		};
		if (E === "limit") {
			return F(I),
			B
		}
		G = G || J.value;
		if (typeof G === "string") {
			G = G.replace(/\s+/g, " ").replace(/^\s|\s$/g, "")
		}
		if (B.startState && !B.endState) {
			delete B.startState;
			B.endState = true
		}
		if (typeof G === "string" && G) {
			if (B.EXP_IF.test(G)) {
				if (J.range) {
					G = G.split(" " + J.range + " ");
					B.startDate = B.startDate || B.systemDate();
					B.endDate = B.endDate || B.systemDate();
					J.dateTime = e.extend({},
					B.startDate);
					e.each([B.startDate, B.endDate],
					function(K, L) {
						C(L, G[K], K)
					})
				} else {
					C(I, G)
				}
			} else {
				B.hint("日期格式不合法<br>必须遵循下述格式：<br>" + (J.range ? (J.format + " " + J.range + " " + J.format) : J.format) + "<br>已为你重置");
				D = true
			}
		} else {
			if (G && G.constructor === Date) {
				J.dateTime = B.systemDate(G)
			} else {
				J.dateTime = B.systemDate();
				delete B.startState;
				delete B.endState;
				delete B.startDate;
				delete B.endDate;
				delete B.startTime;
				delete B.endTime
			}
		}
		F(I);
		if (D && G) {
			B.setValue(J.range ? (B.endDate ? B.parse() : "") : B.parse())
		}
		E && E();
		return B
	};
	t.prototype.mark = function(C, z) {
		var A = this,
		B, y = A.config;
		e.each(y.mark,
		function(D, F) {
			var E = D.split("-");
			if ((E[0] == z[0] || E[0] == 0) && E[1] == z[1] && E[2] == z[2]) {
				B = F || z[2]
			}
		});
		B && C.html('<span class="laydate-day-mark">' + B + "</span>");
		return A
	};
	t.prototype.limit = function(A, B, F, z) {
		var E = this,
		H = E.config,
		D = {},
		G = H[F > 41 ? "endDate": "dateTime"],
		C,
		y = e.extend({},
		G, B || {});
		e.each({
			now: y,
			min: H.min,
			max: H.max
		},
		function(I, J) {
			D[I] = E.newDate(e.extend({
				year: J.year,
				month: J.month,
				date: J.date
			},
			function() {
				var K = {};
				e.each(z,
				function(L, M) {
					K[M] = J[M]
				});
				return K
			} ())).getTime()
		});
		C = D.now < D.min || D.now > D.max;
		A && A[C ? "addClass": "removeClass"](v);
		return C
	};
	t.prototype.calendar = function(J) {
		var D = this,
		L = D.config,
		K = J || L.dateTime,
		A = new Date(),
		y,
		F,
		I,
		z = D.lang(),
		H = L.type !== "date" && L.type !== "datetime",
		C = J ? 1 : 0,
		B = e(D.table[C]).find("td"),
		E = e(D.elemHeader[C][2]).find("span");
		if (K.year < q[0]) {
			K.year = q[0],
			D.hint("最低只能支持到公元" + q[0] + "年")
		}
		if (K.year > q[1]) {
			K.year = q[1],
			D.hint("最高只能支持到公元" + q[1] + "年")
		}
		if (!D.firstDate) {
			D.firstDate = e.extend({},
			K)
		}
		A.setFullYear(K.year, K.month, 1);
		y = A.getDay();
		F = l.getEndDate(K.month, K.year);
		I = l.getEndDate(K.month + 1, K.year);
		e.each(B,
		function(N, P) {
			var O = [K.year, K.month],
			M = 0;
			P = e(P);
			P.removeAttr("class");
			if (N < y) {
				M = F - y + N;
				P.addClass("laydate-day-prev");
				O = D.getAsYM(K.year, K.month, "sub")
			} else {
				if (N >= y && N < I + y) {
					M = N - y;
					if (!L.range) {
						M + 1 === K.date && P.addClass(j)
					}
				} else {
					M = N - I - y;
					P.addClass("laydate-day-next");
					O = D.getAsYM(K.year, K.month)
				}
			}
			O[1]++;
			O[2] = M + 1;
			P.attr("lay-ymd", O.join("-")).html(O[2]);
			D.mark(P, O).limit(P, {
				year: O[0],
				month: O[1] - 1,
				date: O[2]
			},
			N)
		});
		e(E[0]).attr("lay-ym", K.year + "-" + (K.month + 1));
		e(E[1]).attr("lay-ym", K.year + "-" + (K.month + 1));
		if (L.lang === "cn") {
			e(E[0]).attr("lay-type", "year").html(K.year + "年");
			e(E[1]).attr("lay-type", "month").html((K.month + 1) + "月")
		} else {
			e(E[0]).attr("lay-type", "month").html(z.month[K.month]);
			e(E[1]).attr("lay-type", "year").html(K.year)
		}
		if (H) {
			if (L.range) {
				J ? D.endDate = (D.endDate || {
					year: K.year + (L.type === "year" ? 1 : 0),
					month: K.month + (L.type === "month" ? 0 : -1)
				}) : (D.startDate = D.startDate || {
					year: K.year,
					month: K.month
				});
				if (J) {
					D.listYM = [[D.startDate.year, D.startDate.month + 1], [D.endDate.year, D.endDate.month + 1]];
					D.list(L.type, 0).list(L.type, 1);
					L.type === "time" ? D.setBtnStatus("时间", e.extend({},
					D.systemDate(), D.startTime), e.extend({},
					D.systemDate(), D.endTime)) : D.setBtnStatus(true)
				}
			}
			if (!L.range) {
				D.listYM = [[K.year, K.month + 1]];
				D.list(L.type, 0)
			}
		}
		if (L.range && !J) {
			var G = D.getAsYM(K.year, K.month);
			D.calendar(e.extend({},
			K, {
				year: G[0],
				month: G[1]
			}))
		}
		if (!L.range) {
			D.limit(e(D.footer).find(p), null, 0, ["hours", "minutes", "seconds"])
		}
		if (L.range && J && !H) {
			D.stampRange()
		}
		return D
	};
	t.prototype.list = function(C, F) {
		var G = this,
		B = G.config,
		E = B.dateTime,
		U = G.lang(),
		M = B.range && B.type !== "date" && B.type !== "datetime",
		K = e.elem("ul", {
			"class": h + " " + ({
				year: "laydate-year-list",
				month: "laydate-month-list",
				time: "laydate-time-list"
			})[C]
		}),
		O = G.elemHeader[F],
		T = e(O[2]).find("span"),
		Q = G.elemCont[F || 0],
		A = e(Q).find("." + h)[0],
		I = B.lang === "cn",
		J = I ? "年": "",
		S = G.listYM[F] || {},
		D = ["hours", "minutes", "seconds"],
		P = ["startTime", "endTime"][F];
		if (S[0] < 1) {
			S[0] = 1
		}
		if (C === "year") {
			var y, N = y = S[0] - 7;
			if (N < 1) {
				N = y = 1
			}
			e.each(new Array(15),
			function(W) {
				var V = e.elem("li", {
					"lay-ym": y
				});
				y == S[0] && e(V).addClass(j);
				V.innerHTML = y + J;
				K.appendChild(V);
				G.limit(e(V), {
					year: y
				},
				F);
				y++
			});
			e(T[I ? 0 : 1]).attr("lay-ym", (y - 8) + "-" + S[1]).html((N + J) + " - " + (y - 1 + J))
		} else {
			if (C === "month") {
				e.each(new Array(12),
				function(W) {
					var V = e.elem("li", {
						"lay-ym": W
					});
					W + 1 == S[1] && e(V).addClass(j);
					V.innerHTML = U.month[W] + (I ? "月": "");
					K.appendChild(V);
					G.limit(e(V), {
						year: S[0],
						month: W
					},
					F)
				});
				e(T[I ? 0 : 1]).attr("lay-ym", S[0] + "-" + S[1]).html(S[0] + J)
			} else {
				if (C === "time") {
					var H = function() {
						e(K).find("ol").each(function(W, V) {
							e(V).find("li").each(function(Y, X) {
								G.limit(e(X), [{
									hours: Y
								},
								{
									hours: G[P].hours,
									minutes: Y
								},
								{
									hours: G[P].hours,
									minutes: G[P].minutes,
									seconds: Y
								}][W], F, [["hours"], ["hours", "minutes"], ["hours", "minutes", "seconds"]][W])
							})
						});
						if (!B.range) {
							G.limit(e(G.footer).find(p), G[P], 0, ["hours", "minutes", "seconds"])
						}
					};
					if (B.range) {
						if (!G[P]) {
							G[P] = {
								hours: 0,
								minutes: 0,
								seconds: 0
							}
						}
					} else {
						G[P] = E
					}
					e.each([24, 60, 60],
					function(X, Y) {
						var V = e.elem("li"),
						W = ["<p>" + U.time[X] + "</p><ol>"];
						e.each(new Array(Y),
						function(Z) {
							W.push("<li" + (G[P][D[X]] === Z ? ' class="' + j + '"': "") + ">" + e.digit(Z, 2) + "</li>")
						});
						V.innerHTML = W.join("") + "</ol>";
						K.appendChild(V)
					});
					H()
				}
			}
		}
		if (A) {
			Q.removeChild(A)
		}
		Q.appendChild(K);
		if (C === "year" || C === "month") {
			e(G.elemMain[F]).addClass("laydate-ym-show");
			e(K).find("li").on("click",
			function() {
				var V = e(this).attr("lay-ym") | 0;
				if (e(this).hasClass(v)) {
					return
				}
				if (F === 0) {
					E[C] = V;
					if (M) {
						G.startDate[C] = V
					}
				} else {
					if (M) {
						G.endDate[C] = V
					} else {
						var W = C === "year" ? G.getAsYM(V, S[1] - 1, "sub") : G.getAsYM(S[0], V, "sub");
						e.extend(E, {
							year: W[0],
							month: W[1]
						})
					}
				}
				if (B.type === "year" || B.type === "month") {
					e(K).find("." + j).removeClass(j);
					e(this).addClass(j);
					if (B.type === "month" && C === "year") {
						G.listYM[F][0] = V;
						M && (G[["startDate", "endDate"][F]].year = V);
						G.list("month", F)
					}
				} else {
					G.checkDate("limit").calendar();
					G.closeList()
				}
				G.setBtnStatus();
				B.range || G.done(null, "change");
				e(G.footer).find(m).removeClass(v)
			})
		} else {
			var L = e.elem("span", {
				"class": f
			}),
			z = function() {
				e(K).find("ol").each(function(X) {
					var W = this,
					V = e(W).find("li");
					W.scrollTop = 30 * (G[P][D[X]] - 2);
					if (W.scrollTop <= 0) {
						V.each(function(Y, Z) {
							if (!e(this).hasClass(v)) {
								W.scrollTop = 30 * (Y - 2);
								return true
							}
						})
					}
				})
			},
			R = e(O[2]).find("." + f);
			z();
			L.innerHTML = B.range ? [U.startTime, U.endTime][F] : U.timeTips;
			e(G.elemMain[F]).addClass("laydate-time-show");
			if (R[0]) {
				R.remove()
			}
			O[2].appendChild(L);
			e(K).find("ol").each(function(W) {
				var V = this;
				e(V).find("li").on("click",
				function() {
					var X = this.innerHTML | 0;
					if (e(this).hasClass(v)) {
						return
					}
					if (B.range) {
						G[P][D[W]] = X
					} else {
						E[D[W]] = X
					}
					e(V).find("." + j).removeClass(j);
					e(this).addClass(j);
					G.setBtnStatus(null, e.extend({},
					G.systemDate(), G.startTime), e.extend({},
					G.systemDate(), G.endTime));
					H();
					z(); (G.endDate || B.type === "time") && G.done(null, "change")
				})
			})
		}
		return G
	};
	t.prototype.listYM = [];
	t.prototype.closeList = function() {
		var z = this,
		y = z.config;
		e.each(z.elemCont,
		function(A, B) {
			e(this).find("." + h).remove();
			e(z.elemMain[A]).removeClass("laydate-ym-show laydate-time-show")
		});
		e(z.elem).find("." + f).remove()
	};
	t.prototype.setBtnStatus = function(z, F, A) {
		var C = this,
		B = C.config,
		E, D = e(C.footer).find(p),
		y = B.range && B.type !== "date" && B.type !== "datetime";
		if (y) {
			F = F || C.startDate;
			A = A || C.endDate;
			E = C.newDate(F).getTime() > C.newDate(A).getTime(); (C.limit(null, F) || C.limit(null, A)) ? D.addClass(v) : D[E ? "addClass": "removeClass"](v);
			if (z && E) {
				C.hint(typeof z === "string" ? c.replace(/日期/g, z) : c)
			}
		}
	};
	t.prototype.parse = function(B) {
		var z = this,
		y = z.config,
		A = B ? e.extend({},
		z.endDate, z.endTime) : (y.range ? e.extend({},
		z.startDate, z.startTime) : y.dateTime),
		C = z.format.concat();
		e.each(C,
		function(D, E) {
			if (/yyyy|y/.test(E)) {
				C[D] = e.digit(A.year, E.length)
			} else {
				if (/MM|M/.test(E)) {
					C[D] = e.digit(A.month + 1, E.length)
				} else {
					if (/dd|d/.test(E)) {
						C[D] = e.digit(A.date, E.length)
					} else {
						if (/HH|H/.test(E)) {
							C[D] = e.digit(A.hours, E.length)
						} else {
							if (/mm|m/.test(E)) {
								C[D] = e.digit(A.minutes, E.length)
							} else {
								if (/ss|s/.test(E)) {
									C[D] = e.digit(A.seconds, E.length)
								}
							}
						}
					}
				}
			}
		});
		if (y.range && !B) {
			return C.join("") + " " + y.range + " " + z.parse(1)
		}
		return C.join("")
	};
	t.prototype.newDate = function(y) {
		return new Date(y.year || 1, y.month || 0, y.date || 1, y.hours || 0, y.minutes || 0, y.seconds || 0)
	};
	t.prototype.setValue = function(B) {
		var A = this,
		y = A.config,
		z = A.bindElem || y.elem[0],
		C = A.isInput(z) ? "val": "html";
		y.position === "static" || e(z)[C](B || "");
		return this
	};
	t.prototype.stampRange = function() {
		var C = this,
		z = C.config,
		B, y, A = e(C.elem).find("td");
		if (z.range && !C.endDate) {
			e(C.footer).find(p).addClass(v)
		}
		if (!C.endDate) {
			return
		}
		B = C.newDate({
			year: C.startDate.year,
			month: C.startDate.month,
			date: C.startDate.date
		}).getTime();
		y = C.newDate({
			year: C.endDate.year,
			month: C.endDate.month,
			date: C.endDate.date
		}).getTime();
		if (B > y) {
			return C.hint(c)
		}
		e.each(A,
		function(D, F) {
			var G = e(F).attr("lay-ymd").split("-"),
			E = C.newDate({
				year: G[0],
				month: G[1] - 1,
				date: G[2]
			}).getTime();
			e(F).removeClass(n + " " + j);
			if (E === B || E === y) {
				e(F).addClass(e(F).hasClass(a) || e(F).hasClass(b) ? n: j)
			}
			if (E > B && E < y) {
				e(F).addClass(n)
			}
		})
	};
	t.prototype.done = function(C, A) {
		var B = this,
		z = B.config,
		D = e.extend({},
		B.startDate ? e.extend(B.startDate, B.startTime) : z.dateTime),
		y = e.extend({},
		e.extend(B.endDate, B.endTime));
		e.each([D, y],
		function(E, F) {
			if (! ("month" in F)) {
				return
			}
			e.extend(F, {
				month: F.month + 1
			})
		});
		C = C || [B.parse(), D, y];
		typeof z[A || "done"] === "function" && z[A || "done"].apply(z, C);
		return B,C[0]
	};
	
	t.prototype.choose = function(F) {
		var C = this,
		z = C.config,
		D = z.dateTime,
		B = e(C.elem).find("td"),
		A = F.attr("lay-ymd").split("-"),
		E = function(H) {
			var G = new Date();
			H && e.extend(D, A);
			if (z.range) {
				C.startDate ? e.extend(C.startDate, A) : (C.startDate = e.extend({},
				A, C.startTime));
				C.startYMD = A
			}
		};
		A = {
			year: A[0] | 0,
			month: (A[1] | 0) - 1,
			date: A[2] | 0
		};
		if (F.hasClass(v)) {
			return
		}
		if (z.range) {
			e.each(["startTime", "endTime"],
			function(G, H) {
				C[H] = C[H] || {
					hours: 0,
					minutes: 0,
					seconds: 0
				}
			});
			if (C.endState) {
				E();
				delete C.endState;
				delete C.endDate;
				C.startState = true;
				B.removeClass(j + " " + n);
				F.addClass(j)
			} else {
				if (C.startState) {
					F.addClass(j);
					C.endDate ? e.extend(C.endDate, A) : (C.endDate = e.extend({},
					A, C.endTime));
					if (C.newDate(A).getTime() < C.newDate(C.startYMD).getTime()) {
						var y = e.extend({},
						C.endDate, {
							hours: C.startDate.hours,
							minutes: C.startDate.minutes,
							seconds: C.startDate.seconds
						});
						e.extend(C.endDate, C.startDate, {
							hours: C.endDate.hours,
							minutes: C.endDate.minutes,
							seconds: C.endDate.seconds
						});
						C.startDate = y
					}
					z.showBottom || C.done();
					C.stampRange();
					C.endState = true;
					C.done(null, "change")
				} else {
					F.addClass(j);
					E();
					C.startState = true
				}
			}
			e(C.footer).find(p)[C.endDate ? "removeClass": "addClass"](v)
		} else {
			if (z.position === "static") {
				E(true);
				C.calendar().done().done(null, "change")
			} else {
				if (z.type === "date") {
					E(true);
					C.setValue(C.parse()).remove().done()
				} else {
					if (z.type === "datetime") {
						E(true);
						C.calendar().done(null, "change")
					}
				}
			}
		}
	};
	t.prototype.timetool = function(C, D) {
		var E = this,
		A = E.config,
		F = A.dateTime,
		y = new Date(),
		B = y.getTime() + Number(D) * 60 * 1000,
		z = new Date(B);
		e.extend(F, E.systemDate(z), {
			hours: z.getHours(),
			minutes: z.getMinutes(),
			seconds: z.getSeconds()
		});
		E.setValue(E.parse()).remove();
		E.calendar();
		E.done()
	};
	t.prototype.tool = function(A, B) {
		var C = this,
		z = C.config,
		D = z.dateTime,
		y = z.position === "static",
		E = {
			datetime: function() {
				if (e(A).hasClass(v)) {
					return
				}
				C.list("time", 0);
				z.range && C.list("time", 1);
				e(A).attr("lay-type", "date").html(C.lang().dateTips)
			},
			date: function() {
				C.closeList();
				e(A).attr("lay-type", "datetime").html(C.lang().timeTips)
			},
			clear: function() {
				C.setValue("").remove();
				y && (e.extend(D, C.firstDate), C.calendar());
				z.range && (delete C.startState, delete C.endState, delete C.endDate, delete C.startTime, delete C.endTime);
				C.done(["", {},
				{}])
			},
			now: function() {
				var F = new Date();
				e.extend(D, C.systemDate(), {
					hours: F.getHours(),
					minutes: F.getMinutes(),
					seconds: F.getSeconds()
				});
				C.setValue(C.parse()).remove();
				y && C.calendar();
				C.done()
			},
			confirm: function() {
				
				if (z.range) {
					if (!C.endDate) {
						return C.hint("请先选择日期范围")
					}
					if (e(A).hasClass(v)) {
						return C.hint(z.type === "time" ? c.replace(/日期/g, "时间") : c)
					}
				} else {
					if (e(A).hasClass(v)) {
						return C.hint("不在有效日期或时间范围内")
					}
				}
				var tt=C.done();
			        if(C.config.elem[0].id!=="timepiker")
			        	{
			        	C.setValue(C.parse()).remove()
			        	}else{
			        C.remove();
			        if(tt!==''){
			      		timevalue=tt.split("-");
			      	      var time1=$(".drp-calendar-date").eq(0).val();
			      	     var time2=$(".drp-calendar-date").eq(1).val();
			      	     $(".drp-calendar-date").eq(0).val(time1.substring(0,11)+""+timevalue[0]);
			      	     $(".drp-calendar-date").eq(1).val(time2.substring(0,11)+""+timevalue[1]);
			      	     $("#timepiker").html("");	  
			      	     $("#timeInterval").val(time1.substring(0,11)+""+timevalue[0]+"--"+time2.substring(0,11)+""+timevalue[1]);
			      	     }else{
			      	         	    	$(".drp-calendar-date").eq(0).val("");
			         	     $(".drp-calendar-date").eq(1).val("");
			      	    	 
			      	    	 }
			           console.log("时间"+C.parse());
			        	}
				
			}
		};
		E[B] && E[B]()
	};
	t.prototype.change = function(B) {
		var E = this,
		A = E.config,
		F = A.dateTime,
		y = A.range && (A.type === "year" || A.type === "month"),
		C = E.elemCont[B || 0],
		z = E.listYM[B],
		D = function(H) {
			var G = ["startDate", "endDate"][B],
			I = e(C).find(".laydate-year-list")[0],
			J = e(C).find(".laydate-month-list")[0];
			if (I) {
				z[0] = H ? z[0] - 15 : z[0] + 15;
				E.list("year", B)
			}
			if (J) {
				H ? z[0]--:z[0]++;
				E.list("month", B)
			}
			if (I || J) {
				e.extend(F, {
					year: z[0]
				});
				if (y) {
					E[G].year = z[0]
				}
				A.range || E.done(null, "change");
				E.setBtnStatus();
				A.range || E.limit(e(E.footer).find(p), {
					year: z[0]
				})
			}
			return I || J
		};
		return {
			prevYear: function() {
				if (D("sub")) {
					return
				}
				F.year--;
				E.checkDate("limit").calendar();
				A.range || E.done(null, "change")
			},
			prevMonth: function() {
				var G = E.getAsYM(F.year, F.month, "sub");
				e.extend(F, {
					year: G[0],
					month: G[1]
				});
				E.checkDate("limit").calendar();
				A.range || E.done(null, "change")
			},
			nextMonth: function() {
				var G = E.getAsYM(F.year, F.month);
				e.extend(F, {
					year: G[0],
					month: G[1]
				});
				E.checkDate("limit").calendar();
				A.range || E.done(null, "change")
			},
			nextYear: function() {
				if (D()) {
					return
				}
				F.year++;
				E.checkDate("limit").calendar();
				A.range || E.done(null, "change")
			}
		}
	};
	t.prototype.changeEvent = function() {
		var z = this,
		y = z.config;
		e(z.elem).on("click",
		function(A) {
			e.stope(A)
		});
		e.each(z.elemHeader,
		function(A, B) {
			e(B[0]).on("click",
			function(C) {
				z.change(A).prevYear()
			});
			e(B[1]).on("click",
			function(C) {
				z.change(A).prevMonth()
			});
			e(B[2]).find("span").on("click",
			function(F) {
				var E = e(this),
				D = E.attr("lay-ym").split("-"),
				C = E.attr("lay-type");
				z.listYM[A] = [D[0] | 0, D[1] | 0];
				z.list(C, A);
				e(z.footer).find(m).addClass(v)
			});
			e(B[3]).on("click",
			function(C) {
				z.change(A).nextMonth()
			});
			e(B[4]).on("click",
			function(C) {
				z.change(A).nextYear()
			})
		});
		e.each(z.table,
		function(A, C) {
			var B = e(C).find("td");
			B.on("click",
			function() {
				z.choose(e(this))
			})
		});
		e(z.timeline).find("ul li").on("click",
		function() {
			var A = e(this).attr("time-type");
			z.timetool(this, A)
		});
		e(z.footer).find("span").on("click",
		function() {
			var A = e(this).attr("lay-type");
			z.tool(this, A)
		})
	};
	t.prototype.isInput = function(y) {
		return /input|textarea/.test(y.tagName.toLocaleLowerCase())
	};
	t.prototype.events = function() {
		var A = this,
		y = A.config,
		z = function(B, C) {
			B.on(y.trigger,
			function() {
				C && (A.bindElem = this);
				A.render()
			})
		};
		if (!y.elem[0] || y.elem[0].eventHandler) {
			return
		}
		z(y.elem, "bind");
		z(y.eventElem);
		e(document).on("click",
		function(B) {
			if (B.target === y.elem[0] || B.target === y.eventElem[0] || B.target === e(y.closeStop)[0]) {
				return
			}
			A.remove()
		}).on("keydown",
		function(B) {
			if (B.keyCode === 13) {
				if (e("#" + A.elemID)[0] && A.elemID === t.thisElem) {
					B.preventDefault();
					e(A.footer).find(p)[0].click()
				}
			}
		});
		e(window).on("resize",
		function() {
			if (!A.elem || !e(d)[0]) {
				return false
			}
			A.position()
		});
		y.elem[0].eventHandler = true
	};
	l.render = function(y) {
		var z = new t(y);
		return r.call(z)
	};
	l.getEndDate = function(A, z) {
		var y = new Date();
		y.setFullYear(z || y.getFullYear(), A || (y.getMonth() + 1), 1);
		return new Date(y.getTime() - 1000 * 60 * 60 * 24).getDate()
	};
	window.lay = window.lay || e;
	s ? (l.ready(), layui.define(function(y) {
		l.path = layui.cache.dir;
		y(k, l)
	})) : ((typeof define === "function" && define.amd) ? define(function() {
		return l
	}) : function() {
		l.ready();
		window.laydate = l
	} ())
} ();