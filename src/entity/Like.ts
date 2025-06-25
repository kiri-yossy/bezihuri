// /src/entity/Like.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Item } from "./Item";

@Entity({ name: "likes" })
export class Like {
  @PrimaryGeneratedColumn()
  id!: number;

  // どのユーザーがいいねしたか
  @ManyToOne(() => User, (user) => user.likes, { onDelete: "CASCADE" })
  user!: User;

  // どの商品がいいねされたか
  @ManyToOne(() => Item, (item) => item.likes, { onDelete: "CASCADE" })
  item!: Item;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}