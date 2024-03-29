# Java多线程基础知识

## 从单线程到多线程

### 线程同步synchronized和volatile

#### 加锁和释放锁的原理

1. 获取和释放锁的时机: 内置锁

2. 获得monditor锁的时候计数器就会加1, 重入的话就是累加, 退出时则减去1, 直到monditor计数器重新变为0.

3. 加锁次数计数器: JVM负责跟踪对象被加锁的次数. 线程第一次给对象加锁的时候, 计数变为1. 每当这个相同的线程在此对象上再次获得锁时, 计数会递增.每当任务离开时, 计数递减, 当计数为0的时候, 锁被完全释放.

#### 线程同步锁synchronized

同步锁分为对象锁和类锁两种, 对象锁可以简单认为是this锁, 而类锁即位*.class锁. 对象锁仅锁住当前对象的资源, 不影响其他线程(全局资源除外). 而类锁的适用范围则扩大到所有该类的对象. 除了显式的表明锁之外, 也可以通过加载在方法名上的方式加上.特别注意的是, 两种锁并不相同, 并不会互斥.抛出异常后可以自动释放锁.

1. 将synchronized加载在需要互斥的代码上, 是对象锁的一种形式

 ```java
 synchronized (this) {  
     for(int i = 0; i < 10; i++) {  
         System.out.print(name.charAt(i));  
     }  
 } 
 ```


我们也可以不使用this来指代线程, 而是**使用.class**来实现全局的同步, 实现类锁效果.
2. 将synchronized加在需要互斥的方法上, 是对象锁的一种形式

 ```java
 public synchronized void output(String name) { 
     // TODO 线程输出方法  
     for(int i = 0; i < 10; i++) { 
         System.out.print(name.charAt(i));  
     }  
 }
 ```


同步锁操作的本质是锁住一个原子事务, 排斥其他事务的干扰, 所以也有引发死锁的可能性.
每个锁对(JLS中叫monitor)都有两个队列, 一个是就绪队列, 一个是阻塞队列, 就绪队列存储了将要获得锁的线程, 阻塞队列存储了被阻塞的线程, 当一个线程被唤醒(notify())后, 才会进入到就绪队列, 等待CPU的调度, 反之, 当一个线程被wait()后, 就会进入阻塞队列, 等待下一次被唤醒. 当第一个线程执行输出方法时, 获得同步锁, 执行输出方法, 恰好此时第二个线程也要执行输出方法, 但发现同步锁没有被释放, 第二个线程就会进入就绪队列, 等待锁被释放. 一个线程执行互斥代码过程如下:
1. 获得同步锁;
2. 清空工作内存;
3. 从主内存拷贝对象副本到工作内存;
4. 执行代码(计算或者输出等);
5. 刷新主内存数据;
6. 释放同步锁.
所以, synchronized既保证了多线程的并发有序性, 又保证了多线程的内存可见性.
**静态方法锁**: 即在方法互斥的基础上, 添加statics关键字, 是类锁的一种形式, 实现了全局同步的同时, 保证了任务顺序.

#### 使用this和object的区别

this是对当前类做控制, 即保证当前类是线程安全的, 而对于非线程安全的类(具有非同步方法的类)在调用时, 为保证其线程安全性可以在调用时使用synchronized(object)确保被调用类的线程安全(便于管理).

#### 可重入性和不可中断

1. 可重入性: 指获得锁之后, 对象可以重复使用该锁. 可以在一定程度上避免死锁. Synchronized关键字的可重入性粒度是线程范围的, 不限方法和位置.

2. 不可中断: Synchronized关键字是不可中断的, 这一点与lock类是不同的, 值得注意.

#### 同步锁的缺陷

1. 效率低: 锁的释放情况少, 试图获得锁时不能设定超时, 不能中断一个正在试图获得锁的线程.

2. 不够灵活: 加锁和释放锁的时机单一, 每个锁仅有单一的条件(某个对象), 可能是不够的.

3. 无法知道是否成功获取到锁.

### volatile修饰符

Volatile是第二种Java多线程同步的机制, 一个变量可以被volatile修饰, 在这种情况下内存模型(主内存和线程工作内存)确保所有线程可以看到一致的变量值. 相比于synchronized或者Lock相关类更加轻量, 因为volatile不会引发上下文切换等消耗比较大的操作.如果一个变量被volatile关键词修饰, 那么JVM就知道了这个变量可能会被并发修改.但是开销小也意味着功能小, volatile做不到synchoronized关键词的原子级保护, 只能在有限情况下适用.

#### 适用与不适用场景

1. 不适合用于多线程累加等操作

2. 适用场合: 如果一个变量自始至终只是被各个线程赋值(即该操作与变量之前的状态没有关系), 而没有其他操作, 那么就可以用volatile代替synchronized或者代替原子变量, 因为赋值自身是有原子性的, 而volatile又保证了可见性, 所以就足以保证线程安全.

3. 适用场合: 触发器, 当执行某些操作之前要确保另一些操作先执行, 可以使用一个boolean类型作为标识符, 也即触发器.

4. 禁止重排序

 ```java
 class Test {  
     static volatile int i = 0, j = 0;  
 }
 ```


one方法和two方法还会并发的去执行, 但是加上volatile可以将共享变量i和j的改变直接响应到主内存中, 这样保证了主内存中i和j的值一致性, 然而在执行two方法时, 在two方法获取到i的值和获取到j的值中间的这段时间, one方法也许被执行了好多次, 导致j的值会大于i的值. 所以volatile可以保证内存可见性, 不能保证并发有序性. volatile是一种弱的同步手段, 相对于synchronized来说, 某些情况下使用, 可能效率更高, 因为它不是阻塞的, 尤其是读操作时. 另外**volatile和final不能同时修饰一个字段**.

### 线程协作-生产者/消费者问题

在很多情况下, 仅仅同步是不够的, 还需要线程与线程协作(通信), 生产者/消费者问题是一个经典的线程同步以及通信的案例. 该问题描述了两个共享固定大小缓冲区的线程, 即所谓的“生产者”和“消费者”在实际运行时会发生的问题. 生产者的主要作用是生成一定量的数据放到缓冲区中, 然后重复此过程. 与此同时, 消费者也在缓冲区消耗这些数据. 该问题的关键就是要保证生产者不会在缓冲区满时加入数据, 消费者也不会在缓冲区中空时消耗数据. 要解决该问题, 就必须让生产者在缓冲区满时休眠（要么干脆就放弃数据）, 等到下次消费者消耗缓冲区中的数据的时候, 生产者才能被唤醒, 开始往缓冲区添加数据. 同样, 也可以让消费者在缓冲区空时进入休眠, 等到生产者往缓冲区添加数据之后, 再唤醒消费者, 通常采用线程间通信的方法解决该问题. 如果解决方法不够完善, 则容易出现死锁的情况. 出现死锁时, 两个线程都会陷入休眠, 等待对方唤醒自己. 该问题也能被推广到多个生产者和消费者的情形.

```java
public class WrongWayVolatileFixed {

    public static void main(String[] args) throws InterruptedException{
        WrongWayVolatileFixed body = new WrongWayVolatileFixed();
        ArrayBlockingQueue storage = new ArrayBlockingQueue<>(10);

        Producer producer =  body.new Producer(storage);
        Thread producThread =  new Thread(producer);
        producThread.start();
        Thread.sleep(1000);

        Consumer consumer = body.new Consumer(storage);
        while (consumer.needMoreNum()){
            System.out.println(consumer.storage.take() + "被消费了");
            Thread.sleep(100);
        }
        System.out.println("消费者不需要更多数据了");
        producThread.interrupt();
    }

    class Producer implements Runnable {
        BlockingQueue storage;

        public Producer(BlockingQueue storage) {
            this.storage = storage;
        }

        @Override
        public void run() {
            int num = 0;
            try {
                while (num < 10000 && !Thread.currentThread().isInterrupted()){
                    if (num % 100 == 0){
                        storage.put(num);
                        System.out.println(num + "是100的倍数, 被放到仓库中了.");
                    }
                    num++;
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally{
                System.out.println("生产者结束运行");
            }
        }
    }

    class Consumer {
        BlockingQueue storage;

        public Consumer(BlockingQueue storage){
            this.storage = storage;
        }

        public boolean needMoreNum() {
            if(Math.random() > 0.9) {
                return false;
            }
            return true;
        }
    }
}
```


在调用wait方法时, 都是用while判断条件的, 而不是if, 在wait方法说明中, 也推荐使用while, 因为在某些特定的情况下, 线程有可能被假唤醒, 使用while会循环检测更稳妥. wait和notify方法必须工作于synchronized内部, 且这两个方法只能由锁对象来调用.

