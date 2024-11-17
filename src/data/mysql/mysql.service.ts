import { Injectable } from "@nestjs/common";
import * as mysql from "mysql2/promise";
import { MysqlCreateTableService } from "./mysql-create-table.service";

@Injectable()
export class MysqlService {
   private readonly pool: mysql.Pool;

   constructor(private tableCreateService: MysqlCreateTableService) {
      this.pool = this.tableCreateService.getPool();
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

   // 여행지 id로 이미지 조회하는 함수
   async findImageByDestinationId(id: number) {
      const sql = `SELECT image FROM destination_image WHERE destination_id = "${id}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 여행지 id로 키워드 id 조회하는 함수
   async findKeywordIdByDestinationId(id: number) {
      const sql = `SELECT keyword_id FROM destination_keyword WHERE destination_id = "${id}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 이메일 중복 체크하는 함수
   async isDuplicateEmail(email: string) {
      const sql = `SELECT COUNT(*) as count FROM users WHERE email = "${email}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 대륙 이름으로 존재 여부 확인하는 함수
   async isContinent(name: string) {
      const sql = `SELECT COUNT(*) as count FROM continent WHERE name = "${name}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 국가 이름으로 존재 여부 확인하는 함수
   async isCountry(name: string) {
      const sql = `SELECT COUNT(*) as count FROM countries WHERE name = "${name}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 도시 이름으로 도시 id 조회하는 함수
   async findCityIdByName(name: string) {
      const sql = `SELECT id FROM cities WHERE name = "${name}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 도시 id로 여행지 조회
   async findDefinitionByCityId(id: number) {
      const sql = `SELECT id, name, address FROM destination WHERE city_id = "${id}" `;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 유저 등록하는 함수
   async registerUser(email: string, name: string, password: string, cityId: number) {
      const sql = `INSERT INTO users VALUES ("${email}", "${name}", "${password}", ${cityId})`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 이메일로 유저 정보 조회하는 함수
   async findUserByEmail(email: string) {
      const sql = `SELECT * FROM users WHERE email = "${email}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }
}
