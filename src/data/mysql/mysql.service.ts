import { Injectable } from "@nestjs/common";
import * as mysql from "mysql2/promise";

@Injectable()
export class MysqlService {
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

   // 키워드 이름으로 키워드 id 조회하는 함수
   async findKeywordIdByName(keyword: string) {
      const sql = `SELECT id FROM keyword WHERE name = "${keyword}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 키워드 id로 키워드 이름 조회하는 함수
   async findKeywordNameById(id: number) {
      const sql = `SELECT name FROM keyword WHERE id = "${id}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 여행지 id로 여행지 조회하는 함수
   async findDestinationById(id: number) {
      const sql = `SELECT name, address, image, city_id FROM destination WHERE id = "${id}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 키워드 id로 여행지 id 조회하는 함수
   async findDestinationByKeywordId(id: number) {
      const sql = `SELECT destination_id FROM destination_keyword WHERE keyword_id = "${id}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 도시 id로 국가, 도시 조회하는 함수
   async findRegionByCityId(id: number) {
      const sql = `SELECT co.name as country, ci.name as city FROM cities as ci JOIN countries as co ON ci.country_id = co.id and ci.country_id = "${id}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }
}
