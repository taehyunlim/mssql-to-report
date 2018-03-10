`use strict`;

// Dependencies
const express = require('express');
const app = express();
const sql = require('mssql');
const moment = require('moment');
const config = require('./config.js');

// SQL Query
const query = `
SELECT 
	RTRIM(OEORDH.PONUMBER) AS PONUMBER, 
	RTRIM(OEORDH.ORDNUMBER) AS ORDNUMBER, 
	RTRIM(OEORDH.LASTINVNUM) AS INVNUM, 
	RTRIM(OEORDH.LOCATION) AS LOCATION, 
	RTRIM(OEORDH1.SHIPTRACK) + ', ' AS SHIPTRACK, 
	RTRIM(OEORDH.CUSTOMER) AS COMPANY, 
	RTRIM(OEORDH.ORDDATE) AS ORDDATE, 
	RTRIM(OEORDH.ONHOLD) AS ONHOLD, 
	RTRIM(OEORDH1.HOLDREASON) AS HOLDREASON, 
	RTRIM(OEORDH.REFERENCE) AS REFERENCE 
FROM [ZISCOM].[dbo].OEORDH OEORDH 
LEFT JOIN [ZISCOM].[dbo].OEORDH1 OEORDH1 
	ON OEORDH.ORDUNIQ = OEORDH1.ORDUNIQ 
WHERE (((OEORDH.CUSTOMER)='ZINUS.COM') 
AND ( CONVERT(DATETIME, RTRIM(OEORDH.ORDDATE)) >= CONVERT(DATETIME, @query_start_date) ) ) 
ORDER BY OEORDH.PONUMBER DESC
`;


// Express Server
app.get('/:queryStartDate', (req, res) => {
  // Connect to MSSQL DB
  sql.connect(config, (err) => {
    if (err) console.log(err);

    // Create Request Object 
    let request = new sql.Request();
    let dateParam = req.params.queryStartDate;
    console.log(dateParam);
    // Query against the DB with input parameters and retrieve data
    request
    .input('query_start_date', sql.Date, dateParam)
    .query(query, (err, recordset) => {
      if (err) console.log(err);
      res.send(recordset);
    })
  })

})

let server = app.listen(3000, ()=>{
  console.log('Server Running On Port 3000')
})

// sql.connect(config).then(pool => {
//   // Query
//   return pool.request()
//     .input('query_start_date', sql.Date, '2018-03-09 00:00:00')
//     .query(query)
// }).then(result => {
//   console.dir(result.recordset.length)
//   // process.exit()
// }).catch(err => {
//   // ... error checks
// })

// sql.on('error', err => {
//   // ... error handler
// })