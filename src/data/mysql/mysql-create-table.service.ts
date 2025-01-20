import { Injectable } from "@nestjs/common";
import * as mysql from "mysql2/promise";

@Injectable()
export class MysqlCreateTableService {
   private readonly pool: mysql.Pool;

   constructor() {
      // db 연결 설정
      this.pool = mysql.createPool({
         host: process.env.HOST,
         port: 3306,
         user: process.env.USER,
         password: process.env.PASSWORD,
         database: process.env.DATABASE,
      });
   }

   // db 연결을 사용할 때 필요한 pool 객체만 반환하는 함수
   getPool(): mysql.Pool {
      return this.pool;
   }

   // 사용 가능한 연결을 하나 가져오는 함수
   getConnection() {
      return this.pool.getConnection();
   }

   // 대륙 테이블 생성하는 함수
   async createContinentTable() {
      const sql = `CREATE TABLE IF NOT EXISTS continent(
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(10) NOT NULL
    )`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 국가 테이블 생성하는 함수
   async createCountryTable() {
      const sql = `CREATE TABLE IF NOT EXISTS countries(
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(30) NOT NULL,
       continent_id INT NOT NULL,
       FOREIGN KEY (continent_id) REFERENCES continent (id)  
    )`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 도시 테이블 생성하는 함수
   async createCityTable() {
      const sql = `CREATE TABLE IF NOT EXISTS cities(
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(50) NOT NULL,
       country_id INT NOT NULL,
       FOREIGN KEY (country_id) REFERENCES countries (id)
    )`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 유저 테이블 생성하는 함수
   async createUserTable() {
      const sql = `CREATE TABLE IF NOT EXISTS users( 
       email VARCHAR(150) NOT NULL PRIMARY KEY,
       name VARCHAR(30) NOT NULL,
       image VARCHAR(200) DEFAULT NULL,
       password VARCHAR(100) NOT NULL,
       is_user TINYINT(1) DEFAULT 1,
       withdrawal_date date DEFAULT NULL
    )`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 여행지 테이블 생성하는 함수
   async createDestinationTable() {
      const sql = `CREATE TABLE IF NOT EXISTS destination( 
       id INT PRIMARY KEY,
       name VARCHAR(30) NOT NULL,
       register_date timestamp NOT NULL DEFAULT current_timestamp(),
       address VARCHAR(100) NOT NULL,
       city_id INT NOT NULL,
       FOREIGN KEY (city_id) REFERENCES cities (id)
    )`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 키워드 테이블 생성하는 함수
   async createKeywordTable() {
      const sql = `CREATE TABLE IF NOT EXISTS keyword(
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(20) NOT NULL
    )`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 유저 - 키워드 테이블 생성하는 함수
   async createUserKeywordTable() {
      const sql = `CREATE TABLE IF NOT EXISTS user_keyword(
       user_email VARCHAR(150) NOT NULL,
       keyword_id INT,
       FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE,
       FOREIGN KEY (keyword_id) REFERENCES keyword (id) ON UPDATE CASCADE ON DELETE CASCADE
    )`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 여행지 - 키워드 테이블 생성하는 함수
   async createDestinationKeywordTable() {
      const sql = `CREATE TABLE IF NOT EXISTS destination_keyword(
       destination_id INT NOT NULL,
       keyword_id INT NOT NULL,
       FOREIGN KEY (destination_id) REFERENCES destination (id) ON DELETE CASCADE,
       FOREIGN KEY (keyword_id) REFERENCES keyword (id) ON UPDATE CASCADE ON DELETE CASCADE
    )`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 여행지 - 이미지 테이블 생성하는 함수
   async createDestiantionImageTable() {
      const sql = `CREATE TABLE IF NOT EXISTS destination_image(
       destination_id INT NOT NULL,
       image VARCHAR(200) NOT NULL,
       FOREIGN KEY (destination_id) REFERENCES destination (id) ON DELETE CASCADE
    )`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 카테고리 테이블 생성하는 함수
   async createCategoryTable() {
      const sql = `CREATE TABLE IF NOT EXISTS categories(
         id INT AUTO_INCREMENT PRIMARY KEY,
         name VARCHAR(20) NOT NULL
      )`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 여행지 정보 테이블 생성하는 함수
   async createDestinationInformationTable() {
      const sql = `CREATE TABLE IF NOT EXISTS destination_info(
         id INT NOT NULL PRIMARY KEY,
         summary VARCHAR(50) DEFAULT NULL,
         description VARCHAR(1000) DEFAULT NULL,
         star_point_average DECIMAL(3,2) CHECK (star_point_average >= 0 AND star_point_average <= 5) DEFAULT 0,
         FOREIGN KEY (id) REFERENCES destination (id) ON DELETE CASCADE ON UPDATE CASCADE 
      )`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 예약 테이블 생성하는 함수
   async createReservationTable() {
      const sql = `CREATE TABLE IF NOT EXISTS reservation(
         id VARCHAR(40) NOT NULL PRIMARY KEY,
         user_email VARCHAR(150) NOT NULL,
         destination_id INT NOT NULL,
         date DATETIME NOT NULL,
         reservation_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
         status TINYINT(1) DEFAULT 0,
         FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE ON UPDATE CASCADE,
         FOREIGN KEY (destination_id) REFERENCES destination (id) ON DELETE CASCADE
      )`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 리뷰 테이블 생성하는 함수
   async createReviewTable() {
      const sql = `CREATE TABLE IF NOT EXISTS review(
         id VARCHAR(40) PRIMARY KEY,
         user_email VARCHAR(150) NOT NULL,
         destination_id INT NOT NULL,
         rating DECIMAL(3,2) NOT NULL,
         content VARCHAR(300),
         reservation_id VARCHAR(40) NOT NULL,
         FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE ON UPDATE CASCADE,
         FOREIGN KEY (destination_id) REFERENCES destination (id) ON DELETE CASCADE,
         FOREIGN KEY (reservation_id) REFERENCES reservation (id) ON DELETE CASCADE ON UPDATE CASCADE
         )`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 리뷰 - 이미지 생성하는 함수
   async createReviewImageTable() {
      const sql = `CREATE TABLE IF NOT EXISTS review_image(
         review_id VARCHAR(40) NOT NULL,
         image VARCHAR(200) NOT NULL,
         FOREIGN KEY (review_id) REFERENCES review (id) ON DELETE CASCADE ON UPDATE CASCADE
      )`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 여행지 - 위치(위도, 경도) 테이블 생성하는 함수
   async createDestinationLocationTable() {
      const sql = `CREATE TABLE IF NOT EXISTS destination_location(
         id INT NOT NULL,
         latitude DECIMAL(8, 6) NOT NULL,
         longitude DECIMAL(9, 6) NOT NULL,
         FOREIGN KEY (id) REFERENCES destination (id) ON DELETE CASCADE)`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 매일 자정에 탈퇴한 회원 삭제하기 위한 이벤트 테이블 생성
   async createEventScheduler() {
      const sql = `CREATE EVENT IF NOT EXISTS delete_withdrawal_user ON SCHEDULE EVERY 1 DAY STARTS CURRENT_DATE 
      DO BEGIN SET SQL_SAFE_UPDATES = 0; 
      DELETE FROM users WHERE is_user = 0 and withdrawal_date < CURRENT_DATE; 
      SET SQL_SAFE_UPDATES = 1; 
      END;`;
      const [rows] = await this.pool.query(sql);
      return rows;
   }
}
