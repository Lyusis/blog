# Shell编程基础

## 变量

### 自定义变量

1. 变量是由任何字母、数字、和下划线组成的字符串, 且不能以数字开头.
2. 区分字母大小写, 例如Var1和var1是不同的
3. 变量、等号、值中间不能出现任何空格

```shell
var1=hello
echo $var1
```

### 位置参数变量

1. `$n`: n为数字, $0代表脚本本身, `$1`~`$9`代表第1~9个参数, 10以上的参数需要用大括号表示, 如`${10}`
2. `$@`: 代表命令行所有参数, 但是每个参数区别对待
3. `$*`: 代表命令行所有参数, 所有参数视为一个整体
4. `$#`: 参数个数
5. `$$`: 存放当前shell的进程号

### 环境变量

1. 简介: Linux是一个多租户的操作系统, 针对不同的用户都会有一个专有的运行环境, 不同的专有环境就是一主默认环境变量的组合.
2. 对所有用户生效的环境变量: /etc/profile
3. 对特定用户生效的环境变量: ~/.bashrc 或者 ~/.bash_profile
4. 临时有效的环境变量: 脚本或命令行使用export
5. 常用环境变量

| 环境变量   | 含义                       |
| :--------- | :------------------------- |
| `PATH`     | 命令搜索的路径             |
| `HOME`     | 用户家目录的路径           |
| `LOGNAME`  | 用户登录名                 |
| `PWD`      | 当前所在路径               |
| `HISTFILE` | 历史命令的保存文件         |
| `HISTSIZE` | 历史命令保存的最大行数     |
| `HOSTNAME` | 主机名                     |
| `SHELL`    | 用户当前使用的SHELL        |
| `PS1`      | 一级命令提示符             |
| `TMOUT`    | 用户和系统交互过程的超时值 |
| `IFS`      | 系统输入分隔符             |
| `OFS`      | 系统输出分割符             |

### 全局变量和局部变量

1. 不做特殊声明, shell中的变量默认为全局变量. (在大型脚本程序中慎用全局变量)
2. 定义局部变量时使用`local`关键字
3. 函数内和函数外存在同名变量时, 函数内变量会覆盖函数外变量

### 管道

`|`符号即为管道, 意为将前一个命令的结果传递给后续命令, 可以连续传递

从某种意义上来说, 是重定向的一种实现

### 退出状态码

1. 所有的shell命令都是使用退出状态码来告知shell它已执行完毕
2. 退出状态码是一个0~255的整数值
3. Linux提供了一个`$?`来捕获退出状态码的值, 重点在于: 0代表命令执行成功, 非0代表命令执行失败

| 状态码 | 含义                       |
| ------ | -------------------------- |
| 0      | 命令成功结束               |
| 1      | 一般性未知错误             |
| 2      | 不适合的shell命令          |
| 126    | 命令不可执行               |
| 127    | 没找到命令                 |
| 128    | 无效的退出参数             |
| 128+x  | 与Linux信号x相关的严重错误 |
| 130    | 通过Ctrl+C终止的命令       |
| 255    | 正常范围之外的退出码       |

```shell
cat $description/$time-$1.md | while read line; 
    do
        if [ -z $line ]; then 
            break
        else
            echo "已存在文件, 请确认"
            exit 1
        fi
    done
# 以上的代码并不会因为exit 1 而直接退出, 因为包裹在了while语句中, 相当于一个子shell
# 如果需要确实地退出, 需要在外部再做一次判断
if [ $? -eq 1 ]; then
    exit 1
fi
```

### 变量替换