### Object和Thread类中的重要线程方法

- 等待池: 假设一个线程A调用了某个对象的wait()方法, 线程A就会释放该对象的锁后, 进入到了该对象的等待池, 等待池中的线程不会去竞争该对象的锁.

- 锁池: 只有获取了对象的锁, 线程才能执行对象的synchronized()代码, 对象的锁每次只有一个线程可以获得, 其他线程只能在锁池中等待

线程优先级

#### wait, notify, notifyAll作用和用法

##### 阻塞阶段

直到一下午4种情况之一发生时, 才会被唤醒
1. 另一个线程调用这个对象的notify()方法且刚好被唤醒的是本线程
2. 另一个线程调用这个对象的notifyAll()方法
3. 过了wait(long timeout)规定的超时时间, 如果传入0就是永久等待
4. 线程自身调用了interrupt()
   唤醒阶段: notify(), notifyAll()
   遇到中断: 如果被中断了, 就会抛出异常, 并释放moniter锁
   必须放在Synchronized字段保护的代码中, 防止锁的混乱调用

##### notify()
选择一个wait状态线程进行通知, 并使它获得该对象上的锁, 但不惊动其他同样在等待被该对象notify的线程们(该选择过程随机), 当第一个线程运行完毕以后释放对象上的锁此时如果该对象没有再次使用notify()语句, 则即便该对象已经空闲, 其他wait状态等待的线程由于没有得到该对象的通知, 继续处在wait状态, 直到被对象唤醒.
此方法只应由作为此对象监视器(final void)的所有者的线程来调用. 通过以下三种方法之一, 线程可以成为此对象监视器的所有者:

1. 通过执行此对象的同步Sychronized实例方法.
2. 通过执行在此对象上进行同步的Synchronized语句的正文.
3. 对于 Class 类型的对象, 可以通过执行该类的同步静态方法.
   一次只能有一个线程拥有对象的监视器. 抛出: [IllegalMonitorStateException]如果当前的线程不是此对象监视器的所有者.
   notify()方法随机唤醒对象的等待池中的一个线程, 进入锁池; notifyAll()唤醒对象的等待池中的所有线程, 进入锁池. 同时唤醒的线程不一定立刻从Waiting状态跳转到Runnable状态, 也有可能直接跳转到Blocked状态, 而又或者直接抛出异常进入Terminated状态, 都是有可能的.

##### wait()
导致当前的线程等待, 直到其他线程调用此对象的notify()方法或notifyAll()方法, 或者超过指定的时间量. 当前的线程必须拥有此对象监视器(monitor锁, 会释放掉).

此方法导致当前线程（称之为 T ）将其自身放置在对象的等待集中, 然后放弃此对象上的所有同步要求. 出于线程调度目的, 线程 T 被禁用, 且处于休眠状态, 直到发生以下四种情况之一:

  1. 其他某个线程调用此对象的notify()方法, 并且线程 T 碰巧被任选为被唤醒的线程.
  2. 其他某个线程调用此对象的notifyAll()方法.
  3. 其他某个线程中断线程T.
  4. 已经到达指定的实际时间. 但是, 如果 timeout 为零, 则不考虑实际时间, 该线程将一直等待, 直到获得通知.
     然后, 从对象的等待集中删除线程 T, 并重新进行线程调度. 然后, 该线程以常规方式与其他线程竞争, 以获得在该对象上同步的权利; 一旦获得对该对象的控制权, 该对象上的所有其同步声明都将被还原到以前的状态 - 这就是调用wait 方法时的情况. 然后, 线程 T 从wait()方法的调用中返回. 所以, 从wait()方法返回时, 该对象和线程 T 的同步状态与调用wait()方法时的情况完全相同.

```java
 /**
   *使用wait()和notify()实现一个阻塞队列, 并应用到生产者-消费者模式
   */
 import java.util.Date;
 import java.util.LinkedList;
 
 public class ProducerConsumerModel {
     public static void main(String[] args) {
         EventStorage eventStorage = new EventStorage();
         Producer producer = new Producer(eventStorage);
         Consumer consumer = new Consumer(eventStorage);
         new Thread(producer).start();
         new Thread(consumer).start();
     }
 }
 
 class Producer implements Runnable {
         
     private EventStorage storage;
 
     public Producer(
         EventStorage storage
     ) {
         this.storage = storage;
     }
 
     @Override
     public void run() {
         for (int i = 0; i < 100; i++) {
             storage.put();
         }
     }
 }
 
 class Consumer implements Runnable {
     private EventStorage storage;
     
     public Consumer(
         EventStorage storage
     ) {
         this.storage = storage;
     }
 
     @Override
     public void run() {
         for (int i = 0; i < 100; i++) {
             storage.take();
         }
         
     }
 }
 
 class EventStorage{
     private int maxSize;
     private LinkedList<Date> storage;
 
     public EventStorage(){
         maxSize = 10;
         storage = new LinkedList<>();
     }
 
     public synchronized void put() {
         while (storage.size() == maxSize) {
             try {
                 wait();
             } catch (InterruptedException e) {
                 e.printStackTrace();
             }
         }
         storage.add(new Date());
         System.out.println("仓库里有了" + storage.size() + "个产品");
         notify();
     }
 
     public synchronized void take(){
         while (storage.size() == 0) {
             try {
                 wait();
             } catch (InterruptedException e) {
                 e.printStackTrace();
             }
         }
         System.out.println("拿到了" + storage.poll() + ", 现在仓库里还剩下" + storage.size());
         notify();
     }
 }
```

##### interrupt()

interrupt是用来通知的, 而不是强制.
其作用是中断此线程(此线程不一定是当前线程, 而是指调用该方法的Thread实例所代表的线程), 但实际上只是给线程设置一个中断标志, 线程仍会继续运行, 设置其中断状态为true, 通过isInterrupted()方法可以得到这个线程状态,中断为true, 反之则为false. 如果想要调用, 可以在run()方法内直接调用进行判断从而实现功能.
这本质上是一个合作机制, 用一个线程来通知另一个线程该停止或者说中断, 这种协作式的方式是必要的, 我们很少希望某个任务、线程或服务立即停止, 因为这种立即停止会使得恭喜那个的数据结构处于不一致的状态. 相反, 在编写任务和服务时可以使用一种协作的方式: 但需要停止时, 他们首先会清楚当前正在执行的工作, 然后再结束. 则提供了更好的灵活性, 因为任务本身的代码比发出取消请求的代码更清楚如何执行清除工作.
**interrupted()方法**: 测试**当前线程**, 即执行这个方法的线程是否被中断, 返回一个boolean并清除中断状态, 第二次再调用时中断状态已经被清除, 将返回一个false.
**isInterrupted()方法**: 作用是只测试此线程是否被中断, 不清除中断状态。
如果线程在调用

1. Object 类的 wait()、wait(long) 或 wait(long, int) 方法
2. Thread.join()、join(long)、join(long, int)、sleep(long) 或 sleep(long, int) 方法
3. java.util.concurrent.BlockingQueue.take()/put(E)(阻塞队列)
4. java.util.concurrent.locks.Lock.lockInterruptibly()(锁)
5. java.util.concurrent.CountDownLatch.await()
6. java.util.concurrent.CyclicBarrier.await()
7. java.util.concurrent.Exchanger.exchange(V)
8. java.nio.channels.InterruptibleChannel的相关方法
9. java.nio.channels.Selector的相关方法

等的过程中受阻, 则其中断状态将被清除, 它还将收到一个 InterruptedException。 我们可以捕获该异常, 并且做一些处理。
通常我们应当抛出InterruptedException给顶层方法进行处理, 如果不想或者无法传递InterruptedException(例如用run方法的时候, 就不可以), 那么应该选择在catch字句中调用Thread.currentThread().interrupt()来恢复设置中断状态, 以便于在后续的执行依然能够检查到刚才发生了中断. 切忌不可屏蔽(无效处理)该中断.

###### 为什么volatile停止线程不够全面

1. 这种做法是错误的, 或者说是不够全面的, 在某些情况下虽然可以用, 但是某些情况下有严重问题: 如果我们遇到了线程长时间阻塞(这是一种很常见的情况, 例如生产者-消费者问题中就存在这样的情况), 就没办法及时唤醒他, 或者永远都无法唤醒该线程, 而interrupt设计之初就是把wait等长期阻塞作为一种特殊情况考虑在哪了, 我们应该用interrupt思维来停止线程.
   **无法响应中断时如何停止线程**

