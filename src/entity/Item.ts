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

  // ★★★ wanakanaの機能を正しい形で元に戻します ★★★
  @BeforeInsert()
  @BeforeUpdate()
  async setSearchText() {
    const wanakana = await import('wanakana');
    const combinedText = `${this.title} ${this.description}`;
    this.searchText = wanakana.toHiragana(combinedText);
  }

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}