| 语法                           | 说明                                                    |
| ------------------------------ | ------------------------------------------------------- |
| `${变量名#匹配规则}`           | 从变量开头进行规则匹配, 将符合最短的数据删除            |
| `${变量名##匹配规则}`          | 从变量开头进行规则匹配, 将符合最长的数据删除            |
| `${变量名%匹配规则}`           | 从变量尾部进行规则匹配, 将符合最短的数据删除            |
| `${变量名%%匹配规则}`          | 从变量尾部进行规则匹配, 将符合最长的数据删除            |
| `${变量名/旧字符串/新字符串}`  | 变量内容符合旧字符串, 则第一个旧字符串会被新字符串取代  |
| `${变量名//旧字符串/新字符串}` | 变量内容符合旧字符串,, 则全部的旧字符串会被新字符串取代 |

### 变量测试

**配置:** 变量声明

| 变量配置方式       | str没有配置 | str为空字符串 | str已配置且非空 |
| ------------------ | ----------- | ------------- | --------------- |
| `var=${str-expr}`  | var=expr    | var=          | var=$str        |
| `var=${str:-expr}` | var=expr    | var=expr      | var=$str        |
| `var=${str+expr}`  | var=        | var=expr      | var=expr        |
| `var=${str:+expr}` | var=        | var=          | var=expr        |
| `var=${str=expr}`  | var=expr    | var=          | var=$str        |
| `var={str:=expr}`  | var=expr    | var=expr      | var=$str        |

### 字符串处理

#### 计算字符串长度

1. 方法一: `${#string}`
2. 方法二: `expr length "$string"`, string有空格, 则必须加双引号

#### 获取子串信息

1. 抓取子串第一个字符数字串出现的位置: `expr index $string $substring`

2. 计算子串长度, 必须从头开始匹配: `expr match $string substr`

3. 抽取子串(`$`符号命令下标从0开始, `expr`命令下标从1开始)

| 语法                                    | 说明                             |
| --------------------------------------- | -------------------------------- |
| `${string:position}`                    | 从string中的position开始         |
| `${string:position:length}`             | 从position开始, 匹配长度为length |
| `${string: -position}`                  | 从右边开始匹配                   |
| `${string: (position)}`                 | 从左边开始匹配                   |
| `expr substr $string $position $length` | 从position开始, 匹配长度为length |

### 命令替换

1. 在脚本的变量位置中执行复杂命令
2. 方法一:  `````command` ````
3. 方法二:  `$(command)`

### 读取输入

