import { DtoProperty } from "../../node/dto/dto.node";
import { Validation } from "../validation/validate";

export class Payload extends Node {
  type = "rest-api-payload";

  constructor(public dto: DtoProperty, public validation: Validation) {
    super();
  }
}
