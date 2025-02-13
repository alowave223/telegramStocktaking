import { Database } from "sqlite";
import { TableTypes } from "../dto";

type DatabaseEntity<T> = T & { rowid: number };

class DatabaseController<T extends keyof TableTypes> {
  constructor(private db: Database, private tableName: string) {}

  async insertRow(data: TableTypes[T]): Promise<DatabaseEntity<TableTypes[T]>> {
    const columns = Object.keys(data).join(", ");
    const placeholders = Object.keys(data).fill("?").join(", ");

    const sql = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
    const result = await this.db.run(sql, Object.values(data));

    if (result.lastID) {
      const createdRow = await this.getRowById(result.lastID);
      return createdRow!;
    }
    throw new Error("Failed to insert row.");
  }

  async getAllRows(): Promise<DatabaseEntity<TableTypes[T]>[]> {
    const sql = `SELECT rowid, * FROM ${this.tableName}`;
    const rows = await this.db.all<DatabaseEntity<TableTypes[T]>[]>(sql);

    if (!rows || rows.length === 0) {
      return [];
    }

    return rows;
  }

  async getMany(
    filters: Partial<DatabaseEntity<TableTypes[T]>> = {},
    options: {
      limit?: number;
      offset?: number;
      orderBy?: {
        column: keyof DatabaseEntity<TableTypes[T]>;
        direction: "ASC" | "DESC";
      };
    } = {}
  ): Promise<DatabaseEntity<TableTypes[T]>[]> {
    let sql = `SELECT rowid, * FROM ${this.tableName}`;

    const filterEntries = Object.entries(filters);
    const filterParams: unknown[] = [];
    if (filterEntries.length > 0) {
      const whereClause = filterEntries
        .map(([key]) => `${key} = ?`)
        .join(" AND ");
      sql += ` WHERE ${whereClause}`;
      filterParams.push(...filterEntries.map(([, value]) => value));
    }

    if (options.orderBy) {
      const { column, direction } = options.orderBy;
      sql += ` ORDER BY ${String(column)} ${direction}`;
    }

    if (options.limit !== undefined) {
      sql += ` LIMIT ?`;
      filterParams.push(options.limit);
    }
    if (options.offset !== undefined) {
      sql += ` OFFSET ?`;
      filterParams.push(options.offset);
    }

    const rows = await this.db.all<DatabaseEntity<TableTypes[T]>[]>(
      sql,
      filterParams
    );

    return rows || [];
  }

  async getRowById(id: number): Promise<DatabaseEntity<TableTypes[T]>> {
    const sql = `SELECT rowid, * FROM ${this.tableName} WHERE rowid = ?`;
    const row = await this.db.get<DatabaseEntity<TableTypes[T]>>(sql, [id]);

    if (!row) {
      throw new Error(
        `Row with id ${id} not found in table ${this.tableName}.`
      );
    }

    return row;
  }

  async updateRow(
    id: number,
    updatedTask: Partial<TableTypes[T]>
  ): Promise<DatabaseEntity<TableTypes[T]>> {
    const updates = Object.entries(updatedTask);

    if (updates.length === 0) {
      throw new Error("No fields to update");
    }

    const setClause = updates.map(([key]) => `${key} = ?`).join(", ");

    const sql = `UPDATE ${this.tableName} 
                 SET ${setClause} 
                 WHERE rowid = ?`;

    const params = [...updates.map(([, value]) => value), id];

    const result = await this.db.run(sql, params);

    if (result.changes === 0) {
      throw new Error("Row not found or update failed.");
    }

    const updatedMaterial = await this.getRowById(id);
    return updatedMaterial!;
  }

  async deleteMaterial(id: number): Promise<void> {
    const sql = `DELETE FROM ${this.tableName} WHERE rowid = ?`;

    const result = await this.db.run(sql, [id]);

    if (result.changes === 0) {
      throw new Error("Row not found or deletion failed.");
    }
  }
}

export default DatabaseController;
