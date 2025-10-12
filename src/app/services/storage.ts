import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {

    const storage = await this.storage.create();
    this._storage = storage;
  }


  public async set(key: string, value: any): Promise<any> {
    return this._storage?.set(key, value);
  }

  public async get(key: string): Promise<any> {
    return this._storage?.get(key);
  }

  public async remove(key: string): Promise<any> {
    return this._storage?.remove(key);
  }

  public async clear(): Promise<void> {
    return this._storage?.clear();
  }

  public async keys(): Promise<string[]> {
    return this._storage?.keys() || [];
  }

  public async length(): Promise<number> {
    return this._storage?.length() || 0;
  }

  public async forEach(iteratorCallback: (value: any, key: string, iterationNumber: Number) => any): Promise<void> {
    return this._storage?.forEach(iteratorCallback);
  }
}