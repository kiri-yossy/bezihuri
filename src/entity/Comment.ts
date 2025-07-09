// /src/entity/Comment.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";
import { Item } from "./Item";

@Entity({ name: "comments" })
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text")
  text!: string;

  // どのユーザーがコメントしたか
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user!: User;

  // どの商品へのコメントか
  @ManyToOne(() => Item, (item) => item.comments, { onDelete: "CASCADE" })
  item!: Item;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}