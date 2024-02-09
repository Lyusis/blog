import{_ as e,c as t,o as n,V as a}from"./chunks/framework.pRwbWk_8.js";const v=JSON.parse('{"title":"Netty基础","description":"","frontmatter":{},"headers":[],"relativePath":"Netty基础.md","filePath":"Netty基础.md"}'),l={name:"Netty基础.md"},o=a('<h1 id="netty基础" tabindex="-1">Netty基础 <a class="header-anchor" href="#netty基础" aria-label="Permalink to &quot;Netty基础&quot;">​</a></h1><h2 id="整体结构" tabindex="-1">整体结构 <a class="header-anchor" href="#整体结构" aria-label="Permalink to &quot;整体结构&quot;">​</a></h2><ol><li>Core 核型层: 提供底层网络同行的通用抽象和实现, 包括可扩展的事件模型, 通用的通讯API, 支持零拷贝的ByteBuf等。</li><li>Protocal Support 协议支持层: 覆盖了主流协议的编解码实现, 如HTTP､ SSL､ Protobuf､ 压缩､ 大文件传输､ WebSocket､ 文本､ 二进制等。并且支持自定义应用层协议。</li><li>Transport Service 传输服务层: 传输服务层提供了网络传输能力的定义和实现方法, 支持Socket､ HTTP隧道､ 虚拟机管道等传输方式。设计具备通用性和可扩展性。</li></ol><h2 id="逻辑架构" tabindex="-1">逻辑架构 <a class="header-anchor" href="#逻辑架构" aria-label="Permalink to &quot;逻辑架构&quot;">​</a></h2><h3 id="网络通信层" tabindex="-1">网络通信层 <a class="header-anchor" href="#网络通信层" aria-label="Permalink to &quot;网络通信层&quot;">​</a></h3><p>网络通信层的职责是执行网络I/O的操作, 支持多种网络协议和I/O模型的连接操作。</p><ol><li><p>BootStrap: 主要负责整个Netty程序的启动､ 初始化､ 服务器连接等过程。可用于连接远端服务器, 只绑定一个EventLoopGroup(Boss)。</p></li><li><p>ServerBootStrap: 服务于服务端的BootStrap。用于服务端启动绑定本地端口, 绑定两个EventLoopGroup(Worker)。</p><ol><li>每个服务器中都会有一个Boss, 会有一群做事情的Worker。</li><li>Boss会不停地接收新的连接, 将连接分配给一个个Worker处理连接。</li></ol></li><li><p>Channel: 网络通信的载体, 提供了基本的API用于网络I/O操作, 如register､ bind､ connect､ read､ write､ flush等。Netty自己实现的Channel是以JDK NIO Channel为基础的。</p><ol><li><p>Channel家族类</p><ul><li><p>NioServerSocketChannel 异步TCP服务端</p></li><li><p>NioSocketChannel 异步TCP客户端</p></li><li><p>OioServerSocketChannel同步TCP服务端</p></li><li><p>OioSocketChannel同步TCP客户端</p></li><li><p>NioDatagramChannel异步UDP连接</p></li><li><p>OioDatagramChannel同步UDP连接</p></li></ul></li><li><p>Channel生命周期</p><p>Channel会有多种事件状态, 如连接建立､ 连接注册､ 数据读写､ 连接销毁等。</p><table><thead><tr><th>事件</th><th>说明</th></tr></thead><tbody><tr><td>channelRegistered</td><td>Channel创建后被注册到EventLoop上</td></tr><tr><td>channelUnregistered</td><td>Channel创建后未注册或者从EventLoop取消注册</td></tr><tr><td>channelActive</td><td>Channel处于就绪状态, 可以被读写</td></tr><tr><td>channelInactive</td><td>Channel处于非就绪状态</td></tr><tr><td>channelRead</td><td>Channel可以从远端读取到数据</td></tr><tr><td>channelReadComplete</td><td>Channel读取数据完成</td></tr></tbody></table></li></ol></li></ol><h3 id="事件调度层" tabindex="-1">事件调度层 <a class="header-anchor" href="#事件调度层" aria-label="Permalink to &quot;事件调度层&quot;">​</a></h3><p>通过Reactor线程模型对各类事件进行聚合处理, 通过Selector主循环线程集成多种事件, 核心组件包括EventLoopGroup､ EventLoop。</p><ol><li>EventLoop和EventLoopGroup(本身也是最常用的线程模型之一)等同于线程和线程池的关系。EventLoopGroup是Netty Reactor线程模型的具体实现方式。 <ol><li>单线程模型: EventLoopGroup只包含一个EventLoop, Boss和Worker使用同一个EventLoopGroup。</li><li>多线程模型: EventLoopGroup包含多个EventLoop, Boss和Worker使用同一个EventLoopGroup。</li><li>主从多线程模型: EventLoopGroup包含多个EventLoop, Boss是主Reactor, Worker是从Reactor中主要负责Reactor新网络连接的Channel创建的, 然后把Channel注册到Reactor</li></ol></li><li>绑定过程: Channel执行EventLoop, 在Channel生命周期中, 可以多次绑定和解绑EventLoop。</li></ol><h3 id="服务编排层" tabindex="-1">服务编排层 <a class="header-anchor" href="#服务编排层" aria-label="Permalink to &quot;服务编排层&quot;">​</a></h3><p>负责组装各类服务, 用以实现网络事件的动态编排和有序传播。</p><ol><li><p>ChannelPipeline: 负责组装各种ChannelHandler, 实际数据的编解码以及加工处理操作由ChannelHandler完成。当I/O读写事件触发时, ChannelPipeline会一次调用ChannelHandler列表对Channel的数据进行拦截和处理。每一个新的Channel会对应绑定一个新的ChannelPipeline。一个ChannelPipeline关联一个EventLoop, 一个EventLoop仅会绑定一个线程。</p><p><img src="https://i.loli.net/2021/11/24/PU1NWjTLuhOcst7.png" alt="image-20210725185513665"></p><ol><li>客户端和服务端一次完整的请求应答过程: 客户端出站(请求数据) -&gt; 服务端入站(解析数据并执行业务逻辑) -&gt; 服务端出站(响应结果)</li></ol></li><li><p>ChannelHandler: 一般通过ChannelHandler间接操作Channel。</p></li><li><p>ChannelHandlerContext: 保存ChannelHandler的上下文, 实现ChannelHandler之间的交互, 包含ChannelHandler生命周期的所有事件, 如connect､ bind､ read､ flush､ write､ close等。</p></li></ol><h3 id="组件关系" tabindex="-1">组件关系 <a class="header-anchor" href="#组件关系" aria-label="Permalink to &quot;组件关系&quot;">​</a></h3><p><img src="https://i.loli.net/2021/11/24/IWnKaH5Fyr7iVQu.png" alt="image-20210725190453102"></p>',15),r=[o];function i(p,h,d,c,s,C){return n(),t("div",null,r)}const _=e(l,[["render",i]]);export{v as __pageData,_ as default};