2. 如果线程阻塞是因为调用了wait()、sleep()、join()等方法, 可以中断线程, 通过抛出InterruptedException异常来唤醒该线程, 但是对于不能响应InterruptedException的阻塞, 并没有一个通用的解决方案. 但是我们可以利用特定的其他的可以响应中断的方法, 比如ReentrantLock.lockInterruptibly(), 比如关闭套接字(Socket)使线程立即返回等方法来达到目的.总结来说, 如果不支持响应中断, 就使用特定方法来唤起, 没有万能方法.

##### yield() 

线程让步, 用于正在执行的线程, 在某些情况下让出CPU资源, 让给其它线程执行. 注意: 仍然是Runnable状态, 甚至不释放锁. 所以既是让步了之后, 也可能会被立刻被调用. 所以不推荐使用.

##### sleep()

在指定的毫秒数内让当前正在执行的线程休眠(暂停执行). 在sleep过程中被interrupt中断时, 会输出sleep interrupted中断异常. 如果sleep在循环体内, 那就不需要使用isInterrupted检测中断了, sleep会检测. 但是要注意, try-catch需要在循环体外部, 而不仅仅是在sleep上.

##### join()

线程合并, 也称线程加入, 所谓合并, 就是等待其它线程执行完, 再执行当前线程. 加入则可以理解为让加入的线程先执行.

## Java内存模型(JMM)

在Java代码中，使用的控制并发的手段例如synchronized关键字，最终也是要转化为CPU指令来生效的，我们来回顾一下从Java代码到最终执行的CPU指令的流程：

1. 最开始，我们编写的Java代码，是*.java文件

2. 在编译（javac命令）后，从刚才的**.java文件会变出一个新的Java字节码文件（**.class）

3. JVM会执行刚才生成的字节码文件（*.class），并把字节码文件转化为机器指令

4. 机器指令可以直接在CPU上运行，也就是最终的程序执行

而不同的JVM实现会带来不同的“翻译”，不同的CPU平台的机器指令又千差万别；所以我们在java代码层写的各种Lock，其实最后依赖的是JVM的具体实现（不同版本会有不同实现）和CPU的指令，才能帮我们达到线程安全的效果。
由于最终效果依赖处理器，不同处理器结果不一样，这样无法保证并发安全，所以需要一个标准，让多线程运行的结果可预期，这个标准就是JMM。

### JVM内存结构/Java内存模型/Java对象模型辨析

JVM内存结构, 和Java虚拟机的运行时区域有关.
Java内存模型, 和Java的并发编程有关.
Java对象模型, 和Java对象在虚拟机中的表现形式有关.

#### JVM内存结构

- Class文件

-> Class Loader (类加载器)
-> Runtime Data Area (运行时数据区)
-> Method Area (方法区)
-> Heap (堆)
-> Java Stack (Java栈)
-> Native Method Stack (本地方法栈)
-> Program Counter Register (程序计数器)
-> Execution Engine (执行引擎)
-> Native Interface (本地接口)
-> Native Libraries (本地库)

#### Java对象模型

  - Java对象自身的存储模型

  - JVM会给这个类创建一个instanceKlass, 保存在方法区, 用来在JVM层表示该Java类

  - 当我们在Java代码中, 使用new创建一个对象的时候, JVM会创建一个instanceOopDesc对象, 这个对象中包含了对象头以及实例数据.

### Java内存模型(JMM)

Java Memory Model
为什么需要JMM:
1. C语言不存在内存模型的概念
2. 依赖处理器, 不同处理器结果不一样
3. 无法保证并发安全
4. 需要有一个标准, 让多线程运行结果可预期
**所以JMM本质上是一种规范**
* 需要各个JMM的实现来遵守JMM规范, 以便于开发者可以利用这些规范, 更方便地开发多线程程序.
* 如果没有一个这样的JMM内存模型来规范, 那么很可能经过了不同JVM的不同规则的重排序之后, 导致不同的虚拟机上运行的结果不一样, 这是很大的问题.
* volatile、synchronized、Lock等的原理都是JMM
* 如果没有JMM, 那就需要我们自己指定什么时候用内存栅栏等, 导致开发十分麻烦.

#### 重排序

在线程内部的两行代码的实际执行顺序和代码在Java文件中的顺序不一致, 代码指令并不是严格按照代码语句顺序执行的, 他们的顺序被改变了, 这就是重排序.
**重排序的3种情况**

  1. 编译器优化
编译器（包括JVM，JIT编译器等）出于优化的目的（例如当前有了数据a，那么如果把对a的操作放到一起效率会更高，避免了读取b后又返回来重新读取a的时间开销），在编译的过程中会进行一定程度的重排，导致生成的机器指令和之前的字节码的顺序不一致。

  2. 指令重排序
CPU 的优化行为，和编译器优化很类似，是通过乱序执行的技术，来提高执行效率。所以就算编译器不发生重排，CPU 也可能对指令进行重排，所以我们开发中，一定要考虑到重排序带来的后果。

  3. 内存“重排序”
内存系统内不存在重排序，但是内存会带来看上去和重排序一样的效果，所以这里的“重排序”打了双引号。由于内存有缓存的存在，在JMM里表现为主存和本地内存，由于主存和本地内存的不一致，会使得程序表现出乱序的行为。

#### 可见性

读取值和预测值不相同

**原因**: 不同的CPU并不清楚其他CPU的操作, 所以容易导致读取到的数据其实已经过期了.

  - 高速缓存的容量比主内存小, 但是速度仅次于寄存器, 所以在CPU和主内存之间就多了Cache层

  - 线程间的对于共享变量的可见性问题不是直接由多核引起的, 而是由多缓存引起的.

  - 如果所有个核心都只用一个缓存, 那么也就不存在内存可见性问题了.

  - 每个核心都会将自己需要的数据读到独占缓存中, 数据修改后也是写入到缓存中, 然后等待刷入到主存中. 所以会导致有些核心读取的值是一个过期的值.

#### 主内存和本地内存

Java作为高级语言, 屏蔽了底层细节, 用JMM定义了一套读写内存数据的规范, 虽然我们不再需要关心一级缓存和二级缓存的问题, 但是JMM抽象出了主内存和本地内存的概念.

本地内存: 也称工作内存, 并不是真的是一块给每个线程分配的内存, 而是JMM的一个抽象, 是对与寄存器、一级缓存、二级缓存等的抽象.

主内存: 主内存主要包括本地方法区和堆。所有的共享变量存在于主内存中, 通过主内存进行共享.

**主内存和本地内存的关系**:

1. 所有的变量都存储在主内存中, 同时每个线程也有自己独立的工作内存, 工作内存中的变量内容是主内存中的拷贝.
2. 线程不能直接读写主内存中的变量, 而是只能操作自己工作内存中的变量, 然后再痛不到主内存中.
3. 主内存是多个线程共享的, 当线程间不共享工作内存, 如果线程间需要通信, 必须借助主内存中转来完成.
* 所有的共享变量存在主内存中, 每个线程有自己的本地内存, 而且线程读写 共享数据也是通过本地内存交换的, 所以才导致了可见性问题.

### happens-before

#### **两种解释**

1. happens-before规则是用来解决可见性问题的: 在时间上, 动作A发生在动作B之前, B保证能看见A, 这就是happens-before.
2. 两个操作可以用happens-before来确定他们的执行顺序: 如果一个操作happens-before于另一个操作, 那么我们锁第一个操作对于第二个操作是可见的.

#### happens-before的规则

  1. 单线程规则
happens-before只发生在单线程内, 后方的操作一定能看到前面的操作(前提是不发生重排序)

  2. 锁操作(synchronized和Lock)
加锁之后, 一定能看到前一次解锁前的所有操作

  3. volatile变量
只要变量被volatile修饰, 就一定可以看到读取该变量前的所有操作

  4. 线程启动
子线程的启动语句, 一定能看到启动之前主线程的所有操作

  5. 线程join
一旦使用了join, 那么后方语句一定能看到join前的所有语句

  6. 传递性
如果happens-before(A, B)而且happens-before(B, C), 那么可以推出happens-before(A, C)

  7. 中断
一个线程被其他线程interrupt, 那么检测中断(isInterrupted)或者抛出InterruptedException一定能看到.

  8. 构造方法
对象构造方法的最后一条指令happens-before于finalize()方法的第一行指令

  9. 工具类的happens-before原则

          1. 线程安全的容器get一定能看到在此之前的put等存入动作

        2. CountDownLatch
        3. Semaphore
        4. Future
        5. 线程池
        6. CyclicBarrier

### JMM使用实例: 单例模式

#### 单例模式适用场景

