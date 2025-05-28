import { ValueType } from "../../types/types";
import { Node } from "../node";

export class EntityNode extends Node {
  type = "entity";

  properties: EntityProperty[] = [];

  parentEntity: EntityNode | null = null;

  childrenEntities: EntityNode[] = [];

  constructor(public name: string, ...properties: EntityProperty[]) {
    super();
    this.properties = [...properties];
  }

  setParent(parent: EntityNode): void {
    this.parentEntity = parent;
  }

  addChild(child: EntityNode): void {
    child.setParent(this);
    this.childrenEntities.push(child);
  }
}

export class EntityProperty {
  constructor(public name: string, public type: ValueType) { }

  options: EntityPropertyOption[] = [];

  setOptions(...options: EntityPropertyOption[]): void {
    this.options = options;
  }
};

type EntityPropertyOption = "required" | "nullable" | "unique";

