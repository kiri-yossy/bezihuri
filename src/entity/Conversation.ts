// /src/entity/Conversation.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Message } from "./Message";
import { Reservation } from "./Reservation";

@Entity({ name: "conversations" })
export class Conversation {
  @PrimaryGeneratedColumn()
  id!: number;

  // 会話に参加するユーザー (多対多)
  @ManyToMany(() => User, (user) => user.conversations)
  @JoinTable() // 中間テーブルを自動生成
  participants!: User[];

  // この会話に投稿されたメッセージ (一対多)
  @OneToMany(() => Message, (message) => message.conversation)
  messages!: Message[];

  // この会話がどの予約に紐づいているか (一対一)
  @OneToOne(() => Reservation)
  @JoinColumn()
  reservation!: Reservation;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}