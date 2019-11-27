var vm = new Vue({
	el: '#app',
	data: {
		baseURL: 'http://127.0.0.1:9099/index/',
		search_key: '',
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
		loginKind: 1, //0注册 1登录
		loginForm: {
			id: '',
			pwd: '',
			name: ''
		},
		myinfo: {
			islogin: 0
		},

		//博客信息
		boke: {
			id: 0,
			titke: '',
			sim_content: '',
			author: '',
			content: '',
			create_time: ''
		},
		id: ejs_id, //boke_id。
		discusses: [

		],
		shunxu: true ,//true顺序。false倒叙
		discussFormVisable:false,
		discuss:{
			what:0,//1回复 0评论
			text:''
		},
		editInfoVisable: false,
		editInfo: {
			name: ''
		}
	},
	methods: {
		//打开评论弹窗
		openDiscuss:function(x){
			/**
			 * x:1 id 0 评论
			 */
			if(!this.myinfo.islogin){
				this.$alert('请登录后再使用评论功能', '请登录', {
					confirmButtonText: '确定',
					callback: action => {
						this.dialogFormVisible = true
					}
				});
			}else{
				this.discuss.what = x
				this.discussFormVisable = true
			}
		},
		sendDiscuss:function(){
			var x = this.discuss.what
			
				if(this.discuss.text != ''){
					axios({
						method:"POST",
						url:`${this.baseURL}addDiscuss`,
						data:{
							to_account_id: x ? x : null ,
							account_id:this.myinfo.id,
							text:this.discuss.text,
							boke_id:this.id
						}
					}).then((res)=>{
						if(res.data.code === 200){
							this.discussFormVisable = false
							this.getDiscussInfo()
						}
					}).catch((e)=>{
						console.error(e)
					})
				}else{
					//为空
					this.$alert('请不要发表空白评论', '评论失败', {
						confirmButtonText: '确定',
						callback: action => {
					
						}
					});
				}
				
			
		},
		/**
		 * 获取url参数
		 * @param {Object} variable
		 */
		getQueryVariable: function(variable) {
			var query = window.location.search.substring(1);
			var vars = query.split("&");
			for (var i = 0; i < vars.length; i++) {
				var pair = vars[i].split("=");
				if (pair[0] == variable) {
					return pair[1];
				}
			}
			return (false);
		},
		/**
		 * 登录
		 */
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
				if(this.loginForm.name == '作者'){
					this.$alert('注册失败，名字不可以叫作者喔！', '注册失败', {
						confirmButtonText: '确定',
						callback: action => {}
					});
					return
				}
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
		getDiscussInfo:function(){
			
			/**
			 * 获取博客评论数据
			 */
			axios({
				method: "GET",
				url: `${this.baseURL}selDisByBoke`,
				header: {
					'Content-Type': 'application/json;charset=UTF-8'
				},
				params: {
					id: this.id
				}
			}).then((response) => {
				if(this.shunxu){
					this.discusses = response.data.data.discusses
				}else{
					this.discusses = response.data.data.discusses.reverse()
				}
				
			}).catch((error) => {
				this.$alert('加载失败，可能是该博客已删除！', '加载失败', {
					confirmButtonText: '确定',
					callback: action => {
						window.location.href = "index.html";
					}
				});
			})
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
		var id = this.id

		/**
		 * 获取博客数据
		 */
		axios({
			method: "GET",
			url: `${this.baseURL}selById`,
			header: {
				'Content-Type': 'application/json;charset=UTF-8'
			},
			params: {
				id: id
			}
		}).then((response) => {
			this.boke = response.data.data.boke
		}).catch((error) => {
			this.$alert('加载失败，可能是该博客已删除！', '加载失败', {
				confirmButtonText: '确定',
				callback: action => {
					window.location.href = "index.html";
				}
			});
		})

		/**
		 * 获取博客评论数据
		 */
		axios({
			method: "GET",
			url: `${this.baseURL}selDisByBoke`,
			header: {
				'Content-Type': 'application/json;charset=UTF-8'
			},
			params: {
				id: id
			}
		}).then((response) => {
			this.discusses = response.data.data.discusses
		}).catch((error) => {
			this.$alert('加载失败，可能是该博客已删除！', '加载失败', {
				confirmButtonText: '确定',
				callback: action => {
					window.location.href = "index.html";
				}
			});
		})

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
