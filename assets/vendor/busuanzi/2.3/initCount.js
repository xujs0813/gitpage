(function(){
    var eleList = [
        {
            id: 'busuanzi_value_site_pv', 
            ele: null,
            initCount: _getInitCount(1940)
        },
        {
            id: 'busuanzi_value_site_uv',
            ele: null,
            initCount: _getInitCount(932)
        },
        {
            id: 'busuanzi_value_page_pv',
            ele: null,
            initCount: _getInitCount(123)
        },
    ]

    for(var i=0;i<eleList.length;i++){
        var eleObj = eleList[i]
        eleObj.ele = document.getElementById(eleObj.id)
        _defineProperty(eleObj,'innerHTML')
    }

    function _defineProperty(eleObj,key){
        var ele = eleObj.ele
        Object.defineProperty(ele,key,{
            set(originVal){
                // 设置了 setter 之后，无法通过 innerHTML 设置值
                _updateCount(eleObj,originVal)
            }
        })
    }

    function _updateCount(eleObj,originVal){
        var initCount = eleObj.initCount
        var ele = eleObj.ele
        // 通过 innerText 折中实现
        ele.innerText = parseInt(originVal) + initCount
    }

    function _getInitCount(seed){
        var n = 1000 * 3600 * 24
        var dayNum = Date.now() / n 
        var date = new Date(2020,9,3)
        var dateDay = Date.parse(date) / n
        var dis = dayNum - dateDay
        return parseInt(dis * seed)
    }
})()