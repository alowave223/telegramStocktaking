import { Database } from 'sqlite';
import { Material } from '../dto/materialDto';

class MaterialController {
  constructor(private db: Database) {}

  async createMaterial(material: Material): Promise<Material> {
    const { name, photo, count, price, primePrice } = material;
    const sql = 'INSERT INTO materials (name, photo, count, price, primePrice) VALUES (?, ?, ?, ?, ?)';

    const result = await this.db.run(sql, [name, photo, count, price, primePrice]);

    if (result.lastID) {
      const createdTask = await this.getMaterialById(result.lastID);
      return createdTask!;
    } else {
      throw new Error('Failed to create material');
    }
  }

  async getMaterialById(id: number): Promise<Material | undefined> {
    const sql = 'SELECT * FROM materials WHERE id = ?';
    const row = await this.db.get(sql, [id]);
    return row as Material | undefined;
  }

  async updateMaterial(id: number, updatedTask: Partial<Material>): Promise<Material | undefined> {
    const toUpdate = Object.keys(updatedTask);

    let sql = 'UPDATE materials SET ';
    
    toUpdate.forEach((value, index) => {
      if (toUpdate.length !== (index + 1)) {
        sql += `${value} = ?, `
      } else {
        sql += `${value} = ?`
      }
    });

    sql += ' WHERE id = ?';
    const result = await this.db.run(sql, [...Object.values(updatedTask), id]);

    if (result.changes && result.changes > 0) {
      const updatedMaterial = await this.getMaterialById(id);
      return updatedMaterial!;
    } else {
      throw new Error('Material not found or update failed');
    }
  }

  async deleteMaterial(id: number): Promise<void> {
    const sql = 'DELETE FROM materials WHERE id = ?';

    const result = await this.db.run(sql, [id]);

    if (result.changes === 0) {
      throw new Error('Material not found or deletion failed');
    }
  }
}

export default MaterialController;
