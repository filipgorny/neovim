import { z } from "zod";
import { Writer } from "../writer";

export const createEntity: Writer = {
	name: "createEntity",
	description: "Write body of a TypeORM entity class",
	parameters: z.object({
		entityName: z.string().describe("The name of the entity to create"),
		fields: z
			.array(
				z.object({
					fieldName: z.string().describe("The name of the field"),
					fieldType: z
						.enum(["string", "number"])
						.describe("The type of the field"),
				}),
			)
			.describe("The fields of the entity"),
	}),
	code: async ({ entityName, fields }) => {
		let code = `import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'`;
		code += `\n\n@Entity('${entityName}')`;
		code += `\nexport class ${entityName} {`;
		code += `\n\t@PrimaryGeneratedColumn()`;
		code += `\n\tid: number;`;
		fields.forEach((field) => {
			code += `\n\t@Column()`;
			code += `\n\t${field.fieldName}: ${field.fieldType};`;
		});
		code += `\n}`;

		return code;
	},
};
