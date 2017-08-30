# msq
A mysql tools

## How to use
```javascript

const msq = require('./index')
const config = {
    "host": "xxx",
    "user": "xxx",
    "password": "xxx",
    "database": "xxx",
    "port": xxx
}
const model = msq(config)

/**
 * Use co + thunkify as example 下面使用 co + thunkify 做例子
 */

const co = require('co')
const thunkify = require('thunkify-array')

co(function*(){


// if you run a query , just pass a sql for the first argument, and thunkify will pass second argument(Callback) to the method which is necessary
// if you need to handle the result before callback, pass the third argument as function , it can handle the origin result that mysql return
// query方法: 将sql语句传入第一个参数，第二个参数传入callback（此例子由thunkify提供callback）
// 如需要对返回结果提前做处理，可传入函数作为第三个参数，此函数将会处理mysql直接返回的结果，并交由callback返回

const queryResult = yield thunkify(model.query)('SELECT * FROM table')


// if you run a process, pass a process name for the first argument, and secondary augument is parameters(as Array), also, callback(third argument) is pass by thunkify
// if you need to handle the result before callback, pass the fourth argument as function , it can handle the origin result that mysql return
// proc: 执行存储过程，第一个参数为存储过程名，第二个参数是存储过程的参数，第三个参数是callback（仍然由thunkify提供）
// 如需要对返回结果提前做处理，可传入函数作为第三个参数，此函数将会处理mysql直接返回的结果，并交由callback返回

const procResult = yield thunkify(model.proc)('process',['...params'])

//now, you can get the result from mysql
})
```

##　More config

msg use origin method "mysql.createPool" to create a pool, so your config can be the same as those use for mysql, and the config is the same 

also, you can use pool's method like this

```javascript

    model.pool.on('connection',function(){{/*method*/})

    model.pool.on('enqueue',function(){/*method*/})

    //model.pool is same as the pool that mysql return
```

see more: [mysql document](https://www.npmjs.com/package/mysql)

