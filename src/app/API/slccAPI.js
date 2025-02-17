const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
app.use(bodyParser.json());
app.use(express.json());


const dbLogin = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'login_db',
});


const slccServiceDB = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'slcc_service',
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});


//check connect DB
dbLogin.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database Login.'); 
  }
});

slccServiceDB.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database slccServiceDB.'); 
  }
});

//check login
app.post('/api/login',(req,res) =>{
  const { username , password } = req.body;
  const query = 'SELECT * FROM user_data WHERE username = ? AND password = ? AND isActive = 1';

  dbLogin.query(query, [username, password], (err,results) => {
    if(err){
      console.log('err',err)
      res.status(500).send('Server error');
    }else{
      if (results.length > 0) {
        const roleID = results[0].role;
        const firstName = results[0].firstName;
        const lastName = results[0].lastName;
        const roleName = results[0].roleName;

        res.json({
          role: roleID,
          firstName: firstName,
          lastName: lastName,
          roleName: roleName
        });
      } else {
        console.log('not have user')
        // res.json
        res.status(401).send('Invalid username or password');
      }
    }
  })
})

// NANAGE-USER PAGE
// insert user
app.post('/api/insertUser', (req, res) => {
  const { firstName, lastName, phoneNumber, position, username, password, role, roleName } = req.body;

  const query = `
    INSERT INTO user_data (firstName, lastName, phoneNumber, position, username, password, role, roleName)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  dbLogin.query(query, [firstName, lastName, phoneNumber, position, username, password, role, roleName], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).send('Server error');
    }
    res.status(200).json({ message: 'Insert successful', result });
  });
});

//show user
app.get('/api/showUser',(req,res) =>{
  const query = 'SELECT * FROM user_data';

  dbLogin.query(query, (err,results) => {
    if(err){
      console.log('err',err)
      res.status(500).send('Server error');
    }else{
        res.json(results);
    }
  })
})

//update isActive
app.post('/api/updateStatus',(req,res) =>{
  const { isActive, userID } = req.body;
  const query = 'UPDATE user_data SET isActive = ?  WHERE userID = ?';
  
  dbLogin.query(query,[ isActive, userID ], (err,results) => {
    if(err){
      console.log('err',err)
      res.status(500).send('Server error');
    }else{
        res.json(results);
    }
  })
})

// MANAGE-LSIT PAGE
  // manageSize
  app.post('/api/manageSize', (req, res) => {
    const { size, sizeID, action, createdBy } = req.body;

    let query;
    let params;
  
    if (action === 'insertSize') {
      query = 'INSERT INTO car_size (sizeName, createdBy, createdAt) VALUES (?, ?, NOW())';
      params = [size, createdBy];
    } else if (action === 'updateSize') {
      query = 'UPDATE car_size SET sizeName = ?, createdBy = ?, createdAt = NOW() WHERE sizeID = ?';
      params = [size, createdBy, sizeID];
    } else if (action === 'deleteSize') {
      query = 'UPDATE car_size SET isActive = 0, createdBy = ?, createdAt = NOW() WHERE sizeID = ?';
      params = [createdBy, sizeID];
    } else {
      return res.status(400).send('Invalid action');
    }
  
    slccServiceDB.query(query, params, (err, results) => {
      if (err) {
        console.error('Error managing size:', err);
        return res.status(500).send('Server error');
      }
  
      console.log(`${action} successful`);
      res.json(results);
    });
  });

  // manageList
  app.post('/api/manageList', (req, res) => {
    const { list, listID, action, createdBy } = req.body;

    let query;
    let params;
  
    if (action === 'insertList') {
      query = 'INSERT INTO car_list (listName, createdBy, createdAt) VALUES (?, ?, NOW())';
      params = [list, createdBy];
    } else if (action === 'updateList') {
      query = 'UPDATE car_list SET listName = ?, createdBy = ?, createdAt = NOW() WHERE listID = ?';
      params = [list, createdBy, listID];
    } else if (action === 'deleteList') {
      query = 'UPDATE car_list SET isActive = 0, createdBy = ?, createdAt = NOW() WHERE listID = ?';
      params = [createdBy, listID];
    } else {
      return res.status(400).send('Invalid action');
    }
  
    slccServiceDB.query(query, params, (err, results) => {
      if (err) {
        console.error('Error managing list:', err);
        return res.status(500).send('Server error');
      }
  
      console.log(`${action} successful`);
      res.json(results);
    });
  });

  // manageCarType
  app.post('/api/manageCarType',(req,res) =>{
    const { type, typeID, action, createdBy } = req.body;

    let query;
    let params;
  
    if (action === 'insertType') {
      query = 'INSERT INTO car_type (typeName, createdBy, createdAt) VALUES (?, ?, NOW())';
      params = [type, createdBy];
    } else if (action === 'updateType') {
      query = 'UPDATE car_type SET typeName = ?, createdBy = ?, createdAt = NOW() WHERE typeID = ?';
      params = [type, createdBy, typeID];
    } else if (action === 'deleteType') {
      query = 'UPDATE car_type SET isActive = 0, createdBy = ?, createdAt = NOW() WHERE typeID = ?';
      params = [createdBy, typeID];
    } else {
      return res.status(400).send('Invalid action');
    }
  
    slccServiceDB.query(query, params, (err, results) => {
      if (err) {
        console.error('Error managing type:', err);
        return res.status(500).send('Server error');
      }
  
      console.log(`${action} successful`);
      res.json(results);
    });
  })

  // manageCarBrand
  app.post('/api/manageCarBrand',(req,res) =>{
    const { brand, brandID, action, createdBy } = req.body;

    let query;
    let params;
  
    if (action === 'insertBrand') {
      query = 'INSERT INTO car_brand (brandName, createdBy, createdAt) VALUES (?, ?, NOW())';
      params = [brand, createdBy];
    } else if (action === 'updateBrand') {
      query = 'UPDATE car_brand SET brandName = ?, createdBy = ?, createdAt = NOW() WHERE brandID = ?';
      params = [brand, createdBy, brandID];
    } else if (action === 'deleteBrand') {
      query = 'UPDATE car_brand SET isActive = 0, createdBy = ?, createdAt = NOW() WHERE brandID = ?';
      params = [createdBy, brandID];
    } else {
      return res.status(400).send('Invalid action');
    }
  
    slccServiceDB.query(query, params, (err, results) => {
      if (err) {
        console.error('Error managing brand:', err);
        return res.status(500).send('Server error');
      }
  
      console.log(`${action} successful`);
      res.json(results);
    });
  })

  // show list, price  //Call ยกเลิก
  app.get('/api/showList', async (req, res) => {
    try {
      const sizeListPrices = [];
  
      // ดึงข้อมูล size
      const sizes = await new Promise((resolve, reject) => {
        slccServiceDB.query('SELECT sizeID, sizeName FROM car_size WHERE isActive = 1', (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
  
      // ดึงข้อมูล list
      const lists = await new Promise((resolve, reject) => {
        slccServiceDB.query('SELECT listID, listName FROM car_list WHERE isActive = 1', (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
  
      // วนลูปตาม size และ list
      for (const size of sizes) {
        for (const list of lists) {
          const priceData = await new Promise((resolve, reject) => {
            slccServiceDB.query(
              `SELECT * FROM car_price WHERE isActive = 1 AND sizeID = ? AND listID = ?`,
              [size.sizeID, list.listID],
              (err, results) => {
                if (err) reject(err);
                else resolve(results[0]); // ตรวจสอบว่ามีผลลัพธ์หรือไม่
                console.log('showResult',results[0])
              }
            );
          });
  
          // หากไม่มีข้อมูล ให้ตั้ง price เป็น 0
          sizeListPrices.push({
            priceID: priceData?.priceID || null, // ถ้าไม่มีข้อมูล ตั้งค่าเป็น null
            sizeID: size.sizeID,
            sizeName: size.sizeName,
            listID: list.listID,
            listName: list.listName,
            price: priceData?.price || 0, // ถ้าไม่มีข้อมูล ตั้งค่าเป็น 0
          });
        }
      }
  
      // ส่งข้อมูลกลับไปยัง client
      res.json(sizeListPrices);
      console.log('showPrice',sizeListPrices);
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'An error occurred while fetching data' });
    }
  });
  
  // update price
  app.post('/api/updateDataPrice',(req,res) =>{
    const { updateDataPrice, priceID, createdBy } = req.body;
    const query = 'update car_price SET price = ?, updatedBy = ?, updatedAt = NOW() WHERE priceID = ?';

    slccServiceDB.query(query, [updateDataPrice, createdBy, priceID ], (err,results) => {
      if(err){
        console.log('err',err)
        res.status(500).send('Server error');
      }else{
        console.log('success update data price')
        res.json(results)
        
      }
    })
  })

  // insert Price
  app.post('/api/insertDataPrice',(req,res) =>{
    const { sizeID, listID, updateDataPrice, createdBy} = req.body;
    const query = 'INSERT INTO car_price (sizeID, listID, price, updatedBy, updatedAt) VALUES (?,?,?,?,NOW())';

    slccServiceDB.query(query, [sizeID, listID, updateDataPrice, createdBy], (err,results) => {
      if(err){
        console.log('err',err)
        res.status(500).send('Server error');
      }else{
        console.log('success INSERT data price')
        res.json(results)
        
      }
    })
  })

  //show list price //CALlยกเลิก
  app.post('/api/getPrice', (req, res) => {
    const { sizeID, serviceID } = req.body;

    const promises = serviceID.map(serviceID => {
      return new Promise((resolve, reject) => {
        slccServiceDB.query(`SELECT * FROM car_price WHERE isActive = 1 AND sizeID = ? AND listID = ?`,
          [sizeID, serviceID],
          (err, results) => {
            if (err) reject(err);
            else
            resolve(results[0]?.price || 0); // ส่งคืนราคาของแต่ละรายการ
          }
        );
      });
    });

    Promise.all(promises)
      .then(prices => {
        // ส่งค่าราคาของแต่ละรายการกลับไป
        res.json({ prices });
      })
      .catch(error => {
        console.error('Error fetching prices:', error);
        res.status(500).json({ error: 'Failed to fetch prices' });
      });
  });


  // MANAGE-SERVICE PAGE
  // show carBrand
  app.get('/api/carBrand',(req,res) =>{
    const query = 'SELECT * FROM car_brand WHERE isActive = 1';

    slccServiceDB.query(query, (err,results) => {
      if(err){
        console.log('err',err)
        res.status(500).send('Server error');
      }else{
          res.json(results);
      }
    })
  })

  // show carType
  app.get('/api/carType',(req,res) =>{
    const query = 'SELECT * FROM car_type WHERE isActive = 1';

    slccServiceDB.query(query, (err,results) => {
      if(err){
        console.log('err',err)
        res.status(500).send('Server error');
      }else{
          res.json(results);
      }
    })
  })

  app.get('/api/carSize',(req,res) =>{
    const query = 'SELECT * FROM car_size WHERE isActive = 1';

    slccServiceDB.query(query, (err,results) => {
      if(err){
        console.log('err',err)
        res.status(500).send('Server error');
      }else{
          res.json(results);
      }
    })
  })

  // show carService
  app.get('/api/carService',(req,res) =>{
    const query = 'SELECT * FROM car_list WHERE isActive = 1';

    slccServiceDB.query(query, (err,results) => {
      if(err){
        console.log('err',err)
        res.status(500).send('Server error');
      }else{
          res.json(results);
      }
    })
  })

  // add customer
  app.post('/api/insertCustomer',(req,res) =>{
    const { typeID , brandID, customerName, customerCarNo, customerPhone, createdBy } = req.body;
    const query = `
    INSERT INTO customer ( typeID, brandID, customerName, customerCarNo, customerPhone, createdBy, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, NOW());
  `;

  slccServiceDB.query(query, [typeID, brandID, customerName, customerCarNo, customerPhone, createdBy], (err,results) => {
      if(err){
        console.log('err',err)
        res.status(500).send('Server error');
      }else{
        res.status(201).json({
          message: 'Insert successful',
          customerID: results.insertId, // รับค่าจาก Auto Increment
        });
        
      }
    })
  });

  // add report 
  app.post('/api/insertReport',(req,res) =>{
    const { customerID , sumPrice, sizeName, comment, createdBy } = req.body;
    const query = `
    INSERT INTO report ( customerID, sumPrice, sizeName, comment, createdBy, createdAt)
    VALUES (?, ?, ?, ?, ?, NOW());
  `;

  slccServiceDB.query(query, [customerID, sumPrice, sizeName, comment, createdBy], (err,results) => {
      if(err){
        console.log('err',err)
        res.status(500).send('Server error');
      }else{
        res.status(201).json({
          message: 'Insert successful',
          reportID: results.insertId, // รับค่าจาก Auto Increment
        });
        
      }
    })
  });

  // add report service of report
  app.post('/api/insertReportService', (req, res) => {
    const { reportID, services } = req.body;
  
    // ตรวจสอบข้อมูลที่ส่งมา
    if (!reportID || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ message: 'Missing or invalid required fields' });
    }
  
    // สร้างคำสั่ง SQL สำหรับเพิ่มข้อมูล
    const query = 'INSERT INTO report_service (reportID, serviceName, price) VALUES ?';
  
    // เตรียมข้อมูลสำหรับการ bind
    const values = services.map(service => [reportID, service.name, service.price]);
    
  
    // เพิ่มข้อมูลลงในฐานข้อมูล
    slccServiceDB.query(query, [values], (err, results) => {
      if (err) {
        console.error('Error inserting reportService:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      console.log('Data inserted into reportService successfully');
      return res.status(201).json({ message: 'Insert successful', results });
    });
  });

  // OPERATION PAGE
  //show data
  app.get('/api/operationData', (req, res) => {
    let query;
  
      query = `
        SELECT 
          r.reportID, 
          r.operationID, 
          r.customerID, 
          r.sizeName, 
          r.sumPrice, 
          r.comment,
          DATE_FORMAT(r.createdAt, '%Y-%m-%d %H:%i:%s') AS date,
          r.createdBy,
          rs.reportServiceID, 
          rs.serviceName, 
          rs.price, 
          o.operationName, 
          c.customerName, 
          c.customerCarNo, 
          c.customerPhone, 
          ct.typeName, 
          cb.brandName 
        FROM report r 
        LEFT JOIN report_service rs ON r.reportID = rs.reportID 
        INNER JOIN operation_status o ON r.operationID = o.operationID
        INNER JOIN customer c ON r.customerID = c.customerID
        LEFT JOIN car_type ct ON c.typeID = ct.typeID
        LEFT JOIN car_brand cb ON c.brandID = cb.brandID
        ORDER BY date DESC; 
      `;

  
    slccServiceDB.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching reports:', err);
        return res.status(500).send('Server error');
      }
  
      // จัดกลุ่มข้อมูลตาม reportID
      const groupedReports = results.reduce((acc, row) => {
        const {
          reportID, 
          date,
          operationID, 
          customerID, 
          sizeName, 
          sumPrice, 
          comment,
          createdAt,
          createdBy,
          reportServiceID, 
          serviceName, 
          price, 
          operationName, 
          customerName, 
          customerCarNo, 
          customerPhone, 
          typeName, 
          brandName
        } = row;
  
        // ตรวจสอบว่า acc มี reportID นี้หรือยัง
        if (!acc[reportID]) {
          acc[reportID] = {
            reportID, 
            date,
            operationID, 
            customerID, 
            sizeName, 
            sumPrice, 
            comment,
            createdAt,
            createdBy,
            reportServiceID, 
            price, 
            operationName, 
            customerName, 
            customerCarNo, 
            customerPhone, 
            typeName, 
            brandName,
            services: [] // สร้าง array สำหรับเก็บ service
          };
        }
  
        // ถ้ามี service ให้เพิ่มลงใน services
        if (serviceName !== null && serviceName !== undefined) {
          acc[reportID].services.push({ serviceName, price: price || 0 });
        }
  
        return acc;
      }, {});
  
      // ส่ง response เป็น array
      res.status(200).json(Object.values(groupedReports));
    });
  });

  // updateOperation
  app.post('/api/updateOperation',(req,res) =>{
    const { operation, createdBy, reportID } = req.body;
    console.log(operation)

    let query;

    if (operation === 4) {
       query = 'UPDATE report SET operationID = ?, updatedBy = ?, updatedAt = NOW(), isActive = 0 WHERE reportID = ?';
    } else {
       query = 'UPDATE report SET operationID = ?, updatedBy = ?, updatedAt = NOW() WHERE reportID = ?';
    }

    
    slccServiceDB.query(query, [operation, createdBy, reportID], (err,results) => {
      if(err){
        console.log('err',err)
        res.status(500).send('Server error');
      }else{
        console.log('success update data operation')
        res.json(results)
        
      }
    })

  })


  // REPORT PAGE
  // select Year
  app.get('/api/getYears', (req, res) => {
    const query = `
      SELECT DISTINCT YEAR(createdAt) AS year
      FROM report
      ORDER BY year DESC;
    `;
  
    slccServiceDB.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching years:', err);
        res.status(500).send('Server error');
      } else {
        const years = results.map(row => row.year);
        res.status(200).json(years);
      }
    });
  });

  //get data by year
  app.get('/api/getReports', (req, res) => {
    const { year, month } = req.query;
    let query;
    const params = [];
  
    if (year && year !== '0' && month && month !== '0') {
      // กรองข้อมูลตามปีและเดือน
      query = `
        SELECT 
          r.reportID, 
          r.operationID, 
          r.customerID, 
          r.sizeName, 
          r.sumPrice, 
          r.comment,
          DATE_FORMAT(r.createdAt, '%Y-%m-%d') AS date,
          r.createdBy,
          rs.reportServiceID, 
          rs.serviceName, 
          rs.price, 
          o.operationName, 
          c.customerName, 
          c.customerCarNo, 
          c.customerPhone, 
          ct.typeName, 
          cb.brandName 
        FROM report r 
        LEFT JOIN report_service rs ON r.reportID = rs.reportID 
        INNER JOIN operation_status o ON r.operationID = o.operationID
        INNER JOIN customer c ON r.customerID = c.customerID
        LEFT JOIN car_type ct ON c.typeID = ct.typeID
        LEFT JOIN car_brand cb ON c.brandID = cb.brandID
        WHERE r.isActive = 1 AND YEAR(r.createdAt) = ? AND MONTH(r.createdAt) = ?;
        
      `;
      params.push(year); // แปลง พ.ศ. เป็น ค.ศ.
      params.push(month); // เพิ่มเดือนเป็นพารามิเตอร์
    } else if (year && year !== '0') {
      // กรองข้อมูลตามปี
      query = `
        SELECT 
          r.reportID, 
          r.operationID, 
          r.customerID, 
          r.sizeName, 
          r.sumPrice, 
          r.comment,
          DATE_FORMAT(r.createdAt, '%Y-%m-%d') AS date,
          r.createdBy,
          rs.reportServiceID, 
          rs.serviceName, 
          rs.price, 
          o.operationName, 
          c.customerName, 
          c.customerCarNo, 
          c.customerPhone, 
          ct.typeName, 
          cb.brandName 
        FROM report r 
        LEFT JOIN report_service rs ON r.reportID = rs.reportID 
        INNER JOIN operation_status o ON r.operationID = o.operationID
        INNER JOIN customer c ON r.customerID = c.customerID
        LEFT JOIN car_type ct ON c.typeID = ct.typeID
        LEFT JOIN car_brand cb ON c.brandID = cb.brandID
        WHERE r.isActive = 1 AND YEAR(r.createdAt) = ? ;
      `;
      params.push(year); // แปลง พ.ศ. เป็น ค.ศ. 
    } else {
      // ดึงข้อมูลทั้งหมด
      query = `
        SELECT 
          r.reportID, 
          r.operationID, 
          r.customerID, 
          r.sizeName, 
          r.sumPrice, 
          r.comment,
          DATE_FORMAT(r.createdAt, '%Y-%m-%d') AS date,
          r.createdBy,
          rs.reportServiceID, 
          rs.serviceName, 
          rs.price, 
          o.operationName, 
          c.customerName, 
          c.customerCarNo, 
          c.customerPhone, 
          ct.typeName, 
          cb.brandName 
        FROM report r 
        LEFT JOIN report_service rs ON r.reportID = rs.reportID 
        INNER JOIN operation_status o ON r.operationID = o.operationID
        INNER JOIN customer c ON r.customerID = c.customerID
        LEFT JOIN car_type ct ON c.typeID = ct.typeID
        LEFT JOIN car_brand cb ON c.brandID = cb.brandID
        WHERE r.isActive = 1; 
      `;
    }
  
    slccServiceDB.query(query, params, (err, results) => {
      if (err) {
        console.error('Error fetching reports:', err);
        return res.status(500).send('Server error');
      }
  
      // จัดกลุ่มข้อมูลตาม reportID
      const groupedReports = results.reduce((acc, row) => {
        const {
          reportID, 
          date,
          operationID, 
          customerID, 
          sizeName, 
          sumPrice, 
          comment,
          createdAt,
          createdBy,
          reportServiceID, 
          serviceName, 
          price, 
          operationName, 
          customerName, 
          customerCarNo, 
          customerPhone, 
          typeName, 
          brandName
        } = row;
  
        // ตรวจสอบว่า acc มี reportID นี้หรือยัง
        if (!acc[reportID]) {
          acc[reportID] = {
            reportID, 
            date,
            operationID, 
            customerID, 
            sizeName, 
            sumPrice, 
            comment,
            createdAt,
            createdBy,
            reportServiceID, 
            price, 
            operationName, 
            customerName, 
            customerCarNo, 
            customerPhone, 
            typeName, 
            brandName,
            services: [] // สร้าง array สำหรับเก็บ service
          };
        }
  
        // ถ้ามี service ให้เพิ่มลงใน services
        if (serviceName !== null && serviceName !== undefined) {
          acc[reportID].services.push({ serviceName, price: price || 0 });
        }
  
        return acc;
      }, {});
  
      // ส่ง response เป็น array
      res.status(200).json(Object.values(groupedReports));
    });
  });