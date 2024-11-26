import { Injectable } from "@nestjs/common";
import * as mysql from "mysql2/promise";

@Injectable()
export class MysqlCreateTableService {
   private readonly pool: mysql.Pool;

   constructor() {
      // db 연결 설정
      this.pool = mysql.createPool({
         host: "127.0.0.1",
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
       password VARCHAR(100) NOT NULL,
       city_id INT NOT NULL,
       FOREIGN KEY (city_id) REFERENCES cities (id)
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
       keyword_id INT NOT NULL,
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
         id VARCHAR(150) NOT NULL,
         destination_id INT NOT NULL,
         date DATETIME NOT NULL,
         reservation_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
         status TINYINT(1) DEFAULT 0,
         FOREIGN KEY (id) REFERENCES users (email) ON DELETE CASCADE ON UPDATE CASCADE,
         FOREIGN KEY (destination_id) REFERENCES destination (id) ON DELETE CASCADE
      )`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 리뷰 테이블 생성하는 함수
   async createReviewTable() {
      const sql = `CREATE TABLE IF NOT EXISTS review(
         user_email VARCHAR(150) NOT NULL,
         destination_id INT NOT NULL,
         content VARCHAR(300),
         FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE ON UPDATE CASCADE,
         FOREIGN KEY (destination_id) REFERENCES destination (id) ON DELETE CASCADE
      )`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }
}
