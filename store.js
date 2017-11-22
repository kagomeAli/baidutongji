// 数据库
var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '123456',
    database : 'baidutongji'
});

// sql语句
let sqlString
connection.connect();
// 获取日期
var myDate = new Date();
var today = '' + myDate.getFullYear() +'/'+ (myDate.getMonth() + 1)+'/' + (myDate.getDate() - 1)
var yesterday = '' + myDate.getFullYear() +'/'+ (myDate.getMonth() + 1) +'/'+ (myDate.getDate() - 2)
console.log('需要存储的日期：' + today)
//判断是否有导入过数据
sqlString = 'select id from guidedata where date_time = ' + new Date(today).getTime()
connection.query(sqlString, function (err, result) {
    if (err) {
        console.log(err)
        connection.end();
        return
    } else {
        console.log(result)
        if (result[0] && result[0].id) {
            console.log('存储过了')
            connection.end()
        }
        if (result == []){
            console.log('没有存储过数据')
            baidutongji()
        }
    }
});


const baidutongji = async () => {
    // 百度统计连接
    const config = {
        username: 'Travelshell',
        password: 'travelshell',
        token: '9da1e64162eba1b8f64b904deaa1f12b', //token
        uuid: 'uuid'
    }
    // 引入百度统计
    const tongji = require('node-tongji').getInstance(config)

    // 首先登录
    await tongji.login()
  /*
   user.beike-official-accounts.bklx.site
   贝壳旅行助手
   */
    var data = await tongji.getData({
        site_id: 11067582,
        method: 'overview/getTimeTrendRpt',
        start_date: yesterday,
        end_date: today,
        metrics: 'pv_count,visitor_count',
        max_results: 0, // 默认是20， 0 代表获取到所有数据
        order: 'desc'
    })
    data = data.body.data[0].result.items
    sqlString = 'insert into guidedata(pv,uv,date,date_time) value("' + data[1][1][0] + '","' + data[1][1][1] + '","' + data[0][1][0] +  '","'+ new Date(data[0][1][0]).getTime() + '")'
    sqlString = sqlString.replace(/--/ig, '0')
    connection.query(sqlString, function (err, result) {
        if (err) {
            console.log(err)
            return
        }
    });
  /*
   guide.beike-official-accounts.bklx.site
   贝壳导游之家
   */
    var data2 = await tongji.getData({
        site_id: 11067567,
        method: 'overview/getTimeTrendRpt',
        start_date: yesterday,
        end_date: today,
        metrics: 'pv_count,visitor_count',
        max_results: 0, // 默认是20， 0 代表获取到所有数据
        order: 'desc'
    })
    data2 = data2.body.data[0].result.items
    sqlString = 'insert into userdata(pv,uv,date,date_time) value("' + data2[1][1][0] + '","' + data2[1][1][1] + '","' + data2[0][1][0] + '","' + new Date(data2[0][1][0]).getTime() + '")'
    sqlString = sqlString.replace(/--/ig, '0')
    connection.query(sqlString, function (err, result) {
        if (err) {
            console.log(err)
            return
        }
    });

    connection.end();
    //登出
    tongji.logout()
}
