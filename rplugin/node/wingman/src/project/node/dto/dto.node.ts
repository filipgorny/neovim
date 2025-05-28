import { ValueType } from "../../types/types";
import { Node } from "../node";
import { EntityNode } from "../schema/entity.node";

export class DtoNode extends Node {
  type = "dto";

  properties: DtoProperty[] = [];

  constructor(public name: string, ...properties: DtoProperty[]) {
    super();
    this.properties = [...properties];
  }
}

export class EntityDtoNode<T extends EntityNode> extends DtoNode {
  type = "entity-dto";

  constructor(
    public entity: T,
  ) {
    super(entity.name, ...entity.properties.map(p => new DtoProperty(p.name, p.type)));
  }

  getEntity(): T {
    return this.entity;
  }
}

export class DtoProperty {
  constructor(public name: string, public type: ValueType) { }
}