1. `read -? var`命令可以读取输入值, 并储存在var中
2. `-?`:
   1. -d :  表示delimiter, 即定界符, 一般情况下是以IFS为参数的间隔, 但是通过-d, 我们可以定义一直读到出现执行的字符位置.例如read –d madfds value, 读到有m的字符的时候就不在继续向后读, 例如输入为 hello m, 有效值为"hello”, 请注意m前面的空格等会被删除.这种方式可以输入多个字符串, 例如定义".”作为结符号等等
   2. -e : 只用于互相交互的脚本, 它将readline用于收集输入行.读到这几句话不太明白什么意思, 先跳过.
   3. -n :  用于限定最多可以有多少字符可以作为有效读入.
   4. -p : 用于给出提示符, `read –p '… my promt?' value`
   5. -r : 在参数输入中, 我们可以使用`/`表示没有输入完, 换行继续输入, 如果我们需要行最后的’/’作为有效的字符, 可以通过-r来进行. 此外在输入字符中, 我们希望/n这类特殊字符生效, 也应采用-r选项.
   6. -s :  对于一些特殊的符号, 例如箭头号, 不将他们在terminal上打印, 例如read –s key, 我们按光标, 在回车之后, 如果我们要求显示, 即echo, 光标向上, 如果不使用-s, 在输入的时候, 输入处显示^[[A, 即在terminal上 打印, 之后如果要求echo, 光标会上移.
   7. -t : 用于表示等待输入的时间, 单位为秒, 等待时间超过, 将继续执行后面的脚本, 注意不作为null输入, 参数将保留原有的值.

### 有类型变量

declare命令和typeset命令, 两者等价, 都是用来定义变量类型的

**declare命令参数表**

| 参数 | 含义                               |
| ---- | ---------------------------------- |
| -r   | 将变量设为只读                     |
| -i   | 将变量设为整数                     |
| -a   | 将变量定义为数组                   |
| -f   | 显示此脚本前定义过的所有函数及内容 |
| -F   | 仅显示此脚本前定义过的函数名       |
| -x   | 将变量声明为环境变量               |

### 数组

1. 使用`@`或`*`可以获取数组中的所有元素, `${array[@]}`
2. `${#array[@]}`可以获取数组的长度
3. `unset array[i]`删除元素 `unset array`清空数组
4. `${array[@]:a:b}`显示数组数组下标索引从a开始到b的元素, 不包括b
5. `${array[@]/an/An}`将数组中所有包含an的子串替换为AN
6. 数组遍历

```shell
for v in ${array[@]}
do 
	echo $v
done
```

## 数学运算

### 双括号 `(())`

使用双括号可以进行算数运算, 可以写类C语言的运算表达式

可用运算符: `value++` `value--` `++value` `--value` `!` `==` `>` `<` `>=` `<=` `&&` `||`

**注意事项**: 

1. 双括号结构中, 变量名引用可以加$, 也可以不加  
2. 运算符前后可以有空格, 也可以没有  
3. 可以用于if、for、while等循环控制结构中  
4. 多个运算符使用逗号分`((a = a + 1, b = b -1))`  
5. 不支持浮点型  

### 双方括号 `[[]]`

支持正则表达式, 可以使用`=~`来检测字符串是否符合某个正则表达式

用法为: `[[ str =~ regex ]]`其中, str 表示字符串, regex 表示正则表达式

**注意事项**

1. 比较数字需要使用 -eq、-gt 等选项, 推荐使用`(())`进行整数值计算  
2. 双方括号结构中, 变量名引用必须加$  
3. `[[`后面必须要空格, `]]`前面也必须要空格  

### expr

1. 语法: `expr $num1 operator $num2`

2. 操作符对照表

| 操作符                     | 含义                                     |
| -------------------------- | ---------------------------------------- |
| `num1 | num2`              | num1不为空且非0, 返回num1; 否则返回num2  |
| `num1 & num2`              | num1不为空且非0, 返回num1; 否则返回0     |
| `num1 < <= = != > >= num2` | num1 operator num2, 符合返回1; 否则返回0 |
| `num1 + - * / % num2`      | 普通数值运算                             |

**注:** 大多数时候需要`\`进行转义, 只能精确到整数, 对浮点数进行计算会报错

### bc

1. bc是bash内建的运算器, 支持浮点运算，内建变量scale可以设置小数位, 默认为0.   bc可以识别（浮点）数字，变量，表达式，编程语句，函数。
2. 可以使用bc命令从shell提示符访问bc，quit退出bc: 

```shell
# bc
bc 1.06.95
Copyright 1991-1994, 1997, 1998, 2000, 2004, 2006 Free Software Foundation, Inc.
This is free software with ABSOLUTELY NO WARRANTY.
For details type `warranty'. 
1.25*3
3.75
quit
```

**在脚本中的用法**

```shell
#!/bin/bash
# 使用``包裹
# EOF结束时必须顶格写
var=`bc << EOF
scale=4
a=5
b=4
b/a
EOF`
echo $var

# 使用echo和管道符
var1 = `echo "scale=4;$num1/$num2" | bc`
echo $var
```



## 条件语句

### case语句语法

```shell
case $var in
	pattern1)
		commands;
		;;　# 类似于传统的break;
	pattern2)
		commands;
	*) # 相当于default
		commands;
esac
```

### if语句语法

```shell
if command | condition #注意:shell中判断符`==``!=`等的左右两边必须空格
then
	commands
elif command | condition
then
	commands
else
	commands
fi
```

### 数值比较

| 数值比较符  | 含义                                    |
| ----------- | --------------------------------------- |
| `n1 -eq n2` | n1和n2相等, 则返回true, 否则返回false   |
| `n1 -ne n2` | n1和n2不相等, 则返回true, 否则返回false |
| `n1 -gt n2` | n1大于n2, 则返回true, 否则返回false     |
| `n1 -ge n2` | n1大于等于n2, 则返回true, 否则返回false |
| `n1 -lt n2` | n1小于n2, 则返回true, 否则返回false     |
| `n1 -le n2` | n1小于等于n2, 则返回true, 否则返回false |

### 字符串比较

| 字符串比价     | 含义                  |
| -------------- | --------------------- |
| `str1 = str2`  | 想等比较              |
| `str1 != str2` | 不等比较              |
| `str1 < str2`  | str1小于str2为true    |
| `str1 > str2`  | str1大于str2为true    |
| `-n str1`      | str1长度不是0则为true |
| `-z str1`      | str1长度为0则为true   |

### 文件比较

| 文件比较          | 含义                     |
| ----------------- | ------------------------ |
| `-d file`         | file是否为目录           |
| `-f file`         | file是否为文件           |
| `-e file`         | file是否存在             |
| `-r file`         | file是否可读             |
| `-w file`         | file是否可写             |
| `-x file`         | file是否可执行           |
| `-s file`         | file是否存在且非空       |
| `file1 -nt file2` | file1比file2新, 则为true |
| `file1 -ot file2` | file1比file2旧, 则为true |

## 循环语句

### for语句语法

```shell
for var in list
do
	commands
done
```

**小技巧: **

```shell
# 遍历01~20, 2位
for i in {01..20} 
do
	echo "Number is $i"
done

# shell中空格和Tab默认分割, 可以通过IFS进行修改
IFS=":"
list="ZHANGSAN:LISI:WANGWU" 
for i in $list
do
	echo i
done

# 读取命令的结果
FILE=$(ls /opt/)

for i in $FILE
do 
	if [ -d /opt/$i ]; then
		echo "$i is DIR"
	elif [ -f /opt/$i ]; then
		echo "$i is FILE"
	else
		echo "ERROR"
	fi
done
```

#### C语言风格

```shell
for (( i = 1; i <= 100; i++ ))
do
	(( sum+=$i ))
done
echo $sum
```

### while语句语法

```shell
while commond 
do
	commands
done
```

### until语句语法

```shell
until command
do
	commands
done
```

## 函数

### 语法

```shell
function name(){
	body;
}
```

### 返回值

1. 使用return返回值的时候只能使用1~255的整数, 所以通常是用来返回状态的. 0表示成功, 1代表失败.
2. 使用echo可以返回任何字符串结果, 通常用于返回数据, 比如一个字符串或者一个列表

### 函数库

1. 将经常使用的重复代码封装成函数文件 
2. 通过`. function`引入函数库(可能需要使用绝对路径)　
3. 库文件名的后缀是任意的, 但是一般使用`.lib`
4. 库文件通常没有可执行选项
5. 库文件无需和脚本在同级目录, 只需在脚本中引用时指定
6. 第一行一般使用`#!/bin/echo`, 输出警告信息, 避免用户执行

## 文件搜索

### find

1. 语法格式`find [路径] [选项] [操作]`,可用 `.`代表当前目录

2. 选项参数对照表

| 选项                   | 含义                                                       |
| ---------------------- | ---------------------------------------------------------- |
| `-name`                | 根据文件名查找(例: 可以使用`*conf`搜索conf结尾的文件)      |
| `-iname`               | 查找指定文件名的文件                                       |
| `-perm`                | 根据文件权限查找                                           |
| `-prune`               | 该选项可以排除某些查找目录                                 |
| `-user`                | 根据文件属主查找                                           |
| `-group`               | 根据文件属组查找                                           |
| `-mtime`               | 根据文件更改时间查找                                       |
| `-nogroup`             | 查找无有效属组的文件                                       |
| `-nouser`              | 查找无有效属主的文件                                       |
| `-newer file1 ! file2` | 查找更改时间比file1新但比file2旧的文件                     |
| `-type`                | 按文件类型查找                                             |
| `-size`                | 按文件大小查找                                             |
| `-mindepth n`          | 从n级子目录开始搜索                                        |
| `-maxdepth n`          | 最多搜索到n级子目录                                        |
| `-print`               | 打印输出                                                   |
| `-exec`                | 对搜索到的文件执行特定的操作                               |
| `-ok`                  | 和exec功能一样, 只是每次操作都会给用户提示, 要求选择yes/no |
| `-a` `-o` `-not/!`     | 与 或 非                                                   |

3. 选项补充

   1. -type

      - f 文件 `find . -type f`
      - d 目录 `find . -type d`
      - c 字符设备文件 `find . -type c`
      - b 块设备文件 `find . -type b`
      - l 链接文件 `find . -type l`
      - p 管道文件 `find . -type p`

   2. -size

      - -n 大小小于n的文件 `find /etc -size -1M`
      - +n 大小大于n的文件 `find /etc -size +1M`

   3. -mtime

      - -n n天以内修改的文件 `find /etc -mtime -3`
      - +n n天以外修改的文件 `find /etc -mtime +3`
      - n   n天前(时间点)修改的文件

   4. -mmin 多少分钟前修改的文件, 可用`+n / -n`指定

   5. -prune 

      通常和-path一起使用, 用于将特定目录排除在搜索条件之外

      1. 搜索当前目录下所有普通文件, 但排除test目录

         `find . -path ./etc -prune -o -type f`

      2. 查找当前目录下所有普通文件, 但排除etc和opt目录

         `find . -path ./etc -prune -o -path ./opt -prune -o -type f`

      3. 查找当前目录下所有普通文件, 但排除etc和opt目录, 但属主为hdfs

         `find . -path ./etc -prune -o -path ./opt -prune -o -type f -a -user hdfs`

      4. 查找当前目录下所有普通文件, 但排除etc和opt目录, 但属主为hdfs, 且文件大小必须大于字符

         `find . -path ./etc -prune -o -path ./opt -prune -o -type f -a -user hdfs -a -size +500c`

   6. -exec

      1. 格式为`-exec 'command' {} \;`

      2. 例:

         - 搜索/etc下的文件(非目录), 文件名以conf结尾, 且大于10k, 然后将其删除

           `find ./etc/ -type f -name '*.conf' -size +10k -exec rm -f {} \;`

         - 将/var/log/目录下以log结尾的文件, 且更改时间在7天以上的删除

           `find /var/log/ -name '*.log' -mtime +7 -exec rm -rf {} \;`

         - 搜索条件和例1相同, 但时不删除, 而是复制到/root/conf目录下

           `find ./etc/ -size +10k -type f -name '*.conf' -exec cp {} /root/conf/ \;`

### locate、whereis和which

#### locate

1. 文件查找命令, 所属软件包mlocate
2. 不同于find命令时在整块磁盘中搜索, locate命令在数据库文件中查找
3. find时默认全部匹配(精确匹配), locate则是默认部分匹配(模糊匹配)
4. updatedb: 更新数据库文件
   - 用户更新/var/lib/mlocate/mlocate.db
   - 所使用配置文件/etc/updatedb.conf
   - 该命令在后台cron计划任务重定期执行

### whereis

用于搜索二进制文件、二进制程序文档、源代码文件

| 选项 | 含义               |
| ---- | ------------------ |
| -b   | 只返回二进制文件   |
| -m   | 只返回帮助文档文件 |
| -s   | 只返回源代码文件   |

#### which

仅查找二进制程序文件

| 选项 | 含义             |
| ---- | ---------------- |
| -b   | 只返回二进制文件 |

#### 各命令使用场景辨析

| 命令    | 适用场景                         | 优缺点                   |
| ------- | -------------------------------- | ------------------------ |
| find    | 查找某一类文件, 或许要复杂操作   | 功能强大, 速度慢         |
| locate  | 只能查找单个文件                 | 功能单一, 速度快         |
| whereis | 查找程序的可执行文件、帮助文档等 | 不常用                   |
| which   | 只查找程序的可执行文件           | 常用于查找程序的绝对路径 |

## 文本处理

### grep和egrep

#### grep语法格式

1. `grep [option][pattern][file1,file2...]`

2. `command | grep [option][pattern]`

3. grep参数

| 选项 | 含义                                       |
| ---- | ------------------------------------------ |
| -v   | 不显示匹配行信息                           |
| -i   | 搜索时忽略大小写                           |
| -n   | 显示行号                                   |
| -r   | 递归搜索                                   |
| -E   | 支持扩展正则表达式                         |
| -F   | 不按正则表达式匹配, 按照字符串字面意思匹配 |
| -c   | 只显示匹配行总数                           |
| -w   | 匹配整词                                   |
| -x   | 匹配整行                                   |
| -l   | 只显示文件名, 不显示内容                   |
| -s   | 不显示错误信息                             |

### sed

1. sed(Stream Editor), 流编辑器. 对标准输出或文件逐行进行处理.
2. 语法:
   1. `stdout | sed [option] "pattern command"`
   2. `sed [option] "pattern command" file`
3. sed的选项

| 选项 | 含义                               |
| ---- | ---------------------------------- |
| `-n` | 只打印模式匹配行                   |
| `-e` | 直接在命令行进行sed编辑, 默认选项  |
| `-f` | 编辑动作保存在文件中, 指定文件执行 |
| `-r` | 支持扩展正则表达式                 |
| `-i` | 直接修改文件内容                   |

例: `sed -n -e '/python/p' -e 'PYTHON/p' sed.txt`

​	 `sed -n -r '/python|PYTHON/p' sed.txt`

​     `sed -i 's/love/like/g' sed.txt`

4. pattern用法表

| 匹配模式                     | 含义                                             |
| ---------------------------- | ------------------------------------------------ |
| 10command                    | 匹配到第10行                                     |
| 10, 20command                | 匹配到第10行开始, 到第20行结束                   |
| 10, +5command                | 匹配从第10行开始, 到第16行结束                   |
| /pattern1/command            | 匹配到pattern1的行                               |
| /pattern1/,/pattern2/command | 匹配到pattern1的行开始, 到匹配到pattern2的行结束 |
| 10, /pattern1/command        | 匹配从第10行开始, 到匹配到pettern1的行结束       |
| /pattern1/, 10command        | 匹配到pattern1的行开始, 到第10行匹配结束         |

5. 编辑命令对照表

| 类别 | 编辑命令     | 含义                               |
| ---- | ------------ | ---------------------------------- |
| 查询 | p            | 打印                               |
| 增加 | a            | 匹配到行后追加内容                 |
| 增加 | i            | 匹配到行前追加追加内容             |
| 增加 | r            | 外部文件读入, 行后追加             |
| 增加 | w            | 匹配行写入外部文件                 |
| 删除 | d            | 删除                               |
| 修改 | s/old/new    | 将行内第一个old替换为new           |
| 修改 | s/old/new/g  | 将行内全部的old替换为new           |
| 修改 | s/old/new/2g | 将行内前2个old替换为new            |
| 修改 | s/old/new/ig | 将行内old全部替换为new, 忽略大小写 |

例: `sed -i 's/had..p/&s/g' file`,  `&`表示反向引用, 可以修改满足某种形式的内容

​	 `sed -i 's/\(had..p\)/\1O/g' file`, `\1`也代表反向引用, 但是相比于`&`, `\1`可以通过前面的括号, 控制替换的部分(括号内不变)

**注意事项:** 有变量时, 使用双引号, 或者每个变量都用单引号括起来. `=`可以显示行号.

### awk

awk是一个文本处理工具, 通常用于处理数据并生成结果报告

#### 语法格式

1. 第一种形式: `awk 'BEGIN{}pattern{commands}END{}' file_name`

   | 语法格式     | 解释                     |
   | ------------ | ------------------------ |
   | `BEGIN{}`    | 正式处理数据之前执行     |
   | `pattern`    | 匹配模式                 |
   | `{commands}` | 处理命令, 可能多行       |
   | `END{}`      | 处理完所有匹配数据后执行 |

2. 第二种形式:  `standard output | awk 'BEGIN{}pattern{commands}END{}'`

#### 内置变量

内置变量对照表

| 内置变量 | 含义                                 |
| -------- | ------------------------------------ |
| $0       | 整行内容                             |
| $1 - $n  | 行的第1道n个字段的信息               |
| NF       | 当前行的字段个数, 也就是有多少列     |
| NR       | 处理行的行号                         |
| FNR      | 多文件处理时, 每个文件单独记录的行号 |
| FS       | 输入字段分隔符, 默认空格或tab键分割  |
| RS       | 输入行分隔符, 默认回车换行           |
| OFS      | 输出字段分隔符, 默认为空格分割       |
| ORS      | 输出行分隔符, 默认为回车换行         |
| FILENAME | 当前输入的文件名                     |
| ARGC     | 命令行参数个数                       |
| ARGV     | 命令行参数数组                       |

#### 格式化输出

printf: `-`左对齐, `+`右对齐

例: `awk 'BEGIN{FS=":"}{printf "-20s %-20s\n", $1, $7}' /etc/passwd`

#### 条件及循环语句

```shell
# if
awk 'BEGIN{FS=':'}{if($3>50 && $3<100) printf"%-20%-25%-5d\n","大于50小于100的UID",$1,$2}' /etc/passwd

# do while
awk 'BEGIN{ 
test=100;
total=0;
while(i<=test)
{
    total+=i;
    i++;
}
print total;
}'

# for
awk 'BEGIN{ 
total=0;
for(i=0;i<=100;i++)
{
    total+=i;
}
print total;
}'
```

#### 字符串操作

| 函数名              | 解释                        | 函数返回值         |
| ------------------- | --------------------------- | ------------------ |
| `length(str)`       | 计算字符串长度              | 整数长度值         |
| `index(str1,str2)`  | 在str1中查找str2的位置      | 索引位置, 从1计数  |
| `tolower(str)`      | 转换为小写                  | 转换后的小写字符串 |
| `toupper(str)`      | 转换为大写                  | 转换后的大写字符串 |
| `substr(str,m,n)`   | 从str的m个字符开始, 截取n位 | 截取后的子串       |
| `split(str,arr,fs)` | 按fs切割字符串, 结果保存arr | 切割后的子串的个数 |
| `match(str,RE)`     | 在str中按照RE查找, 返回位置 | 返回索引位置       |

#### 条件选项

| 选项 | 解释             |
| ---- | ---------------- |
| -v   | 参数传递         |
| -f   | 指定脚本文件执行 |
| -F   | 指定分隔符       |
| -V   | 查看awk的版本号  |

例: 
<br>`awk -v num2=$num1 -v var1="$var" 'BEGIN{print num2,var1}' `
<br>`awk -v num2=$num1 -v var1="$var" -f file `

#### 数组的用法

1. 打印元素: `echo ${array[2]}`
2. 打印元素个数: `echo ${#array[@]}`
3. 打印元素长度: `echo ${#array[3]}`
4. 给元素赋值: `array[3]="Li"`
5. 删除元素: `unset array[2]; unset array`
6. 分片访问: `echo ${array[@]:1:3}`
7. 元素内容替换: 
<br>`${array[@]/e/E}` 只替换第一个e
<br>`{array[@]//e/E}` 替换所有的e
8. 遍历:
```shell
for a in array
do 
	echo $a
done
```

**注:** 在awk中, 数组下标不仅可以使用1、2、3......, 还可以使用字符串作为数组下标