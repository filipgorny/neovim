import { Method } from "./method";

export abstract class EndpointNode {
  type = "rest-api-endpoint";
  abstract method: Method;

  constructor(public path: string) { }
}

export class InsertEndpointNode extends EndpointNode {
  method: Method = "post";

  constructor(path: string) {
    super(path);
  }
}
