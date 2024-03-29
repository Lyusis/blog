# innodb数据库

## 锁机制

### 记录锁(Record Locks)

记录锁是 封锁记录，**记录锁也叫行锁**，例如：

```sql
SELECT * FROM `test` WHERE `id`=1 FOR UPDATE;
```

它会在 id=1 的记录上加上记录锁，以阻止其他事务插入，更新，删除 id=1 这一行。

通过记录锁可以防止脏读。

### 间隙锁(Gap Locks)

**间隙锁是封锁索引记录中的间隔**，或者第一条索引记录之前的范围，又或者最后一条索引记录之后的范围。

产生间隙锁的条件 ( RR事务隔离级别下 ) : 

1. 使用普通索引锁定
2. 使用多列唯一索引
3. 使用唯一索引锁定多行记录

以上情况，都会产生间隙锁

> 对于使用唯一索引来搜索并给某一行记录加锁的语句，不会产生间隙锁。( 这不包括搜索条件仅包括多列唯一索引的一些列的情况；在这种情况下，会产生间隙锁。) 例如，如果id列具有唯一索引，则下面的语句仅对具有id值100的行使用记录锁，并不会产生间隙锁：

```sql
SELECT * FROM child WHERE id = 100 FOR UPDATE;
```

这条语句，就只会产生记录锁，不会产生间隙锁。

**打开间隙锁设置**

首先查看 innodb_locks_unsafe_for_binlog 是否禁用：

```sql
show variables like 'innodb_locks_unsafe_for_binlog';
```

innodb_locks_unsafe_for_binlog：默认值为OFF，即启用间隙锁。因为此参数是只读模式，如果想要禁用间隙锁，需要修改 my.cnf（windows是my.ini） 重新启动才行。

```sql
# 在 my.cnf 里面的[mysqld]添加
innodb_locks_unsafe_for_binlog = 1
```