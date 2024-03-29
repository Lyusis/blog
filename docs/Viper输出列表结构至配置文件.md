# 使用Viper输出列表结构至配置文件

## 本文要点

1. 使用Viper进行Toml配置文件的读入和写出。
2. 有关于如何将默认的多级列表结构, `[]map[string]interface{}`写入配置文件的思考。
3. Yaml在本地因不知名原因不可用, 所以只有Toml配置文件示例。
4. Golang初学者, 如有错误望指出。

## 正文

### 需求

1. 其实将动态的配置文件内容再写回配置文件的需求并不多见, 需要满足: 1. 配置的量不大, 如果量大推荐还是使用文档型数据库; 2. 对实时性要求不高, viper写入写出的确很快, 但是IO操作必然不可能和goroutine的速度相提并论, 如果对于实时性敏感……应该没有人会用文件来做同步吧。

2. 本次讨论的对象是列表形式的对象, 如:

   ```yaml
   livers:
     - nickname: 水姐
       roomId: 6775697
     - nickname: 瑞芙
       roomId: 22470204
     - nickname: 弥希
       roomId: 21672023
   ```

   ```Toml
   [[livers]]
   nickname = "水姐"
   roomid = 6775697
   
   [[livers]]
   nickname = "瑞芙"
   roomid = 22470204
   
   [[livers]]
   nickname = "弥希"
   roomid = 21672023
   
   # 或者其他一种写法, 但是viper最终会转换成上面这种形式
   liver = [
     {nickname = "水姐", roomid = 6775697},
     {nickname = "瑞芙", roomid = 22470204},
     {nickname = "弥希", roomid = 21672023}
   ]
   ```

3. 单一属性对象`A = "aaa"`和复合属性对象`[A] = {a = "aa", b="bb"}`就不讨论了, 贴上自己的代码:

   ```go
   // writeInto 共通的写入配置文件函数
   func writeInto() {
   	err := viper.WriteConfigAs(fileName)
   	if err != nil {
   		logger.Sugar.Error(err)
   	}
   }
   
   // 单一属性对象
   // AddSimpleConfig str:属性名, sth:内容
   func AddSimpleConfig(str string, sth interface{}) {
   	viper.Set(str, sth)
   	writeInto()
   }
   
   // 复合属性对象
   // AddPairConfig str:大项属性名, sth:复合内容,key为小项属性名
   func AddPairConfig(str string, sth map[string]interface{}) {
   	// 根据实际情况填写属性配对表, 量大时可以再写一套方法用来配置和解析, 完全可以通过Viper实现
       switch str {
   	case "cqsenddest":
   		viper.Set("cqsenddest.ip", CQSendDest.IP)
   		viper.Set("cqsenddest.port", CQSendDest.Port)
   	case "cqreceiver":
   		viper.Set("cqreceiver.ip", CQReceiver.IP)
   		viper.Set("cqreceiver.port", CQReceiver.Port)
   	default:
   		logger.Sugar.Error(fmt.Errorf("cannot find attribute"))
   	}
   	for key, value := range sth {
   		name := str + "." + key
   		viper.Set(name, value)
   	}
   	writeInto()
   }
   ```

4. 如果只是写入只要在最后输出的时候进行转换即可, 但是既然是更新配置文件, 必然有一个比较的过程, 而两个数组形式的数据结构进行比较是比较费时费力的, 所以还需要在比较前转换成map再进行后续工作。另外, 将原本的内容比较､ 更新完成后, 再放入转换器, 最后直接写入, 这样做的效率是最高的, 但是出于减少业务部分的逻辑､ 以及方便输出层指定唯一索引值的目的, 还是放在了输出层进行比较合并。

5. 抄不到别人写的源代码。

### 输出列表结构至配置文件

