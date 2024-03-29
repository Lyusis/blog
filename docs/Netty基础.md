# Netty基础

## 整体结构

1. Core 核型层: 提供底层网络同行的通用抽象和实现, 包括可扩展的事件模型, 通用的通讯API, 支持零拷贝的ByteBuf等。
2. Protocal Support 协议支持层: 覆盖了主流协议的编解码实现, 如HTTP､ SSL､ Protobuf､ 压缩､ 大文件传输､ WebSocket､ 文本､ 二进制等。并且支持自定义应用层协议。
3. Transport Service 传输服务层: 传输服务层提供了网络传输能力的定义和实现方法, 支持Socket､ HTTP隧道､ 虚拟机管道等传输方式。设计具备通用性和可扩展性。

## 逻辑架构

### 网络通信层

网络通信层的职责是执行网络I/O的操作, 支持多种网络协议和I/O模型的连接操作。

1. BootStrap: 主要负责整个Netty程序的启动､ 初始化､ 服务器连接等过程。可用于连接远端服务器, 只绑定一个EventLoopGroup(Boss)。

2. ServerBootStrap: 服务于服务端的BootStrap。用于服务端启动绑定本地端口, 绑定两个EventLoopGroup(Worker)。

   1. 每个服务器中都会有一个Boss, 会有一群做事情的Worker。 
   2. Boss会不停地接收新的连接, 将连接分配给一个个Worker处理连接。

3. Channel: 网络通信的载体, 提供了基本的API用于网络I/O操作, 如register､ bind､ connect､ read､ write､ flush等。Netty自己实现的Channel是以JDK NIO Channel为基础的。

   1. Channel家族类

      - NioServerSocketChannel 异步TCP服务端

      - NioSocketChannel 异步TCP客户端

      - OioServerSocketChannel同步TCP服务端

      - OioSocketChannel同步TCP客户端

      - NioDatagramChannel异步UDP连接

      - OioDatagramChannel同步UDP连接

   2. Channel生命周期

      Channel会有多种事件状态, 如连接建立､ 连接注册､ 数据读写､ 连接销毁等。

      | 事件                | 说明                                       |
      | ------------------- | ------------------------------------------ |
      | channelRegistered   | Channel创建后被注册到EventLoop上           |
      | channelUnregistered | Channel创建后未注册或者从EventLoop取消注册 |
      | channelActive       | Channel处于就绪状态, 可以被读写            |
      | channelInactive     | Channel处于非就绪状态                      |
      | channelRead         | Channel可以从远端读取到数据                |
      | channelReadComplete | Channel读取数据完成                        |

### 事件调度层

通过Reactor线程模型对各类事件进行聚合处理, 通过Selector主循环线程集成多种事件, 核心组件包括EventLoopGroup､ EventLoop。

1. EventLoop和EventLoopGroup(本身也是最常用的线程模型之一)等同于线程和线程池的关系。EventLoopGroup是Netty Reactor线程模型的具体实现方式。
   1. 单线程模型: EventLoopGroup只包含一个EventLoop, Boss和Worker使用同一个EventLoopGroup。
   2. 多线程模型: EventLoopGroup包含多个EventLoop, Boss和Worker使用同一个EventLoopGroup。
   3. 主从多线程模型: EventLoopGroup包含多个EventLoop, Boss是主Reactor, Worker是从Reactor中主要负责Reactor新网络连接的Channel创建的, 然后把Channel注册到Reactor
2. 绑定过程: Channel执行EventLoop, 在Channel生命周期中, 可以多次绑定和解绑EventLoop。

### 服务编排层

负责组装各类服务, 用以实现网络事件的动态编排和有序传播。

1. ChannelPipeline: 负责组装各种ChannelHandler, 实际数据的编解码以及加工处理操作由ChannelHandler完成。当I/O读写事件触发时, ChannelPipeline会一次调用ChannelHandler列表对Channel的数据进行拦截和处理。每一个新的Channel会对应绑定一个新的ChannelPipeline。一个ChannelPipeline关联一个EventLoop, 一个EventLoop仅会绑定一个线程。

   ![image-20210725185513665](https://i.loli.net/2021/11/24/PU1NWjTLuhOcst7.png)

   1. 客户端和服务端一次完整的请求应答过程: 客户端出站(请求数据) -> 服务端入站(解析数据并执行业务逻辑) -> 服务端出站(响应结果)

2. ChannelHandler: 一般通过ChannelHandler间接操作Channel。

3. ChannelHandlerContext: 保存ChannelHandler的上下文, 实现ChannelHandler之间的交互, 包含ChannelHandler生命周期的所有事件, 如connect､ bind､ read､ flush､ write､ close等。

### 组件关系

![image-20210725190453102](https://i.loli.net/2021/11/24/IWnKaH5Fyr7iVQu.png)