1. 无状态的工具类: 比如日志工具类, 不管我们在哪里使用, 我们只需要其帮助记录日志信息, 除此之外, 并不需要他的实例对象上储存任何状态, 这时候我们就需要一个实例对象即可.
2. 全局信息类: 比如我们在一个类上记录网站的访问次数, 我们不希望有的访问被记录在对象A上, 有的却被记录在对象B上, 这时候我们就让这个类成为单例

#### 单例模式的实现方法

  1. 饿汉式(静态常量)(可用): 实例化一个private final static对象, 然后将构造函数设为private, 最后通过public方法进行调用对象.

     ```java
     public class Singleton{
       private final static Singleton instance;
       pivate Singteton(){}
       public static Singleton getInstance(){
         return Singleton.instance;
       }
     }
     ```


  2. 静态代码块: 对于静态对象, 不直接实例化, 而是放到静态代码块中进行实例化.

  3. 懒汉式(线程不安全): 在调用方法中进行实例化, 但是不同的线程会实例化不同的对象, 所以失去了单例效果, 导致线程不安全

     ```java
     public class Singleton{
       private static Singleton instance;
       pivate Singteton(){}
       public static Singleton getInstance(){
         if (instance == null) {
           instance = new Singleton();
         }    
         return instance;
       }
     }
     ```


  4. 懒汉式(线程安全)(不推荐使用): 在获取方法上添加synchronized关键字, 但是效率太低, 不推荐使用.

  5. 懒汉式(改2, 线程不安全): 在实例化对象的语句上(获取方法)添加synchronized关键字, 但是当两个线程都通过instance == null判断进入了代码段后, 就会不受控制的创建两个实例, 所以依旧是线程不安全的.

  6. 双重检查(推荐用, 面试推荐)(也称双重检查模式或双重锁模式)

      > 因为新建对象不是原子操作, 所以需要使用volatile使得其变为原子操作, 在这里的双重检查想要防止的是重排序，是这种特殊情况：“在第一个线程退出synchronized之前，里面的操作执行了一部分，比如执行了new却还没执行构造函数，然后第一个线程被切换走了，这个时候第二个线程刚刚到第一重检查，所以看到的对象就是非空，就跳过了整个synchronized代码块，获取到了这个单例对象，但是使用其中的属性的时候却不是想要的值。”。
      
        ```java
         public class Singleton{
           private volatile static Singleton instance;
           pivate Singteton(){}
           public synchronized static Singleton getInstance(){
             if (instance == null) {
               synchronized(Singleton.class){
                 if (instance == null) {
                   instanche = new Singleton();
                 }
               }
             }    
             return instance;
           }
         }
        ```

  7. 静态内部类(推荐用)(会增加编程复杂性)

     ```java
     public class Singleton{
       private Singteton(){}
       private static class SingletonInstance{
         final Singleton INSTANCE = new Singleton();
       }
       public static Singleton getInstance(){
         return Singleton.INSTANCE;
       }
     }
     ```


  8. 枚举(推荐用, 生产推荐)

     ```java
     public enum Singleton{
       INSTANCE;
       public void whatever() {}
     }
     
     public class SingletonUse{
       Singleton.INSTANCE.whatever();
     }
     ```


## 线程池

### 线程池的属性

1. corePoolSize: 核心线程数, 线程池在完成初始化以后, 默认没有线程启动, 而接受任务之后会启动线程, 这时启动线程的上限即为corePoolSize

2. maxPoolSize: 最大线程数, 在核心线程数(上限)的基础上, 我们可能还需要进一步扩大线程数, 这时的上限即为该最大线程数, 扩容规则为: 当核心线程数与任务队列都满之后, 会进一步启动线程扩大吞吐量, 直至线程数到达最大线程数.

3. keepAliveTime: 保持存活时间, 指线程不再使用时, 空闲多久后(所指定时间)线程会回收

4. workQueue: 工作队列, BlockingQueue, 存放任务的数量

  1. 直接交接: SynchronousQueue, 只是通过该队列提交, 基本不储存, 注意提高corePoolSize和maxPoolSize

  2. 无界队列: LinkedBlockingQueue, 不会被塞满, maxPoolSize基本就无效了, 容易造成OOM

  3. 有界队列: ArrayBlockingQueue, 有上限

5. threadFactory: 当线程池需要新的线程来处理任务的时候, 会通过调用threadFactory来创建. 默认使用Executors.defaultThreadFactory.

6. Handler: 线程无法接受提交任务时的拒绝策略, 通常为任务队列与最大线程都满的情况.

判断顺序: corePoolSize->workQueue->maxPoolSize

在ThreadPoolExecutor类的参数中，变量名是maximumPoolSize；不过在org.springframework.scheduling.concurrent包的ThreadPoolExecutorFactoryBean类等其他类中，也有使用maxPoolSize作为参数名的情况，我们直接理解为maximumPoolSize和maxPoolSize是相同的就可以了。

线程池的核心线程数一般设置在CPU核心数的1-2倍之间, 而最大线程数则为10倍左右, 更好的确定线程数的方法是通过压力测试确定业务确实需要的线程数.

### 默认线程池

1. newFixedThreadPool: 固定数量的线程池, 进入的是LinkedBlockingQueue, 无容量上限队列, 所以当请求数越来越多, 并且无法及时处理完毕的时候, 也就是请求堆积的时候会容易造成占用大量的内存, 可能会导致OOM.

2. newSingleThreadExecutor: 单线程线程池. 与newFixedThreadPool的原理基本一致, 只是把线程数设置为1, 所以当请求堆积的时候, 也会占用大量的内存.

3. newCachedThreadPool: 可缓存线程池, 无界线程池(上限是整型最大值), 可能会创建超大量的线程, 以至于导致OOM. Cache指的是对线程的缓存, 如果一段时间线程空闲就回收.

4. newScheduledThreadPool: 支持定时及周期型执行任务. 可以设置initialDelay: 初始化延时, period: 两次开始执行最小间隔时间, unit: 计时单位.

|Parameter|FixedThreadPool|CachedThreadPool|ScheduledThreadPool|SingleThreaded|
|---|---|---|---|---|
|corePoolSize|constructor-arg|0|constructor-arg|1|
|maxpoolSize|same as corePoolSize|Integer.MAX_VALUE|Integer.MAX_VALUE|1|
|keepAliveTime|0 seconds|60 seconds|60 seconds|0 seconds|

### 停止线程池

1. shutdown: 初始化关闭线程池的流程, 会拒绝新的任务进入队列, 但是要到所有现存任务完成才会关闭线程池. 可以通过isShutdown判断是否进入Shutdown状态.

2. isTerminated: 用于检测整个线程池是不是完全终止了. awaitTermination: 等待一段时间, 如果在等待时间内线程都执行完毕了就输出true, 没有执行完毕就输出false. 另外被打断后会报InterruptException.

3. shutdownNow: 立刻关闭, 通过interrypted方法关闭线程, 任务队列中的任务则会返回.

### 拒绝策略

1. AbotrPolicy: 抛出异常

2. DiscardPolicy: 静默丢弃

3. DiscardOldestPolicy: 丢弃最旧任务

4. CallerRunsPolicy: 让提交者(主线程)进行执行, 可以降低提交速度

### 添加钩子

可以通过继承ThreadPoolExecutor类, 实现beforeExecute方法, 从而达成钩子的效果.

### Executor家族

1. Executor: 顶层方法, 只有一个execute(Runnable)方法, 用于执行线程

2. ExecutorService: 继承了Executor, 同时增加了一些shutdown之类的方法.

3. Executors: 工具类, 可以用于创建预定义线程池.

4. ThreadPoolExecutor: 支持自定义线程池等操作.

### 线程池状态

1. RUNNING: 接受新任务并处理排队任务

2. SHUTDOWN: 不接受新任务, 但排队处理任务

3. STOP: 不接受新任务, 也不处理排队任务, 并中断正在进行的任务

4. TIDYING: 所有任务都终止, workerCount为零时, 线程会转换到TIDYING状态, 并将运行terminate()钩子方法.

5. TERMINATED: terminate()运行完成

### 线程池执行注意点

1. 避免任务堆积

2. 避免线程数过度增加

3. 排查线程泄漏, 避免业务编写原因线程无法关闭

## Java多线程工具类

### ThreadLocal

TheadLocal是一个线程内部的储存类, 可以制定线程内存储数据, 同时也只有指定线程可以得到数据.

#### 适用场景

1. 每个线程需要一个独享的对象(通常是工具类, 例如SimpleDateFormat和Random)

2. 每个线程内需要保存全局变量(例如在拦截器中获取用户信息), 可以让不同方法直接使用, 避免参数传递的麻烦.

