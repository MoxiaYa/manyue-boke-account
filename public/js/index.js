Vue.config.productionTip = false;



var vm = new Vue({
	el: '#app',
	data: {
		baseURL: 'http://127.0.0.1:9099/index/',
		search_key: '',
		myinfo: {
			islogin: 0
		},
		this_page: 1, //当前所在页数:
		//第一页 1 0-6 (this_page.6-6,this_page.6)
		//第二页 2 6-12
		//       3 12-18
		indexData: {
			boke_name: '',
			index_one: '',
			index_two: '',
			index_three: ''
		},
		bokes: [],
		dialogFormVisible: false,
		formLabelWidth: '120px',
		loginKind: 0, //0注册 1登录
		loginForm: {
			id: '',
			pwd: '',
			name: ''
		},
		editInfoVisable: false,
		editInfo: {
			name: ''
		}
	},
	methods: {
		login: function() {
			if (this.loginKind === 1) {
				axios({
					method: "POST",
					url: `${this.baseURL}login`,
					header: {
						'Content-Type': 'application/json;charset=UTF-8'
					},
					data: this.loginForm
				}).then((response) => {
					if (response.data.code === 200) {
						var token = response.data.data.token
						setCookie("Token", token, 1)
						this.$alert('欢迎回来！', '登录成功', {
							confirmButtonText: '确定',
							callback: action => {
								this.myinfo.islogin = 1
								this.myinfo.id = response.data.data.account.id
								this.myinfo.pwd = response.data.data.account.pwd
								this.myinfo.name = response.data.data.account.name
								this.myinfo.avatar = response.data.data.account.avatar
							}
						});
						this.dialogFormVisible = false

					} else if (response.data.code === 400) {
						this.$alert('密码错误，请重试！', '登录失败', {
							confirmButtonText: '确定',
							callback: action => {

							}
						});
					} else if (response.data.code === 500) {
						this.$alert('无此账户，请重试！', '登录失败', {
							confirmButtonText: '确定',
							callback: action => {

							}
						});
					}

				}).catch((error) => {
					console.log(error)
					this.$alert('登陆失败，未知异常！', '登录失败', {
						confirmButtonText: '确定',
						callback: action => {

						}
					});
					console.log('%c------ 登陆失败 ------', 'color:red')
				})
			} else {
				axios({
					method: "POST",
					url: `${this.baseURL}register`,
					header: {
						'Content-Type': 'application/json;charset=UTF-8'
					},
					data: this.loginForm
				}).then((response) => {
					if (response.data.code === 200) {
						this.$alert('点击确认前往登录界面！', '注册成功', {
							confirmButtonText: '确定',
							callback: action => {
								this.loginKind = 1
							}
						});
					} else {
						this.$alert('注册失败，可能是账号已存在！', '注册失败', {
							confirmButtonText: '确定',
							callback: action => {}
						});
					}
				}).catch((error) => {
					console.log(error)
				})
			}

		},
		logout: function() {
			this.myinfo.islogin = 0;
			this.myinfo.id = '';
			this.myinfo.pwd = '';
			removeCookie("Token");
		},
		start: function() {
			var mid = document.getElementById('mid')
			this.animateScroll(0, mid, 9, 0)
		},
		pageChange: function(val) {
			var mid = document.getElementById('mid')
			var page = document.getElementById('pages')
			//document.documentElement.scrollTop = window.innerHeight+10
			this.animateScroll(page, mid, 10, 1)
		},
		animateScroll: function(element, element2, speed, z) {
			console.log(this.getMousePos(window.event).y)
			//z:0 从上往下 1 从下往上
			let rect = element2.getBoundingClientRect();
			//获取元素相对窗口的top值，此处应加上窗口本身的偏移
			let top = window.pageYOffset + rect.top;
			console.log(top)
			let currentTop = element === 0 ? window.innerHeight - this.getMousePos(window.event).y : element.offsetTop;
			let requestId;
			//采用requestAnimationFrame，平滑动画
			//从下往上滑
			function toTop(timestamp) {
				currentTop -= speed;
				if (currentTop > top) {
					window.scrollTo(0, currentTop);
					requestId = window.requestAnimationFrame(toTop);
				} else {
					window.cancelAnimationFrame(requestId);
				}
			}
			//c从上往下滑
			function toEnd(timestamp) {
				currentTop += speed;
				if (currentTop <= top + 15) {
					window.scrollTo(0, currentTop);
					requestId = window.requestAnimationFrame(toEnd);
				} else {
					window.cancelAnimationFrame(requestId);
				}
			}
			if (z) {
				window.requestAnimationFrame(toTop);
			} else {
				window.requestAnimationFrame(toEnd);
			}

		},
		getMousePos: function(event) {
			var e = event || window.event;
			// var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
			// var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
			var x = e.clientX
			var y = e.clientY
			//alert('x: ' + x + '\ny: ' + y);
			return {
				'x': x,
				'y': y
			};
		},
		//打开修改资料框
		openEditInfo:function(){
			//切除关系的完全复制
			this.editInfo = JSON.parse(JSON.stringify(this.myinfo));
			this.editInfoVisable = true
			
		},
		//提交修改
		goUpdateInfo:function(){
			axios({
				method: "POST",
				url: `${this.baseURL}editInfo`,
				header: {
					'Content-Type': 'application/json;charset=UTF-8'
				},
				data: {
					name:this.editInfo.name,
					avatar:this.editInfo.avatar
				}
			}).then((res)=>{
				if(res.data.code === 200){
					this.$alert('修改成功', 'success', {
						confirmButtonText: '确定',
						callback: action => {
							axios({
								method: "GET",
								url: `${this.baseURL}testLogin`,
								header: {
									'Content-Type': 'application/json;charset=UTF-8'
								}
							}).then((response) => {
								if (response.data.code === 200) {
									this.myinfo.islogin = 1
									console.log(response.data.data.account.id)
									this.myinfo.id = response.data.data.account.id
									this.myinfo.pwd = response.data.data.account.pwd
									this.myinfo.name = response.data.data.account.name
									this.myinfo.avatar = response.data.data.account.avatar
									vm.$forceUpdate()
								} else {
									this.myinfo.islogin = 0
								}
							}).catch((error) => {
								console.log(error)
								console.log('%c------ 获取登录数据失败 ------', 'color:red')
							})
						}
					});
					this.editInfoVisable = false
				}else{
					this.$alert('修改失败，可能是密码已被修改或未知错误！', '修改失败', {
						confirmButtonText: '确定',
						callback: action => {}
					});
				}
			}).catch((e)=>{
				console.error(e)
				this.$alert('修改失败，未知错误！', '修改失败', {
					confirmButtonText: '确定',
					callback: action => {}
				});
			})
		},
		//下面是图片上传的相关方法
		handleAvatarSuccess(res, file) {
			if (res.code === 200) {
				// this.info.avatar = URL.createObjectURL(file.raw)
				console.log("开始设置")
				this.editInfo.avatar = res.img
				//vm.$forceUpdate();//不知道为什么不会动态加载,直接强制渲染吧
			}
		},
		beforeAvatarUpload(file) {
			const isJPG = file.type === 'image/jpeg'
			const isPNG = file.type === 'image/png'
			const isLt2M = file.size / 1024 / 1024 < 10

			if (!isJPG && !isPNG) {
				this.$message.error('上传头像图片只能是 JPG / png 格式!')
			}
			if (!isLt2M) {
				this.$message.error('上传头像图片大小不能超过 10MB!')
			}
			return (isJPG||isPNG) && isLt2M
		}
	},
	created() {
		/**
		 * 判断登录是否有效
		 * 获取登录信息
		 */
		axios({
			method: "GET",
			url: `${this.baseURL}testLogin`,
			header: {
				'Content-Type': 'application/json;charset=UTF-8'
			}
		}).then((response) => {
			if (response.data.code === 200) {
				this.myinfo.islogin = 1
				console.log(response.data.data.account.id)
				this.myinfo.id = response.data.data.account.id
				this.myinfo.pwd = response.data.data.account.pwd
				this.myinfo.name = response.data.data.account.name
				this.myinfo.avatar = response.data.data.account.avatar
			} else {
				this.myinfo.islogin = 0
			}
		}).catch((error) => {
			console.log(error)
			console.log('%c------ 获取登录数据失败 ------', 'color:red')
		})

		axios({
			method: "GET",
			url: `${this.baseURL}selEnabled`,
			header: {
				'Content-Type': 'application/json;charset=UTF-8'
			}
		}).then((response) => {
			this.bokes = response.data
		}).catch((error) => {
			console.log('%c------ 获取轮播图数据失败 ------', 'color:red')
		})

		axios({
			method: "GET",
			url: `${this.baseURL}indexData`,
			header: {
				'Content-Type': 'application/json;charset=UTF-8'
			}
		}).then((response) => {

			if (response.data.code === 200) {
				this.indexData = response.data.data
			}
		}).catch((error) => {
			console.log('%c------ 获取轮播图数据失败 ------', 'color:red')
		})
	}
})
