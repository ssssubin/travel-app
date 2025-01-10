import { Module } from "@nestjs/common";
import { MainController } from "@main/main.controller";
import { MainService } from "@main/main.service";
import { DataModule } from "@data/data.module";

@Module({
   imports: [DataModule],
   controllers: [MainController],
   providers: [MainService],
   exports: [MainService],
})
export class MainModule {}