(注: 也可以用static的ConcurrentHashMap，把当前线程的ID作为key，把user作为value来保存，这样可以做到线程间的隔离，但是依然有性能影响。)

#### 作用

1. 让每个需要用到的对象在线程间隔离(每个线程都有自己的独立的对象)

2. 在任何方法中都可以轻松获取对象

根据共享对象的不同, 选择initialValue(第一次就需要把对象初始化出来)或者set(需要根据实际情况, 根据对象不同再生成不同的内容)

#### 优点

1. 达到线程安全

2. 不需要加锁, 提高执行效率

3. 更高效地利用内存, 节省开销: 相比于每个任务都新建一个SimpleDateFormat, 显然用ThreadLocal可以节省内存和开销

4. 免去传参的繁琐: 无论是工具类, 还是每个用户不同的用户名, 都可以再任何地方直接通过ThreadLocal拿到, 再也不需要每次都传同样的参数. ThreadLocal使得代码耦合度更低, 更优雅.

#### 结构

1. 每个Thread中都有一个ThreadLocalMap成员变量

2. 每个ThreadLocalMap中有多个ThreadLocal对象

#### 重要方法

1. `T initialValue()`: 该方法会返回当前线程对应的"初始值", 这是一个延迟加载的方法, 只有在调用get的时候才会被触发. 当线程第一次使用get方法访问变量时, 将调用此方法, 除非线程先前调用了set方法, 在这种情况下, 不会为线程调用initialValue方法. 通常, 每个线程最多调用一次此方法, 但如果已近调用了remove()后, 再调用get(), 则可以再次调用此方法. 如果不重写本方法, 这个方法会返回null. 一般使用匿名内部类的方法来重写initialValue()方法, 以便在后续使用中可以初始化副本对象.

   ```java
   // lambda表达式写法
   public static ThreadLocal<SimpleDateFormat> dateFormatThreadLocal = ThreadLocal.withInitial(()->new SimpleDateFormat("yyyy-MM-dd hh:ss:ss"));
   
   // 传参数
   class Service1 {
       public void process(String name) {
           User user = new User("NAME");
           UserContextHolder.holder.set(user);
       }
   }
   class UserContextHolder {
       public static ThreadLocal<User> holder = new ThreadLocal<>();
   }
   ```


2. `void set(T t)`: 为线程设置一个新值

3. `T get()`: 得到这个线程对应的ThreadLocalMap, 调用map.getEntry方法, 把ThreadLocal的引用作为参数传入, 取出map中属于本ThreadLocal的value. 如果是首次调用get(), 则会调用initialize来得到这个值.

4. `void remove()`: 删除对应线程的值

#### 注意点

1. 内存泄漏: 某个对象不再有用, 但是占用的内存却不能被回收. ThreadLocal中, key是基于弱引用实现的, 弱引用的特点是, 如果这个对象只被弱引用关联(没有任何强引用关联), 那么这个对象就可以被回收, 所以弱引用不会阻止GC. 所以主要是强引用的Value会泄漏, 正常情况下, 当线程终止, 保存在ThreadLocal里的value会被垃圾回收, 因为没有任何强引用了. 但是如果线程始终不终止(或者保持时间较久), 那么key对应的value就不能被回收, 因为有以下的调用链:

   ​	`Thread -> ThreadLocalMap -> Entry(key为null) -> Value`

   因为value和Thread之间还存在这个强引用链路, 所以导致value无法回收, 就可能会出现OOM.

   JDK已经考虑到了这个问题, 所以在set, remove, rehash方法中会扫描key为null的Entry, 并把对应的value设置为null, 这样value对象就可以被回收, 但是如果一个ThreadLocal不被使用, 那么实际上set, remove, rehash方法也不会被调用, 如果同时线程又不停止, 那么调用链就一直存在, 那么就导致了value的内存泄漏.

2. 如何避免内存泄漏(阿里规约): 调用remove方法, 就会删除对应的Entry对象, 可以避免内存泄漏, 所以使用完ThreadLocal之后, 应该主动调用remove方法.

### Lock锁

#### 为什么需要Lock: synchronize有什么问题

1. 效率低: 锁的释放情况少, 试图获得锁时不能设定超时, 不能中断一个正在试图获得锁的线程.

2. 不够灵活(读写锁更灵活): 加锁和释放的时机单一, 每个锁仅有单一的条件(某个对象), 可能是不够的.

3. 无法知道是否成功获取到锁.

#### 主要方法

1. lock(): 最普通的获取锁, 如果锁已被其他线程获取, 则进行等待. lock不会像synchronized一样在异常时自动释放锁, 因此最佳实践是, 在finally中释放锁, 以抱枕发生异常时, 锁一定被释放.

2. tryLock(): 尝试锁.

   ```java
   Lock lock = new ReentrantLock();
   if (lock.tryLock()) {
     try{
       method();
       // manipulate protected state
     } finally{
       lock.unlock();
     }
   } else {
     //perform alternative actions
   }
   ```


3. tryLock(long time, TimeUnit unit): 超时就放弃.

4. lockInterruptibly(): 相当于tryLock(long time, TimeUnit unit)把超时时间设置为无线, 在等待锁的过程中, 线程可以被中断.

5. unlock(): 解锁

#### 锁的分类

1. 线程要不要锁住同步资源:
  2. 锁住: 悲观锁: 互斥同步锁: synchronized和Lock相关类

        1. 阻塞和唤醒带来的性能劣势

            2. 永久阻塞: 如果持有锁的线程被永久阻塞, 比如遇到了无限循环, 死锁等活跃性问题, 那么等待该线程释放锁的线程可能永远都得不到执行

                3. 适用于并发写入多的情况, 适合于临界区持锁时间比较长的情况, 悲观锁可以避免大量的无用自旋等消耗. 比如说: 临界区有IO操作, 临界区代码复杂或者循环量大, 临界区竞争非常激烈等.
        2. 不锁住: 乐观锁: 非互斥同步锁: 原子类, 并发容器

            1. CAS算法: 适合并发写入少, 大部分是读取的场景, 不加锁的能让读取性能大幅度提高.

3. 多线程能否共享一把锁:
      1. 可以: 共享锁: 又称读锁, 可以查看但是无法修改和删除数据, 其他线程此时可以获取到共享锁, 也是只可以查看不可以修改.
      2. 不可以: 独占锁: 又称独占锁, 保证线程安全. 典型例如ReentrantReadWriteLock, 其中读锁是共享锁, 写锁是独享锁


读操作可以插队, 但是必须排在已有的写操作后面. 在ReentrantReadWriteLcok中, 如果是想要进行写锁, 默认是插队的, 而读锁则会判断头结点是否是写锁, 如果是则默默排队.

4. 多线程竞争时是否排队:
   1. 排队: 公平锁: 按照线程请求的顺序来分配锁
   2. 先尝试插队, 插队失败再排队: 非公平锁: 在一定程度上可以插队, 但是并不是盲目排序, 为了提高效率, 避免唤醒带来的空档期. tryLock()方法自带非公平属性, 即使设置为公平也不遵守

5. 同一个线程是否可以重复获得同一把锁:

1. 可以: 可重入: ReentrantLock
    1. isHeldByCurrentThread: 可以看出锁是否被当前线程持有
    2. getQueueLength: 可以返回当前正在等待这把锁的队列有多长


​	**一般这两个方法是开发和调试时候使用, 正式上线时不用**

  2. 不可以: 不可重入锁

5. 是否可中断:

  1. 可以: 可中断锁

  2. 不可以: 非可中断锁

6. 等锁的过程:

  1. 自旋: 自旋锁

  2. 阻塞: 非自旋锁

### 原子类

#### Atomic*基本类型原子类

1. AtomicInteger

2. AtomicLong

3. AtomicBoolean

以AtomicInteger为例的基本方法

- public final int get() 获取当前值

- public final int getAndSet(int new Value) 获取当前值, 并且设置新的值

- public final int getAndIncrement() 获取当前值, 并自增

- public final int getAndDecrement() 获取当前的值, 并自减

- public final int getAndAdd(int delta) 获取当前的值, 并加上预期的值(可以是负数)

- boolean compareAndSet(int expect, int update) 如果当前的数值等于预期值, 则以原子方式将该值设置为输入值

- public final boolean compareAndSet(int expect, int update) (CAS实现)检测是否符合期待expect, 如果符合, 则以原子方式将同步状态设置为给定的更新值

#### Atomic*Array数组类型原子类

1. AtomicIntegerArray

2. AtomicLongArray

3. AtomicReferenceArray

#### Atomic*Reference引用类型原子类