1. 流程

   1. 读入原始配置文件 

   2. 读入更新对象

   3. 将原本的`[]map[string]interface{}`变为`map[string]map[string]interface{}`, 其中map的key为手动维护的唯一值, 也即更新的依据。
   4. 需要更新的对象与原始文件的key相同的, 使用更新对象的内容进行覆盖, 没有的则新增。表现为代码即一行`old[new.key] = new.value`
   5. 写入配置文件
   6. 再次读入配置文件, 完成更新

2. 代码:

   ```go
   // writeInto 共通的写入配置文件函数
   func writeInto() {
   	err := viper.WriteConfigAs(fileName)
   	if err != nil {
   		logger.Sugar.Error(err)
   	}
   }
   
   // 其实有些代码可以合并, 但是为了突出思考过程就拆开写了, 喜欢传统代码模式的朋友可以从下往上看
   
   // transformMap 将[]map[string]interface{}变为map[string]map[string]interface{}
   func transformMap(keyAttribute string, mapList []map[string]interface{}) map[interface{}]map[string]interface{} {
   	transform := make(map[interface{}]map[string]interface{})
   	for _, object := range mapList {
   		keyValue := object[keyAttribute]
   		transform[keyValue] = object
   	}
   	return transform
   }
   
   // transformMap 将map[string]map[string]interface{}变为[]map[string]interface{}
   func unTransformMap(keyAttribute string, transform map[interface{}]map[string]interface{}) []map[string]interface{} {
   	mapList := make([]map[string]interface{}, 0)
   	for _, value := range transform {
   		mapList = append(mapList, value)
   	}
   	return mapList
   }
   
   // coverAndMergeMap B map 覆盖或合并到A map上
   // 当 A map 有但 B map 没有的值, 保持原样添加到新 map
   // 当 B map 有但 A map 没有的值, 添加到新 map
   // 当 A B map 都有的值, 将 B map 的值添加到新 map
   func coverAndMergeMap(aMap, bMap map[interface{}]map[string]interface{}) map[interface{}]map[string]interface{} {
   	mergeMap := aMap
   	for key, value := range bMap {
   		mergeMap[key] = value
   	}
   	return mergeMap
   }
   
   // addConfUtil mapList 最终输出值, 基于原本的数据 A map
   // sth 新增值, B map
   func addConfUtil(keyAttribute string, sth []map[string]interface{}, mapList *[]map[string]interface{}) {
   	sthTransform := transformMap(keyAttribute, sth)
   	mapListTransform := transformMap(keyAttribute, *mapList)
   	mergeMapTransform := coverAndMergeMap(mapListTransform, sthTransform)
   	mergeMap := unTransformMap(keyAttribute, mergeMapTransform)
   	*mapList = mergeMap
   }
   
   // 业务相关代码
   // addXXX mapList是输出目标, sth是新增项
   func addXXX(mapList *[]map[string]interface{}, sth []map[string]interface{}) {
   	for _, xxx := range XXX {
   		xxxMap := make(map[string]interface{})
   		xxxMap[attribute] = xxx.A
   		xxxMap[attribute] = xxx.B
   		*mapList = append(*mapList, liverMap)
   	}
       // 开始添加操作, 指明唯一值
   	addConfUtil(attribute, sth, mapList)
   }
   
   // AddListConfig 添加多层级的Toml属性
   func AddListConfig(str string, sth []map[string]interface{}) {
   	var (
   		mapList = make([]map[string]interface{}, 0)
   	)
   	switch str {
   	case "XXX":
   		addXXX(&mapList, sth)
   	}
   	viper.Set(str, mapList)
   	writeInto()
   }
   
   ```

## 总结与遗憾

1. Viper这个列表输出有些复杂, 但是实际上也不难, 需要一些耐心应该都能写出来。
2. 竞合做的简单了, 主要是考虑到实际业务可能会有很多变化, 是否覆盖以及覆盖和保留的条件都随业务变化而变化, 感觉上最好是提供接口由业务方直接传个实现的func进来处理, 所以就浅尝辄止了。



