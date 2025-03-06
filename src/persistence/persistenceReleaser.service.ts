import { Injectable } from "@nestjs/common";
import { Models } from "./constants";

@Injectable()
export class PersistenceReleaserService{
    async releaseResources(models: Models){
        await models.sequelize.close();
    }
}