1. AtomicReference

AtomicReference类的作用和AtomicInteger并没有本质区别, AtomicInteger可以让一个整数保证原子性, 而AtomicReference可以让一个对象保证原子性, AtomicReference的功能比AtomicInteger强, 因为一个对象里可以包含很多属性, 其他用法与AtomicInteger类似. 

例: 通过compareAndSet方法实现自旋锁. 如果锁未被持有则可以获取锁`compareAndSet(null, currentThread)`, 如果锁已经被持有, 则通过自旋锁的相关方法判断, 调用方法的线程是否为当前线程`compareAndSet(currentThread, null)`, 如果为当前线程, 则可以解锁, 如果不是, 则会被打回

2. AtomicStampedReference

3. AtomicMarkableReference

#### Atomic*FieldUpdater升级类型原子类

   ```java
   public static AtomicIntegerFieldUpdater<Clazz> clazzUpdater = 
                   AtomicIntegerFieldUpdater.newUpdater(Clazz.class, fieldName);
   ```


1. AtomicIntegerFieldUpdater

2. AtomicLongFieldUpdater

3. AtomicReferenceFieldUpdater

#### Adder累加器(JDK8以后)

- 高并发下LongAdder比AtomicLong效率高, 不过本质是空间换时间

- 竞争激烈的时候, LongAdder把不同线程对应到不同的Cell上进行修改, 降低了冲突的概率, 是多段锁的理念, 提高了并发量

  - AtomicLong每次累加都需要做同步操作, flush(刷新到主内存)和refresh(共享到工作内存), 导致在高并发时冲突很多, 也很耗费资源. 

  - LongAdder每个线程都会有自己的一个计数器, 仅用来在自己线程内计数, 这样一来就不会和其他线程的计数器干扰. LongAdder引入了分段累加的概念, 内部有一个base变量和一个Cell[]数组共同参与计数: 

    - base变量: 竞争不激烈, 直接累加到该变量上

    - Cell[]数组: 竞争激烈, 每个线程分散累加到自己的槽Cell[i]中

1. LongAdder

  1. add(long x)

  2. increment() 等价于add(1)

  3. decrement() 等价于add(-1)

  4. reset() 重置

  5. sum() 返回当前累加求和

  6. sumThenReset() 返回当前累加求和后重置

2. DoubleAdder

#### Accumulator累加器(更通用版本的Adder)

适用于并行场景, 但是对先后顺序不能敏感

以**LongAccumulator**为例

```Java
// 设置0为初始值, 赋值给x
LongAccumulator accumulator = new LongAccumulator((x, y) -> x + y, 0);
// 在x的基础上累加1
accumulator.accumulate(1); 

// 计算最大值, 计算方法可以任意替换
LongAccumulator accumulator = new LongAccumulator((x, y) -> Math.max(x, y), 0);
ExecutorService executor = Executors.newFixedThreadPool(10);
// 通过流生成1~9
IntStream.range(1, 10)
  .forEach(i -> executor.submit(() -> accumulator.accumulate(i)));
executor.shutdown();
while(!executor.isTerminated()){}
System.out.println(accumulator.getThenReset());

```

### CurrentHashMap

#### HashMap死循环问题

HashMap在高并发下的死循环, 本质上为链表的互相引用（仅在JDK7及以前存在）

如果想要应用在并发环境, 只能使用`Colllections.synchronizedMap(new HashMap())`

```java
public class HashMapEndlessLoop {
  private static HashMap<Integer, String> map = new HashMap<Integer, String>(`initialCapacity:`2, `loadFactor:`1.5f)
  public static void main(String[] args) {
    map.put(5, "C");
    map.put(7, "B");
    map.put(3, "A");
    new Thread(new Runnable() {
      @Override
      public void run() {
        map.put(15, "D");
        System.out.println(map);
      }
    }, "Thread1").start();
    new Thread(new Runnable() {
      @Override
      public void run() {
        map.put(1, "E");
        System.out.println(map);
      }
    }, "Thread2").start();
  }
}
```

#### JDK1.7的ConcurrentHashMap实现和分析

1. Java7中的ConcurrentHashMap最外层是多个Segment, 每个Segment的底层数据结构与HashMap类似, 仍然是数组和链表组成的拉链法。
2. 每个Segment独立上ReentrantLock锁, 每个Segment之间互不影响, 提高了并发效率。
3. ConcurrentHashMap默认有16个Segements, 所以最多可以同时支持16个线程并发写（操作分别分布在不同的Segment上）。这个默认值可以在初始化的时候设置为其他值, 但是一旦初始化以后, 是不可以扩容的。

#### JDK1.8的ConcurrentHashMap实现和分析

红黑树。

putVal流程:

	1. 判断key value不为空
	2. 计算hash值
	3. 根据对应位置节点的类型来赋值, 或者helpTransfer, 或者增长链表, 或者给红黑树增加节点
	4. 检查满足阈值就"红黑树化"
	5. 返回oldVal

get流程

 	1. 计算hash值
 	2. 找到对应的位置, 根据情况进行:
 	  	1. 直接取值
 	  	2. 红黑树里找值
 	  	3. 遍历链表取值
 	  	4. 返回找到的结果

##### 为什么超过8要转为红黑树

1. 在空间上, 每一个树节点占用的体积是链表的2倍, 所以默认还是使用链表减少内存损耗。
2. 通常而言, 正好哈希算法下链表长度并不会大于8, 概率小于千万分之一, 所以转化为红黑树只是为了应对极端情况。

ConcurrentHashMap并不代表单一线程内绝对的线程安全, 只有单一操作, 即多线程操作同一个对象时, 结果是正确的, 但是当单一线程内为组合操作, 那么操作与操作之间, 就有可能发生线程安全问题, 这种问题ConcurrentHashMap是无法保证安全的。而该情况下, 可以使用`replace(key, oldValue, newValue){return boolean}`方法, 通过判断oldValue和原本的值是否一致, 如果一致就用newValue进行赋值, 否则不改变并返回false, 可以使用while循环来保证至少操作一次。此外还有`putIfAbsent()`方法, 如果map的key有值就取出来, 没有则赋值。synchronize关键字并非不可以使用, 但是既然已经追求多线程并发提升效率, 尽量还是少使用同步关键字。

### CopyOnWriteArrayList(CopyOnWrite Series)

 传统的ArrayList在迭代过程中无法进行修改。另注: 如果一个List经常被改写（写多读少）, 则适用ArrayList。

1. 适用场景

   读操作尽可能地快, 而写即使慢一些也没有太大关系。读多写少: 黑名单, 每日更新; 监听器: 迭代操作远多于修改操作。

2. 读写规则

   读取是完全不加锁的, 并且写入也不会阻塞读取操作。只有写入和写入之间需要进行同步等待。写入使用的`add()`方法, 基于ReentrantLock实现, 保证了写入的安全性。

   在该规则下, 迭代过程中可以对List进行修改, 但是在这过程中迭代的仍然是原本的List, 而并不是修改后的List。

3. 缺点

   1. 数据不一致: 显然基于这样的读写规则, 多线程情况下写入并不是及时反映在个个线程的迭代器中的。所以如果希望保证写入数据的实时性, 不可以使用CopyOnWrite系列容器。
   2. 内存占用大: 基于内容拷贝实现的读写分离。先不论拷贝带来的开销, 同一内容维护两个对象也是比较占用内存的方案。

### 并发队列

#### 选择依据

1. 边界
2. 空间
3. 吞吐量: link系列一般优于array系列, 因为有两把锁, 锁的粒度比较细致
4. 需要的特殊功能

#### 阻塞队列

阻塞队列是具有阻塞功能的队列, 所以它首先是一个队列, 其次是具有阻塞功能的。通常, 阻塞队列的一端是给生产者放数据用, 另一端给消费者拿数据用。阻塞队列是线程安全的, 所以生产者和消费者都可以是多线程的。

1. `put()`: 插入元素。如果无法插入, 则达成阻塞。
2. `take()`: 获取并移除队列的头结点, 如果取不出来, 则阻塞。
3. `add()`: 类似于`put()`, 如果放不进去则会抛出异常。
4. `element()`: 类似于`take()`, 如果取不出来则会抛出异常。
5. `remove()`: 删除元素, 如果空队列则会抛出异常。
6. `offer()`: 类似于`put()`, 会返回布尔值。
7. `peek()`: 类似于`take()`, 取不出来则返回null。
8. `poll()`: 类似于`take()`, 会删除取出的元素, 取不出来则返回null。

##### ArrayBlockingQueue

