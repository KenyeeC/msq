var co = require('co')
var thunkify = require('thunkify-array')
var mysql = require('mysql')

function Msq(config){
    try{
        /** 检验config是否有效 */
        if(!config) throw TypeError('can not create pool with a invalid config')

        /** 初始化原生pool */
        var pool = mysql.createPool(config)

        /** 将会被返回的对象 */
        var msq = {
            pool: pool,
            query:query,
            proc:proc
        }
        
        /** 
         * 执行sql查询，由callback返回结果，若传入，fn则fn对结果进行处理，再由callback返回结果（此属性不可修改）
         * 
         * @param {String} sql 
         * @param {Function} callback
         * @param {[Function]} fn
         **/
        function query(sql,callback,fn){
            if(typeof sql !== 'string') throw TypeError('The first argument of query method must be String')
            if(typeof callback !== 'function') throw TypeError('The second argument of query method must be Function')
            msq.pool.getConnection(function(err,connection){
                if(err) return callback(err)
                var query = thunkify(connection.query.bind(connection))
                co(function*(){
                    var row = yield query(sql)
                    var rst = row[0]
                    if(typeof fn === 'function') rst = fn(row)
                    connection.release()
                    callback && callback(null,rst)
                }).catch(err=>{
                    console.error(err)
                    callback(err)
                    connection.release()
                })
            })
        }

        /** 
         * 执行存储过程，由callback返回结果，若传入fn，则fn对结果进行处理，再由callback返回结果（此属性不可修改）
         * 
         * @param {String} proc 
         * @param {Array} param 
         * @param {Function} callback
         * @param {[Function]} fn
         **/
        function proc(proc,param,callback,fn){
            if(typeof proc !== 'string') throw TypeError('The first argument of proc method must be String')
            if(!(param instanceof Array)) throw TypeError('The second argument of proc method must be Array')
            if(typeof param !== 'function') throw TypeError('The third argument of proc method must be Function')
            msq._pool.getConnection(function(err,connection){
                if(err) return callback(err)
                var query = thunkify(connection.query.bind(connection))
                co(function*(){
                    var row = yield query(proc,param)
                    var rst = row[0]
                    if(typeof fn === 'function') rst = fn(row)
                    connection.release()
                    callback && callback(null,rst)
                }).catch(err=>{
                    console.error(err)
                    callback(err)
                    connection.release()
                })
            })
        }
        
        /** query 与 exec 属性不可再修改 */
        Object.defineProperties(msq,{
            'query' : {
                writable:false,
                enumerable:false,
                configurable:false
            },
            'proc' : {
                writable:false,
                enumerable:false,
                configurable:false
            }
        })

        return msq

    }catch(e){
        console.error('msq error: ', e.stack || e)
    } 
}

module.exports = Msq