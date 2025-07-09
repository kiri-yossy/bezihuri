// /src/entity/Follow.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";

@Entity({ name: "follows" })
export class Follow {
  @PrimaryGeneratedColumn()
  id!: number;

  // フォローしたユーザー
  @ManyToOne(() => User, (user) => user.following, { onDelete: "CASCADE" })
  follower!: User;

  // フォローされたユーザー
  @ManyToOne(() => User, (user) => user.followers, { onDelete: "CASCADE" })
  following!: User;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}