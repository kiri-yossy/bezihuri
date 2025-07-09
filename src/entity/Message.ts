// /src/entity/Message.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";
import { Conversation } from "./Conversation";

@Entity({ name: "messages" })
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text")
  text!: string;

  // どの会話に属するか
  @ManyToOne(() => Conversation, (conversation) => conversation.messages, { onDelete: "CASCADE" })
  conversation!: Conversation;

  // 誰が送信したか
  @ManyToOne(() => User, (user) => user.messages, { onDelete: "CASCADE" })
  sender!: User;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}