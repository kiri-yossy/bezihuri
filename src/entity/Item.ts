import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { Like } from "./Like";
import { Comment } from "./Comment";
import { Reservation } from "./Reservation";

export enum ItemStatus {
  AVAILABLE = "available",
  PENDING_RESERVATION = "pending_reservation",
  RESERVED = "reserved",
  SOLD_OUT = "sold_out",
}

@Entity({ name: "items" })
export class Item {
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
  
  @Column({ type: 'varchar', length: 50, nullable: true })
  category!: string;

  @ManyToOne(() => User, (user) => user.items, {
    eager: true,
    onDelete: "CASCADE",
  })
  seller!: User;

  @Column("simple-array", { default: "" })
  imageUrls!: string[];

  @OneToMany(() => Like, (like: Like) => like.item)
  likes!: Like[];

  @OneToMany(() => Comment, (comment: Comment) => comment.item)
  comments!: Comment[];
  
  @Column('text', { select: false, default: '' })
  searchText!: string;

  // ★★★ この関数の中身を、wanakanaを使わないシンプルなものに修正 ★★★
  @BeforeInsert()
  @BeforeUpdate()
  setSearchText() {
    const combinedText = `${this.title} ${this.description}`;
    // CommonJS/ESM問題を避けるため、一旦シンプルな小文字変換に戻します
    this.searchText = combinedText.toLowerCase();
  }

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}