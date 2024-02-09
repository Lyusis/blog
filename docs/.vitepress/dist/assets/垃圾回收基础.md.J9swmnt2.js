import{_ as s,c as i,o as a,V as l}from"./chunks/framework.pRwbWk_8.js";const g=JSON.parse('{"title":"垃圾回收基础","description":"","frontmatter":{},"headers":[],"relativePath":"垃圾回收基础.md","filePath":"垃圾回收基础.md"}'),n={name:"垃圾回收基础.md"},t=l(`<h1 id="垃圾回收基础" tabindex="-1">垃圾回收基础 <a class="header-anchor" href="#垃圾回收基础" aria-label="Permalink to &quot;垃圾回收基础&quot;">​</a></h1><h2 id="基本概念" tabindex="-1">基本概念 <a class="header-anchor" href="#基本概念" aria-label="Permalink to &quot;基本概念&quot;">​</a></h2><h3 id="_1-对象" tabindex="-1">1. 对象 <a class="header-anchor" href="#_1-对象" aria-label="Permalink to &quot;1. 对象&quot;">​</a></h3><p>对象表示的是“通过应用程序利用的数据的集合”。对象配置在内存空间里。GC根据情况将配置好的对象进行移动或销毁操作。因此, 对象是GC的基本单位。一般而言, 对象由头(header)和域(field)构成。</p><h4 id="头-header" tabindex="-1">头(header) <a class="header-anchor" href="#头-header" aria-label="Permalink to &quot;头(header)&quot;">​</a></h4><p>我们将对象中保存对象本身信息的部分称为“头”。头主要含有以下信息。</p><ul><li>对象的大小</li><li>对象的种类</li></ul><p>如果不清楚对象的大小和种类, 就会发生问题, 例如无法判别内存中存储的对象的边界。因此头对GC来说非常重要。此外, 头中事先存有运行GC所需的信息。然而根据GC算法的不同, 信息也不同。</p><h4 id="域-field" tabindex="-1">域(field) <a class="header-anchor" href="#域-field" aria-label="Permalink to &quot;域(field)&quot;">​</a></h4><p>我们把对象使用者在对象中可访问的部分称为“域”。可以将其想像成C语言中结构体的成员。对象使用者会引用或替换对象的域值。另一方面, 对象使用者基本上无法直接更改头的信息。</p><p>域中的数据类型大致分为以下2种。</p><ul><li>指针: 指针是指向内存空间中某块区域的值。</li><li>非指针: 非指针指的是在编程中直接使用值本身。数值、字符以及真假值都是非指针。</li></ul><p>在对象内部, 头之后存在1个及1个以上的域。</p><h3 id="_2-指针" tabindex="-1">2. 指针 <a class="header-anchor" href="#_2-指针" aria-label="Permalink to &quot;2. 指针&quot;">​</a></h3><p>通过GC, 对象会被销毁或保留。这时候起到关健作用的就是指针。因为GC是根据对象的指针指向取搜索其他对象的。另一方面GC对非指针不进行任何操作。</p><p><em>注意:</em></p><ol><li>要注意语言处理程序是否能判别指针和非指针。</li><li>要注意指针指向对象的哪个部分。指针如果指向对象首地址以外的部分, GC就会变的非常复杂。在大多数语言处理程序中, 指针都默认指向对象的首地址。因为存在这个制约条件, 不仅是GC, 就连语言处理程序的其他各种处理都变得简单了。</li></ol><h3 id="_3-mutator" tabindex="-1">3. mutator <a class="header-anchor" href="#_3-mutator" aria-label="Permalink to &quot;3. mutator&quot;">​</a></h3><p>mutator是Edsger Dijkstra琢磨出来的词, 有“改变某物”的意思。说到要改变什么, 那么就是GC对象间的引用关系。它的实体就是“应用程序”。</p><p>mutator实际进行的操作有以下2种:</p><ol><li>生成对象</li><li>更新指针</li></ol><p>mutator在进行这些操作时, 会同时为应用程序的用户进行一些处理。随着这些处理的逐步推进, 对象间的引用关系也会“改变”。伴随这些变化会产生垃圾, 而负责回收这些垃圾的机制就是GC。</p><h3 id="_4-堆" tabindex="-1">4. 堆 <a class="header-anchor" href="#_4-堆" aria-label="Permalink to &quot;4. 堆&quot;">​</a></h3><p>堆指的是用于动态(也就是执行程序时)存放对象的内存空间。当mutator申请存放对象时, 所需的内存空间就回从这个堆中被分配给mutator。</p><p>GC是管理堆中已分配对象的机制。在开始执行mutator前, GC要分配用于堆的内存空间。一旦开始执行mutator, 程序就会按照mutator的要求在堆中存放对象。等到堆被对象占满后, GC就回启动, 从而分配可用空间。如果不能分配足够的可用空间, 一般情况下我们就要扩大堆。</p><h3 id="_5-活动对象-非活动对象" tabindex="-1">5. 活动对象/非活动对象 <a class="header-anchor" href="#_5-活动对象-非活动对象" aria-label="Permalink to &quot;5. 活动对象/非活动对象&quot;">​</a></h3><p>我们将分配到内存空间中的对象中哪些能通过mutator引用的对象称为活动对象。反过来, 把分配到堆中哪些不能通过程序引用的对象称为“非活动对象”。也就是说, 不能通过程序引用的对象已经没有人搭理了, 所以死掉了。死掉的对象(即非活动对象)我们就称为“垃圾”。</p><p>值的注意的是: 死了的对象不可能活过来。因为就算mutator想要重新引用已经死掉的对象, 我们也没法通过mutator找到它了。</p><p>GC会保留活动对象, 销毁非活动对象。当销毁非活动对象时, 其原本占据的内存空间就会得到解放, 供下一个要分配的新对象使用。</p><h3 id="_6-分配" tabindex="-1">6. 分配 <a class="header-anchor" href="#_6-分配" aria-label="Permalink to &quot;6. 分配&quot;">​</a></h3><p>分配(allocation)指的是在内存空间中分配对象。当mutator需要新对象时, 就会向分配器(allocator)申请一个大小合适的空间。分配器则在堆的可用空间中找寻满足要求的空间, 返回给mutator。</p><p>当堆被所有活动对象占满时, 就算运行GC也无法分配可用空间。这时候我们有以下两种选择:</p><ol><li>销毁至今为止的所有计算结果, 输出错误信息。</li><li>扩大堆, 分配可用空间。</li></ol><h3 id="_7-分块" tabindex="-1">7. 分块 <a class="header-anchor" href="#_7-分块" aria-label="Permalink to &quot;7. 分块&quot;">​</a></h3><p>分块(chunk)在GC的世界里指的是为利用对象而事先准备出来的空间。</p><p>初始状态下, 堆被一个大的分块所占据。</p><p>然后, 程序会根据mutator的要求把这个分块分割成合适的大小, 作为(活动)对象使用。活动对象不久后会转化为垃圾被回收。此时, 这部分被回收的内存空间再次成为分块, 为下次被利用做准备。也就是说, 内存里的各个区块都重复着分块-&gt;活动对象-&gt;垃圾(非活动对象)-&gt;分块-&gt;……这样的过程。</p><h3 id="_8-根" tabindex="-1">8. 根 <a class="header-anchor" href="#_8-根" aria-label="Permalink to &quot;8. 根&quot;">​</a></h3><p>根(root)在GC的世界里, 指的是指向对象的指针的“起点”部分。</p><h3 id="_9-评价标准" tabindex="-1">9. 评价标准 <a class="header-anchor" href="#_9-评价标准" aria-label="Permalink to &quot;9. 评价标准&quot;">​</a></h3><p>评价GC算法的性能时, 我们采用以下4个标准</p><ul><li>吞吐量</li><li>最大暂停时间</li><li>堆使用效率</li><li>访问的局部性</li></ul><h4 id="吞吐量" tabindex="-1">吞吐量 <a class="header-anchor" href="#吞吐量" aria-label="Permalink to &quot;吞吐量&quot;">​</a></h4><p>一般意义上来讲, 吞吐量(throughput)指的是“在单位时间内的处理能力”, 这点在GC的世界中也不例外。</p><p>在mutator整个执行过程中, GC花费的总时长如果是T, 那么吞吐量可以表示为HEAP_SIZE/T。</p><p>当然, 人们通常都喜欢吞吐量高的GC算法。然而判断各算法吞吐量的好坏时不能一概而论。即使是同一GC算法, 其吞吐量也是受mutator的动作左右的。评价GC算法的吞吐量时, 有必要把mutator的动作也考虑在内。</p><h4 id="最大暂停时间" tabindex="-1">最大暂停时间 <a class="header-anchor" href="#最大暂停时间" aria-label="Permalink to &quot;最大暂停时间&quot;">​</a></h4><p>最大暂停时间指的是“因执行GC而暂停执行mutator的最长时间”。然而不管尝试哪种GC算法, 我们都会发现较大的吞吐量和较短的最大暂停时间不可兼得, 所以应根据执行的应用所重视的指标的不同, 来分别采用不同的GC算法。</p><h4 id="堆使用效率" tabindex="-1">堆使用效率 <a class="header-anchor" href="#堆使用效率" aria-label="Permalink to &quot;堆使用效率&quot;">​</a></h4><p>根据GC算法的差异, 堆使用效率也大相径庭。左右堆使用效率的因素有两个。</p><ol><li>头的大小: 在堆中堆放的信息越多, GC的效率也就越高, 吞吐量也就随之得到改善。单毋庸置疑, 头越小越好。因此未了执行GC, 需要把在头中存放的信息控制在最小限度。</li><li>堆的用法: 举个例子, GC复制算法中, 将堆二等分, 每次只使用一半, 交替进行, 因此总是只能利用堆的一半。相对而言, GC标记-清除算法和引用计数法就能利用整个堆。</li></ol><p>不过, 堆使用效率和吞吐量, 以及最大暂停时间不可兼得。简单地说: 可用堆越大, GC运行越快；相反, 想要有效地利用有限的堆, GC花费的时间就越长。</p><h4 id="访问的局部性" tabindex="-1">访问的局部性 <a class="header-anchor" href="#访问的局部性" aria-label="Permalink to &quot;访问的局部性&quot;">​</a></h4><p>PC上有4种存储器, 分别是寄存器、缓存、内存、辅助存储器。</p><p>具有引用关系的对象之间通常很可能存在连续访问的情况。这在多数程序中都很常见, 称为“访问的局部性”。考虑到访问的局部性, 把具有引用关系的对象安排在堆中较近的位置, 就能提高在缓存中读取到想利用的数据的概率, 令mutator高速运行。而有些GC算法会根据引用关系重排对象。</p><h2 id="标记-清除算法" tabindex="-1">标记-清除算法 <a class="header-anchor" href="#标记-清除算法" aria-label="Permalink to &quot;标记-清除算法&quot;">​</a></h2><p>标记-清除算法由标记阶段和清除阶段构成。标记阶段是把所有活动对象都做上标记的阶段。清除阶段是把那些没有标记的对象, 也就是非活动对象回收的阶段。通过这两个阶段, 就可以令不能利用的内存空间重新得到利用。</p><h3 id="标记阶段" tabindex="-1">标记阶段 <a class="header-anchor" href="#标记阶段" aria-label="Permalink to &quot;标记阶段&quot;">​</a></h3><div class="language-c vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">c</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">mark_phase</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (r : $roots)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">		mark</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">r)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">mark</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(obj) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (obj.mark </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> FALSE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">		obj.mark </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> TRUE</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">		for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(child : </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">children</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(obj))</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">			mark</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">child)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>在标记阶段中, collector 会为堆里的所有活动对象打上标记。为此, 我们首先要标记通过根直接引用的对象。首先我们标记这样的对象, 然后递归地标记通过指针数组能访问到的对象。这样就能把所有活动对象都标记上了。标记完所有活动对象后, 标记阶段就结束了。在标记阶段中, 程序会标记所有活动对象。毫无疑问, 标记所花费的时间是与“活动对象的总数”成正比的。</p><blockquote><p>我们在搜索对象并进行标记时使用的是深度优先搜索。GC会搜索所有对象。不管使用什么搜索方法, 搜索相关的步骤数(调查的对象数量)都不会有差别。另一方面, 比较一下内存使用量(已存储的对象数量)就可以知道, 深度优先搜索比广度优先搜索更能压低内存使用量。因此我们在标记阶段经常使用到深度优先搜索。</p></blockquote><h3 id="清除阶段" tabindex="-1">清除阶段 <a class="header-anchor" href="#清除阶段" aria-label="Permalink to &quot;清除阶段&quot;">​</a></h3><p>在清除阶段中, collector会遍历整个堆, 回收没有打上标记的对象(即垃圾), 使其能再次得到利用。</p><div class="language-c vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">c</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sweep_phase</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    sweeping </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> $heep_start</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    while</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (sweeping </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> $heep_end)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (sweeping.mark </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> TRUE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            sweeping.mark </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> FALSE</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    	else</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            sweeping.next </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> $free_list</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    		$free_list </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sweeping</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    	sweeping </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sweeping.size</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>在此出现了叫作 size 的域, 这是存储对象大小(字节数)的域。跟 mark 域一样, 我们事先在各对象的头中定义它们。在清除阶段, 我们使用变量 sweeping 遍历堆, 具体来说就是从堆首地址 $heap_start 开始, 按顺序一个个遍历对象的标志位。设置了标志位, 就说明这个对象是活动对象。活动对象必然是不能回收的。在第5行我们取消标志位, 准备下一次的GC。我们必须把非活动对象回收再利用。回收对象就是把对象作为分块, 连接到被称为“空闲链表”的单向链表。在之后进行分配时只要遍历这个空闲链表, 就可以找到分块了。</p><p>在第7行新出现了叫作 next 的域。我们只在生成空闲链表以及从这个空闲链表中取出分块时才会使用到它。没有必要为各个对象特别准备域, 从对象已有的域之中分出来一个就够了。在本段中, next 表示对象(或者分块)最初的域, 即 field1。也就是说, 给 field1 这个域起个别名叫 next。这跟 C语言中的联合体(union)的概念相同。</p><p>在清除阶段, 程序会遍历所有堆, 进行垃圾回收。也就是说所花费时间与堆大校成正比。堆越大, 清除阶段花费的时间就会越长。</p><h3 id="分配" tabindex="-1">分配 <a class="header-anchor" href="#分配" aria-label="Permalink to &quot;分配&quot;">​</a></h3><p>分配是指将回收的垃圾进行再利用。换句话说, 当mutator申请分块时, 怎么才能把大小合适的分块分配给mutator的问题。</p><p>我们再清除阶段要把垃圾对象连接到空闲链表。搜索空闲链表并寻找大小合适的分块, 这项操作就叫作分配。</p><div class="language-C vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">C</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">new_obj</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(size) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    chunk </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> pickup_chunk</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(size, $free_list)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (chunk </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> NULL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> chunk</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> </span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        allocation_fail</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>第2行的pickup_chunk()函数用于遍历$free_list, 寻找大于等于size的分块。它不光会返回和size大小相同的分块, 还会返回比size大的分块。如果它找到和size大小相同的分块, 则会直接返回该分块; 如果它找到比size大的分块, 则会将其分割成size大小的分块和去掉size后剩余大小的分块, 并把剩余的分块返回空闲链表。如果此函数没有找到合适的分块, 则会返回NULL。</p><blockquote><p>First-fit、Best-fit、Worst-fit的不同</p><p>之前我们讲的分配策略叫作 First- fit。因为在 pickup_chunk()函数中, 最初发现大于等于 size 的分块时就会立即返回该分块。然而, 分配策略不止这些。还有遍历空闲链表, 返回大于等于 size 的最小分块, 这种策略叫 作 Best-fit。 还有一种策略叫作 Worst-fit, 即找出空闲链表中最大的分块, 将其分割成 mutator 申请的 大小和分割后剩余的大小, 目的是将分割后剩余的分块最大化。但因为 Worst- fit 很容易生成大 量小的分块, 所以不推荐大家使用此方法。 除去 Worst- fit, 剩下的还有 Best-fit 和 First-fit 这两种。当我们使用单纯的空闲链表时, 考虑到分配所需的时间, 选择使用 First-fit 更为明智。</p></blockquote><h3 id="合并" tabindex="-1">合并 <a class="header-anchor" href="#合并" aria-label="Permalink to &quot;合并&quot;">​</a></h3><p>根据分配策略的不同可能会产生大量的小分块。但如果它们是连续的, 我们就能把所有的小分块连在一起形成一个大分块。这种“连接连续分块”的操作就叫作合并(coalescing), 合并是在清除阶段进行的。</p><div class="language-C vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">C</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sweep_phase</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    sweeping </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> $heep_start</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    while</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (sweeping </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> $heep_end)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (sweeping.mark </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> TRUE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            sweeping.mark </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> FALSE</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (sweeping </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> $free_list </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> $free_list.size)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                $free_list.size </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sweeping.size</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            else</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                sweeping.next </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> $free_list</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                $free_list </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sweeping</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            sweeping </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sweeping.size</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>区别于原本的标记清除算法, 添加了合并过程。用于调查这次发现的分块和上次发现的分块是否连续, 如果发现分块连续, 则会将邻接的2个分块合并, 整理成1个分块。</p><h3 id="优缺点" tabindex="-1">优缺点 <a class="header-anchor" href="#优缺点" aria-label="Permalink to &quot;优缺点&quot;">​</a></h3><h4 id="优点" tabindex="-1">优点 <a class="header-anchor" href="#优点" aria-label="Permalink to &quot;优点&quot;">​</a></h4><ol><li>实现简单。</li><li>与保守式GC算法兼容。</li></ol><h4 id="缺点" tabindex="-1">缺点 <a class="header-anchor" href="#缺点" aria-label="Permalink to &quot;缺点&quot;">​</a></h4><ol><li>碎片化: 在 GC 标记-清除算法的使用过程中会逐渐产生被细化的分块, 不久后就会导致无数的小分块散布在堆的各处。我们称这种状况为碎片化(fragmentation)。众所周知, Windows 的文件系统也会产生这种现象。如果发生碎片化, 那么即使堆中分块的总大小够用, 也会因为一个个的分块都太小而不能执行分配。此外, 如果发生碎片化, 就会增加 mutator 的执行负担。</li><li>分配速度: GC 标记-清除算法中分块不是连续的, 因此每次分配都必须遍历空闲链表, 找到足够大的分块。最糟的情况就是每次进行分配都得把空闲链表遍历到最后。另一方面, 因为在 GC 复制算法和 GC 标记-压缩算法中, 分块是作为一个连续的内存空间存在的, 所以没必要遍历空闲链表, 分配就能非常高速地进行, 而且还能在堆允许范围内分配很大的对象。</li><li>与写时复制技术不兼容: 写时复制技术(copy-on-write)是在 Linux 等众多 UNIX 操作系统的虚拟存储中用到的高速化方法。打个比方, 在 Linux 中复制进程, 也就是使用 fork() 函数时, 大部分内存空间都不会被复制。只是复制进程, 就复制了所有内存空间的话也太说不过去了吧。因此, 写时复制技术只是装作已经复制了内存空间, 实际上是将内存空间共享了。在各个进程中访问数据时, 能够访问共享内存就没什么问题了。然而, 当我们对共享内存空间进行写入时, 不能直接重写共享内存。因为从其他程序访问时, 会发生数据不一致的情况。在重写时, 要复制自己私有空间的数据, 对这个私有空间进行重写。复制后只访问这个私有空间, 不访问共享内存。像这样, 因为这门技术是“在写入时进行复制”的, 所以才被称为写时复制技术。这样的话, GC 标记-清除算法就会存在一个问题——与写时复制技术不兼容。即使没重写对象, GC 也会设置所有活动对象的标志位, 这样就会频繁发生本不应该发生的复制, 压迫到内存空间。为了处理这个问题, 我们采用位图标记(bitmap marking)的方法。</li></ol><h3 id="多个空闲链表" tabindex="-1">多个空闲链表 <a class="header-anchor" href="#多个空闲链表" aria-label="Permalink to &quot;多个空闲链表&quot;">​</a></h3>`,83),e=[t];function h(p,k,r,d,E,o){return a(),i("div",null,e)}const u=s(n,[["render",h]]);export{g as __pageData,u as default};
