# yaozh_zc_proxy
``` bash
npm config set registry https://registry.npm.taobao.org
npm install
node index.js
```

## 要求
* 建议使用最新版node
* node 版本大于v9.3.0
* npm 版本大于5.6.0
    * 请求
    * proxy 使用代理, 参数需要urlEncode。格式 protocol://ip:prot ("http", "socks", "socks4", "socks5". http代理：http://192.168.1.1:8000，socks5代理: socks5://192.168.1.1:8000, shadowsocks类socks5也同样受支持)
    * slh 受理号
    * 请求示例 curl http://127.0.0.1:3000?slh=JYSB1800139
    * 添加代理 curl http://127.0.0.1:3000/?proxy=http%3A%2F%2F192.168.1.1%3A8000&slh=CXHB1800036

    * 返回
    * 200: 受理号查询后的完整html，需要自行判断数据是否是合法数据。
    * 500: 服务器错误，超时，代理ip无效，ip被屏蔽...(反正就是这次请求数据是绝对拿不到滴)

    * 注意
    * 同一个ip在同一时间 最好保持一个请求，同时进行两个请求可能会导致数据错乱，session会乱，这是cfda的机制导致的，等该ip请求返回后再请求就好了。
    * 初次添加代理会进行一系列的初始化，消耗比较大，且60秒内不活跃即被销毁，60秒内再次请求会缓存所以速度很快
    * 添加多个ip会消耗过多的内存，在60秒内如果未收到来自相同ip的请求，该ip代理会被销毁，并发的时候要注意看自己的内存哟。