1. 有界
2. 可指定容量
3. 公平: 如果想要保证公平的话, 那么等待了最长时间的线程会被优先处理, 不过这会同时带来一定的性能损耗。

##### LinkedBlockingQueue

1. 无界（最大可到Integer.MAX_VALUE）
2. 内部结构: Node。
3. 两把锁, take和put互不干扰。

##### PriorityBlockingQueue

1. 无界（扩容式）
2. 支持优先级, 需要实现comparable接口进行自然排序（而不是先进先出）
3. PriorityQueue的线程安全版本

##### SynchronousQueue

1. 容量为0。并不是1而是0, 因为SynchronousQueue不需要去持有元素, 它所做的就是直接传递
2. 是个极好的用来直接传递的并发数据结构
3. SynchronousQueue是线程池Executors.newCachedThreadPool()实用的阻塞队列

##### DelayQueue

1. 延迟队列, 根据延迟时间排序
2. 元素需要实现Delayed接口, 规定排序规则

#### 非阻塞队列

##### ConcurrentLinkedQueue

1. 使用链表作为其数据结构, 使用CAS非阻塞算法来实现线程安全
2. 适用于对性能要求较高的并发场景

### 并发流程控制

#### Semaphore

1. 作用: 信号量, 可以通过控制"许可证"的数量, 来保证线程之间的配合。
2. 说明: 线程只有在拿到"许可证"之后才能继续运行。相比于其他的同步器, 更灵活。
3. 主要方法: 
   1. acquire() ( 可以响应中断 )
   2. acquireUninterruptibly() ( 不响应中断 )
   3. release() : 归还许可证。释放和获取并不一定要同一个线程完成。
   4. new Semaphore( int permits, boolean fair ) : 这里可以设置是否要使用公平策略, 如果传入true, 那么Semaphore会把之前等待的线程放到FIFO的队列里, 以便于当有了新的许可证, 可以分发给之前等了最长时间的线程。
   5. tryAcquire() : 看看线程有没有空闲的许可证, 如果有的话就获取, 如果没有的话也没关系, 我不必陷入阻塞, 我可以去做别的事, 过一会再来查看许可证的空闲情况。
   6. tryAcquire(timeout) : 和`tryAcquire()`一样, 但是多了一个超时时间, 比如"在3秒内获取不到许可证, 我就去作别的事"

#### CyclicBarrier

1. 作用: 线程会等待, 直到多线程达到了事先规定的数目。一旦达到触发条件, 就可以进行下一步的动作。
2. 说明: 适用于线程之间互相等待就绪的场景。

#### Phaser

1. 作用: 和CyclicBarrier类似, 但是计划数可变。
2. 说明: Java7加入

#### CountDownLatch

1. 作用: 和CyclicBarrier类似, 数量递减到0时, 触发动作。
2. 说明: 不可重复使用。

#### Exchanger

1. 作用: 让两个线程在合适时交换对象。
2. 说明: 当两个线程工作在同一个类的不同实例上时, 用于交换数据。

#### Condition

1. 作用: 可以控制线程的"等待"和"唤醒"。

   实际上, 如果说Lock用来代替synchronized, 那么Condition就是用来代替相对应的Object.wait/notify的, 所以在用法和性质上, 几乎都一样。

2. 是Object.wait()的升级版。调用await的时候必须持有锁, 否则会抛出异常, 同时这里调用await会自动释放持有的Lock锁, 不需要自己手动先释放锁, 这些都与Object.wait()一样


## CAS

CAS是并发环境下的一种算法。基本思路是, 预设结果为A,如果最后结果不为A, 则说明别人修改过了. 典型用例就是乐观锁。

### 在Java中的CAS实现

1. AtomicInteger加载Unsafe工具, 用来直接操作内存数据

2. 用Unsafe来实现底层操作

3. 用volatile修饰value字段, 保证可见性

### CAS的问题

  1. ABA问题: 结果值相同, 但是已经有其他中间过程, 可以采用版本号解决.

  2. 自旋时间过长

## AQS

全名 AbstractQueuedSynchronizer 抽象队列同步器。

### 三大核心

#### state

state的具体含义, 会根据具体实现类的不同而不同, 比如在Semaphore里, 它表示"剩余的许可证的数量"; 而在CountDownLatch里, 它表示"还需要倒数的数量"; 在ReentrantLock中, state用来表示"锁"的占有情况, 包括可重入计数。

#### 控制线程抢锁和配合的FIFO队列

这个队列用来存放"等待的线程", AQS就是"排队管理器", 当多个线程用同一把锁时, 必须有排队机制将那些没能拿到锁的线程串在一起。当锁释放时, 锁管理器就会挑选一个合适的线程来占有这个刚刚释放的锁。

具体实现是双向链表, tail为当前位置

#### 期望协作工具类去实现的获取/释放等重要方法

1. 获取方法: 会依赖变量, 并且经常会阻塞(比如获取不到锁的时候)。比如在Semaphore中, 获取就是acquire方法, 作用是获取一个许可证; 在CountDownLatch里则是await方法, 作用是"等待, 直到倒数结束"。
2. 释放操作: 不造成阻塞或解除阻塞。Semaphore中就是release方法, 作用是释放一个许可证; CountDownLatch里面, 则是countDown方法, 作用是"倒数一个数"。

### 用法

1. 第一步: 写一个类, 想好协作的逻辑, 实现获取/释放方法
2. 第二步: 内部写一个Sync类继承AbstractQueuedSynchronizer
3. 第三步: 更具是否独占来重写tryAcquire/tryRelease或`tryAcquireShared(int acquires)`和`tryReleaseShared(int releases)` 等方法, 在之前写的获取/释放方法中调用AQS的acquire/release或者Shared方法。

## Future

### Runnable 的缺陷

1. 没有返回值
2. 无法抛出异常

### 一些概念

#### 作用

本质上就是Java的异步, 利用子线程进行运行。

#### Callable与Future的关系

可以用Future.get来获取Callable接口返回的执行结果, 还可以通过Future.isDone() 来判断任务是否已经执行完了, 以及取消这个任务, 限时获取任务的结果等。

在call()未执行完毕之前, 调用get()的线程 (假定此时是主线程) 会被阻塞, 直到call() 方法返回了结果后, 此时future.get() 才会得到该结果, 然后主线程才会切换到 runnable 状态。

Future 是一个存储器, 它存储了 call() 这个任务的结果, 而这个任务的执行时间是无法提前确定的, 因为这完全取决于 call() 方法执行的情况。

### Method

#### get()

get方法的行为取决于Callable任务的状态, 有 5 种可能性:

1. 任务正常完成: get方法会立刻返回结果。
2. 任务尚未完成 ( 任务还没开始或进行中 ) : get将阻塞并直到任务完成。
3. 任务执行过程种抛出Exception : get方法会抛出ExecutionException: 这里的抛出异常, 是 call() 执行时 产生的那个异常, 看到这个异常类型是java.util.concurrent.ExecutionException。不论 call() 执行时抛出的异常是什么, 异常类型都是ExecutionException。
4. 任务被取消: get方法会抛出CancellationException。
5. 任务超时: get方法有一个重载方法, 是传入一个延迟时间的, 如果时间到了还没有获得结果, get方法就会抛出TimeoutException。

#### cancel()

取消任务的执行。此外还有 isCancelled() 方法用于判断是否被取消。

参数mayInterruptIfRunning:

1. true: 对future发送中断请求
   1. 任务能够处理interrupt
2. false: 不对future发送中断, 用于避免启动尚未启动的任务
   1. 未能处理interrupt的任务
   2. 不清楚任务是否支持取消

#### isDone()

判断执行是否执行完毕。无论成功还是报错, 都会被视为执行完成。

### 用法

1. 线程池的submit方法返回Future对象: 首先获得一个空的Future容器。当线程的任务一旦执行完毕, 也就是当我们可以获取结果的时候, 线程池便会把该结果填入到之前的Future中去

   1. Future的生命周期不能后退: 生命周期只能前进不能后退。就和线程池的生命周期一样, 一旦完全完成了任务, 他就永久停在了"已完成"的装提啊, 不能重头再来。

2. lambda表达式 :

   ```java
   public class OneFutureLambda {
       public static void main(String[] args) {
           ExecutorService service = Executors.newFixedThreadPool(10);
           Callable<Integer> callable = () -> {
               Thread.sleep(3000);
               return new Random().nextInt();
           }
           Future<Integer> future = service.submit(callable);
           try {
               System.out.println(future.get());
           } catch (InterruptedException e) {
               e.printStackTrace();
           } catch (ExecutionException e) {
               e.printStackTrace();
           }
       }
   }
   ```

