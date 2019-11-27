/**
 * 全局方法
 * by 张
 * 2019-11-13
 */
axios.defaults.headers.common['Token'] = getToken();
function setCookie (name,val,time) {        
        //存的名称name,存的值val,存的天数time(过期时间)
        var oDate = new Date();
        oDate.setDate(oDate.getDate()+time);   
        document.cookie=name+"="+val+";expires="+oDate;//过期时间           
    }

function getCookie (name) {
        var str = document.cookie;
        var arrStr=str.split("; ")  
        //遍历数组
        for (var i = 0; i < arrStr.length; i++) {
            var arr=arrStr[i].split("=")
            if(arr[0]==name){
                return arr[1]
            }
        }
    }

function removeCookie(name){
        setCookie(name,"",-1);
}

function getToken(){
	return getCookie("Token")
}


