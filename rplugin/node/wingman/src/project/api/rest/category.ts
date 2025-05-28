import { EntityNode } from "../../node/schema/entity.node";

export class RestApiCategory {
  type = "rest-api-category";

  constructor(
    public path: string,
    public entity: EntityNode
  ) { }
}
