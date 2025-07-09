// /src/entity/Item.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert, // ★ TypeORMのフックをインポート
  BeforeUpdate, // ★ TypeORMのフックをインポート
} from "typeorm";
import { User } from "./User";
import * as wanakana from 'wanakana'; // ★ wanakanaをインポート
import { Like } from "./Like";
import { Comment } from "./Comment";

export enum ItemStatus {
  AVAILABLE = "available",
  PENDING_RESERVATION = "pending_reservation",
  RESERVED = "reserved",
  SOLD_OUT = "sold_out",
}

@Entity({ name: "items" })
export class Item {
  // ... id, title, description, price, status, seller, imageUrls, createdAt, updatedAt はそのまま ...
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  title!: string;

  @Column("text")
  description!: string;

  @Column("int")
  price!: number;

  @Column({
    type: "enum",
    enum: ItemStatus,
    default: ItemStatus.AVAILABLE,
  })
  status!: ItemStatus;

  @ManyToOne(() => User, (user) => user.items, {
    eager: true,
    onDelete: "CASCADE",
  })
  seller!: User;

  @OneToMany(() => Like, (like) => like.item)
  likes!: Like[];

  @OneToMany(() => Comment, (comment: Comment) => comment.item)
  comments!: Comment[];


  @Column("simple-array", { default: "" })
  imageUrls!: string[];

  // ★★★ 検索用のカラムを追加 ★★★
  // select: false にすると、通常のfindでは取得されず、パフォーマンスに影響しにくい
  @Column('text', { select: false, default: '' })
  searchText!: string;

  @Column({ type: 'varchar', length: 50, nullable: true }) // 文字列型で、空でもOK
  category!: string;

  // ★★★ 保存・更新の直前に実行される処理を追加 ★★★
  @BeforeInsert()
  @BeforeUpdate()
  setSearchText() {
    // titleとdescriptionを結合し、すべてひらがなに変換してsearchTextに格納
    const combinedText = `${this.title} ${this.description}`;
    this.searchText = wanakana.toHiragana(combinedText);
  }

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
  
}