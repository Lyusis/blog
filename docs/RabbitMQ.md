# RabbitMQ

## 底层原理

### AMQP协议

#### 定义

AMQP协议作为RabbitMQ的规范, 规定了RabbitMQ对外接口。

![](https://i.loli.net/2021/11/24/XIjAHC38gQbhx4T.png)

#### 内容详解

1. Broker: 接收和分发消息的应用, RabbitMQ就是Message Broker。

2. Virtual Host: 虚拟Broker, 将多个单元隔离开。

3. Connection: Publisher/Consumer和Broker之间的TCP连接。

4. Channel: Connection内部建立的逻辑连接, 通常每个线程创建单独的channel。

5. Routing Key: 路由键, 用来指示消息的路由转发。

6. Exchange: 交换机, 根据绑定关系和路由键为消息提供路, 将消息转发至相应的队列。

- Exchange有4种类型: 
  1. Direct(直接路由): Message中的Routing Key如果和Binding Key一致, Direct Exchanage则将message发到对应的queue中。简单来说, Exchange将匹配Routing和Binding的Key值, 和Queue的名称没有关系。
  2. Fanout(广播路由): 广播消息, 每个队列的消费者都会收到消息。
  3. Topic(话题路由): 根据Routing Key及通配规则, Topic Exchange将消息分发到目标Queue中
     1. 全匹配: 与Direct类似。
     2. 通过通配符限制发送对象:
        1. Binding Key中的`#`匹配任意个数word。
        2. Binding Key中的`*`匹配1个word。

  4. Headers: Headers用的很少, 以前三种为主。


7. Queue: 消息队列, 消息最终被送到这里等待consumer取走。
8. Binding: exchange和queue之间的虚拟连接, 用于message的分发数据。


## 实际操作

### 声明消息队列、交换机、绑定、消息的处理、发送

```Java
// 管控台默认地址: localhost:15672
public void handleMessage() throws IOException, TimeoutException{
  ConnectionFactory connectionFactory = new ConnectionFactory();
  connectionFactory.setHost("localhost");
  
  try(Connection connection = connectionFactory.newConnection();
    Channel channel = connection.createChannel()) {
      
    // 交换机定义
    channel.exchangeDeclare(
      exchange:"exchange名称",
      type:BuiltinExchangeType.DIRECT, // 交换机模式
      durable:true, // 是否持久化
      autoDelete:false, // 是否主动回收不使用的交换机
      arguments:null // 额外属性
    );
    
    // 队列定义
    channel.queueDeclare(
      queue:"queue名称",
      durable:true,
      exclusive:false, // 是否独占
      autoDelete:false,
      arguments:null
    );
    
    // 绑定队列
    channel.queueBind(
      queue:"queue名称", 
      exchange:"交换机名称", 
      routingKey:"自定义key"
    );
  }
}

public void main(String[] args) {
  ConnectionFactroy connectionFactory = new ConnectionFactory();
  connectionFactory.setHost("localhost");
  
  // 公开发送消息
  try(Connection connection = connectionFactory.newConnection();
    Channel channel = connection.createChannel()) {
      String messageToSend = objectMapper.writeValueAsString(orderMessageDTO);// Jackson的OrderMapper用于序列化
      channel.basicPublish(
        exchange:"exchange名称",
        routingKey:"自定义key",
        props: null, // 特殊属性
        messageToSend.getBytes() // 消息体, 字节
      )
    }
}
```