3. FutureTask创建Future

   通过实现, 继承了Runnable和Future接口的RunnableFuture接口, 达到既可以作为Runnable被线程执行, 又可以作为Future得到Callable的返回值

   ```java
   /*
    *	把Callable实例当作参数, 生成FutureTask的对象
    *	然后把这个对象当作一个Runnable对象, 用线程池或另起线程去执行这个Runnable对象
    *	最后通过FutureTask获取刚才执行的结果
    */
   public class FutureTaskDemo {
       public static void main(String[] args) {
           Task task = new Task();
           FutureTask<Integer> integerFutureTask = new FutureTask<Integer>(task);
           new Thread(integerFutureTask).start();
           
           try {
               System.out.println(integerFutureTask.get(););
           } catch (InterruptedException e) {
               e.printStackTrace();
           } catch (ExecutionException e) {
               e.printStackTrace();
           }
       }
   }
       
   class Task implements Callable<Integer> {
       @Override
       public Integer call() throws Exception {
           System.out.println("子线程正在计算");
           Thread.sleep(3000);
           int sum = 0;
           for (int i = 0; i < 100; i++) {
               sum += i;
           }
           return sum;
       }
   }
   ```

   FutureTask注意点

   1. 当for循环批量获取future的结果时, 容易发生一部分线程很慢的情况, get方法调用时应使用timeout限制。也可以使用CompleteTask()工具类。

## 线程安全与性能

### 线程安全的定义

> 当多个线程访问同一个对象时, 如果不考虑这个线程在运行环境下的调度和交替执行, 也不需要额外的同步, 或者在调用方进行任何其他的协调操作, 调用这个对象都可以获得正确的结果, 那这个对象是线程安全的. 相反，如果在编程的时候，需要考虑这些线程在运行时的调度和交替（例如在get()调用到期间不能调用set()) ，或者需要进行额外的同步（比如使用synchronized关键字等），那么就是线程不安全的。


大白话就是, 无论怎么操作这个对象, 都可以获得正确的、期望的结果, 那就是线程安全的.

### 线程性能问题

  1. 上下文切换: 抢锁、IO

  2. 缓存开销

  3. 引入多线程不能本末倒置

### 不变性(Immutable)

  1. 如果对象在被创建后, 状态就不能被修改, 那么他就是不可变得

  2. 早期的Java实现版本中, 会将final方法转为内嵌调用

  3. 现在用于, 类防止被继承, 方法防止被重写, 变量防止被修改. 天生是线程安全的, 而不需要额外的同步开销

#### final修饰变量

**含义:** 被final修饰的变量, 意味着值不能被修改. 如果变量是对象, 那么对象的引用不能变, 但是对象自身的内容依然可以变化。Final 用在变量､ 方法或者类上时, 其含义是截然不同的: 修饰变量意味着一旦被赋值就不能被修改; 修饰方法意味着不能被重写; 修饰类意味着不能被继承。

1. final instance variable(类中的final属性)

  - 第一种是在声明变量的等号右边直接赋值

  - 第二种就是构造函数中赋值

  - 第三就是在类的初始代码块中赋值(不常用)

  - 如果不采用第一种赋值方法, 那么就必须在第2, 3种挑一个来赋值, 而不能不赋值

2. final static variable(类中的static final属性)

  - 第一种是在声明变量的等号右边直接赋值

  - 第二种是使用static初始代码块赋值, 但是不能用普通的初始代码块赋值

3. final local variable(方法中的final变量)

  - 和前面两种不同, 由于这里的变量是在方法里的, 所以没有构造函数, 也不存在代码块

  - 不规定赋值时机, 但是在使用前必须赋值

**注意**: 不变性不意味着, 简单地用final修饰就是不可变的

  - 对于基本数据类型, 确实被final修饰后就具有不变性, 编译过程中会被当成常量

  - 对于对象类型, 需要该对象保证自身被创建后, 状态永远不会变才可以

    1. 对象创建后,  其状态就不能修改

    2. 所有属性都是final修饰的

    3. 对象创建过程中没有发生逸出

    4. 编译过程中不会被当成常量

  - 在方法里新建的局部变量,  实际上存储在每个线程私有的栈空间, 而每个栈的栈空间是不能被其他线程所访问到的, 所以不会有线程安全问题。这就是"栈封闭"技术, 是"线程封闭"技术的一种情况。

```java
public class StackConfinement implements Runnable {
        int index = 0;

        public void inThread() {
            int neverGoOut = 0;
            for (int i = 0; i < 10000; i++) {
                neverGoOut ++;
            }
            System.out.println("栈内保护的数字是线程安全的: " + neverGoout);
        }

        @Override
        public void run() {
            for (int i = 0; i < 10000; i++) {
                index ++; 
            }
            System.Out.println("index = " + index);
        }

        public static void main(String[] args) {
            StackConfinement r1 = new StackConfinement();
            Thread thread1 = new Thread(r1);
            Thread thread2 = new Thread(r1);
            thread1.start();
            thread2.start();
            thread1.join();
            thread2.join();        
            System.out.println(r1.index);
        }
} 
```


### 原子性

当一系列操作可以保证完整性的时候, 即可称其具有原子性

#### long和double

问题描述: 官方文档, 对于64位的值的写入, 可以分为两个32位的操作进行写入, 读取错误、使用volatile解决.
在32位上的JVM上, long和double的操作都不是原子的, 但是在64位的JVM上是原子的.
在实际开发中, 商用Java虚拟机中不会出现这个问题

### 避免死锁

1. 利用hash值, 保证先获取到hash值小的锁, 再获得hash值大的锁, 保证这一获取顺序后, 即可保证在一个循环竞争中竞争的锁的顺序是一致的. 可以消除死锁. 如果两个hash值一致(发生hash碰撞), 设定一个中立锁, 在内部再获取原本的锁. 当然, 完全可以用其他唯一值来代替hash值.

2. 设置超时时间: 使用Concurrent下的ReentrantLock的tryLock(long timeout. TimeUnit unit).
当我们使用synchronized的时候, 如果获取不到锁, 是不能退出的, 只能继续等待直到获取到这把锁.
但是如果我们使用tryLock功能, 设置超时时间(假设5秒), 那么如果等待了5秒后依然没拿到锁, 超时后就可以退出做别的事, 防止死锁.造成超时的可能性有很多种, 比如发生了死锁、线程陷入死循环、线程执行很慢等等. 当我们获取该锁失败的时候, 我们可以打日志、 发警报邮件、 重启等等, 这些都比造成死锁要好的多. 

3. 多使用并发类而不是自己设计锁
尽量使用java.util.concurrent(jdk 1.5以上)包的并发类代替手写控制wait, notify并发, 比较常用的是ConcurrentHashMap、 ConcurrentLinkedQueue、AtomicBoolean等等, 实际应用中java.util.concurrent.atomic十分有用, 简单方便且效率比使用Lock更高. 多用并发集合少用同步集合, 这是另外一个容易遵守且收益巨大的最佳实践, 并发集合比同步集合的可扩展性更好, 所以在并发编程时使用并发集合效果更好.

4. 尽量降低锁的使用粒度
分别用不同的锁来保护同一个类中多个独立的状态变量, 而不是对整个类域只使用一个锁. 最低限度的使用同步和锁, 缩小临界区.

5. 如果能使用同步代码块, 就不使用同步方法
用同步代码块来指定获取哪个对象的锁, 这样就拥有了对锁的绝对控制权

6. 给线程取有意义的名字

7. 避免锁的嵌套

8. 分配资源钱先看能不能收回来
在分配资源前进行详细计算, 如果有发生死锁的可能就不分配资源, 避免死锁

9. 尽量不要几个功能用同一把锁
由于一个线程可以获得多个锁, 容易发生死锁, 应该尽量避免.

### 活锁

互相谦让, 但是同一步调, 导致循环释放循环争抢, 却又谁都抢不到, 没有阻塞却无法继续进行, 称之为活锁.



## 缓存

1. ConcurrentHashMap: 提高并发能力。
2. Future和Callable: 防止重复计入缓存(并发时前后相近进入, 未拿到返回值, 缓存尚未统计)。核心思想: 提前写入缓存。
3. 原子操作: 防止重复计算(CAS模式, 在并发同时进入时可能发生, 比提前写入缓存还要快), putAbsent()
4. 异常处理: 分情况处理, 有立即中断, 也可以重试。计算失败的时候要移除Future。
5. 缓存定期移除: 采用随机数避免雪崩发生。可以使用ScheduledThreadPool进行定时操作。
6. 可以使用CountDownLatch实现压力测试, ThreadLocal存储数据线程安全的当前时间。

