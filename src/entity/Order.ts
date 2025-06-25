// /src/entity/Order.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Column,
} from "typeorm";
import { User } from "./User";
import { Item } from "./Item";

@Entity({ name: "orders" })
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  // 購入者
  @ManyToOne(() => User, (user) => user.orders, { onDelete: "SET NULL" })
  buyer!: User;

  // 購入された商品
  @ManyToOne(() => Item, { onDelete: "SET NULL" }) // 商品が削除されても取引履歴は残す
  item!: Item;

  // 取引成立時の価格を記録
  @Column()
  priceAtPurchase!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}