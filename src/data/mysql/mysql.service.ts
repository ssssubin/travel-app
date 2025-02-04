import { Injectable } from "@nestjs/common";
import * as mysql from "mysql2/promise";
import { MysqlCreateTableService } from "@data/mysql/mysql-create-table.service";

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
      const sql = `SELECT name, address, city_id FROM destination WHERE id = "${id}"`;
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
      const sql = `SELECT co.name as country, ci.name as city FROM cities as ci JOIN countries as co ON ci.country_id = co.id AND ci.country_id = "${id}"`;
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
   async findDestinationByCityId(id: number, page: number, reqPerPage: number) {
      const sql = `SELECT id, name, address FROM destination WHERE city_id = "${id}" LIMIT ${reqPerPage * (page - 1)}, ${reqPerPage} `;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 유저 등록하는 함수
   async registerUser(email: string, name: string, password: string) {
      const sql = `INSERT INTO users (email, name, password) VALUES ("${email}", "${name}", "${password}")`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 유저 - 키워드 초기화
   async initializationKeyword(email: string) {
      const sql = `INSERT INTO user_keyword VALUES("${email}", null), ("${email}", null), ("${email}", null),("${email}", null),("${email}", null)`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 이메일로 유저 정보 조회하는 함수
   async findUserByEmail(email: string) {
      const sql = `SELECT email, name, image, password, is_user FROM users WHERE email = "${email}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // db에 저장된 여행지 개수 조회하는 함수
   async findNumberOfDestinations() {
      const sql = `SELECT COUNT(*) as count FROM destination`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 도시 id로 도시 이름, 국가 id 조회하는 함수
   async findCityById(id: number) {
      const sql = `SELECT name, country_id FROM cities WHERE id = "${id}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 여행지 id로 여행지 별점 조회하는 함수
   async findDestinationInformationById(id: number) {
      const sql = `SELECT star_point_average FROM destination_info WHERE id = "${id}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 전체 대륙 이름 조회하는 함수
   async findAllContinentName() {
      const sql = `SELECT name FROM continent`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 대륙 이름으로 대륙 id 조회하는 함수
   async findContinentIdByName(name: string) {
      const sql = `SELECT id FROM continent WHERE name = "${name}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 대륙 id로 국가 이름 조회하는 함수
   async findCountryNameByContinentId(id: number) {
      const sql = `SELECT name FROM countries WHERE continent_id = "${id}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 국가 이름으로 국가 id 조회하는 함수
   async findCountryIdByName(name: string) {
      const sql = `SELECT id FROM countries WHERE name = "${name}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 국가 id로 도시 이름 조회하는 함수
   async findCityNameByCountryId(id: number) {
      const sql = `SELECT name FROM cities WHERE country_id = "${id}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 유저 이메일로 예약 정보 조회하는 함수
   async findReservationByUserEmail(email: string) {
      const sql = `SELECT id, destination_id, DATE_FORMAT(date, "%m월 %d일 %H:%i") as format_date, SUBSTR(_UTF8'일월화수목금토', DAYOFWEEK(date), 1) as day FROM reservation WHERE user_email = "${email}" AND status = 0 ORDER BY reservation_time DESC`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 유저 이메일로 방문한 여행지 조회하는 함수
   async findVisitedDestinationByUserEmail(email: string) {
      const sql = `SELECT res.id, res.destination_id, DATE_FORMAT(res.date, "%m월 %d일") as format_date, SUBSTR(_UTF8'일월화수목금토', DAYOFWEEK(res.date), 1) as day, rev.content as content FROM review as rev RIGHT JOIN reservation as res ON rev.user_email = res.id AND rev.destination_id = res.destination_id WHERE res.status = 1 AND res.id = "${email}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 유저 이메일로 방문한 여행지 수 조회하는 함수
   async countVisitedDestinationByUserEmail(email: string) {
      const sql = `SELECT COUNT(destination_id) as count FROM reservation WHERE user_email = "${email}" AND status = 1`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 유저 이메일로 유저가 리뷰를 작성한 여행지 조회하는 함수
   async findReviewByUserEmail(email: string) {
      const sql = `SELECT id, destination_id, rating, content, reservation_id FROM review WHERE user_email = "${email}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 유저 이메일로 유저가 선택한 키워드 id 조회하는 함수
   async findKeywordIdByUserEmail(email: string) {
      const sql = `SELECT keyword_id FROM user_keyword WHERE user_email = "${email}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 국가 id로 대륙 이름, 국가 이름 조회하는 함수
   async findContinentAndCountryNameByCountryId(id: number) {
      const sql = `SELECT cou.name as country_name, con.name as continent_name FROM countries as cou JOIN continent as con ON cou.continent_id = con.id WHERE cou.id = ${id}`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 유저 - 키워드 삭제하는 함수
   async deleteUserKeyword(email: string) {
      const sql = `DELETE FROM user_keyword WHERE user_email = "${email}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 유저가 선택한 키워드 업데이트 하는 함수
   async updateUserKeyword(email: string, keyword: number) {
      const sql = `INSERT INTO user_keyword VALUES("${email}", ${keyword})`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 유저 정보 업데이트 하는 함수
   async updateUser(email: string, name: string, image: string | null) {
      const sql = `UPDATE users SET name = "${name}", image = "${image}" WHERE email = "${email}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 유저가 검색한 내용을 가진 여행지 id를 조회하는 함수
   async findDestinationBySearch(search: string) {
      const sql = `SELECT id FROM destination WHERE name LIKE "%${search}%" OR address LIKE "%${search}%"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 전체 키워드 조회하는 함수
   async getKeyword() {
      const sql = `SELECT * FROM keyword`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 여행지 id로 도시 id 조회하는 함수
   async findCityIdByDestinationId(id: number) {
      const sql = `SELECT city_id FROM destination WHERE id = ${id}`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 여행지 이름으로 여행지 조회하는 함수
   async findDestinationByName(name: string) {
      const sql = `SELECT id FROM destination WHERE name = "${name}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 예약 id로 예약한 여행지 조회
   async findResevationById(id: string) {
      const sql = `SELECT user_email, destination_id, DATE_FORMAT(date, "%m월 %d일 %H:%i") as format_date, SUBSTR(_UTF8'일월화수목금토', DAYOFWEEK(date), 1) as day, status FROM reservation WHERE id = "${id}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 리뷰 생성하는 함수
   async createReview(
      id: string,
      email: string,
      destinationId: number,
      rating: number,
      content: string,
      reservationId: string,
   ) {
      const sql = `INSERT INTO review VALUES("${id}", "${email}", ${destinationId}, ${rating}, "${content}", "${reservationId}")`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 예약한 여행지 방문했을 경우 status 업데이트 하는 함수
   async updateReservation(id: string) {
      const sql = `UPDATE reservation SET status = 1 WHERE id = "${id}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 리뷰 - 이미지 등록하는 함수
   async registerReviewImage(reviewId: string, image: string) {
      const sql = `INSERT INTO review_image VALUES ("${reviewId}", "${image}")`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 리뷰 id로 리뷰 존재 여부 확인하는 함수
   async isReviewByReviewId(reviewId: string) {
      const sql = `SELECT COUNT(*) as count FROM review WHERE id = "${reviewId}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 리뷰 id로 리뷰 조회하는 함수
   async findReviewByReviewId(reviewId: string) {
      const sql = `SELECT user_email, destination_id FROM review WHERE id = "${reviewId}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 리뷰 id로 리뷰 이미지 조회하는 함수
   async findReviewImageByReviewId(reviewId: string) {
      const sql = `SELECT image FROM review_image WHERE review_id = "${reviewId}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 리뷰 id로 리뷰 이미지 삭제하는 함수
   async deleteReviewImageByReviewId(reviewId: string) {
      const sql = `DELETE FROM review_image WHERE review_id = "${reviewId}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 리뷰 수정하는 함수
   async updateReviewByReviewId(reviewId: string, rating: number, content: string) {
      const sql = `UPDATE review SET rating = ${rating}, content = "${content}" WHERE id = "${reviewId}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 리뷰 id로 리뷰 삭제하는 함수
   async deleteReviewByReviewId(reviewId: string) {
      const sql = `DELETE FROM review WHERE id = "${reviewId}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 위도, 경도로 반경 2km 이내 여행지 id 조회하는 함수
   async findDestinationByGps(latitude: number, longitude: number) {
      const sql = `SELECT id FROM destination_location WHERE SQRT(POWER(ABS(${latitude} - latitude), 2)+POWER(ABS(${longitude}-longitude), 2)) <= 0.02`;
      const [rows] = await this.pool.execute(sql);
      return rows;
   }

   // 쿼리 실행하는 함수
   async query(sql: string, params: any[] = []) {
      // 쿼리문 실행하고 결과 반환
      const [rows] = await this.pool.execute(sql, params);
      return rows;
   }
}
