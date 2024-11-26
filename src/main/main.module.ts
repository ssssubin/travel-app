import { Module } from "@nestjs/common";
import { MainController } from "./main.controller";
import { MainService } from "./main.service";
import { DataModule } from "src/data/data.module";

@Module({
   imports: [DataModule],
   controllers: [MainController],
   providers: [MainService],
   exports: [MainService],
})
export class MainModule {}
