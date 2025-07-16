import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Column,
  OneToOne,
} from "typeorm";
import { User } from "./User";
import { Item } from "./Item";
import { Review } from "./Review";
import { Conversation } from "./Conversation"; // ★ Conversationをインポート

export enum ReservationStatus {
  PENDING_APPROVAL = "pending_approval",
  RESERVED = "reserved",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  REJECTED = "rejected",
}

@Entity({ name: "reservations" })
export class Reservation {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.reservations, { onDelete: "SET NULL" })
  buyer!: User;

  @ManyToOne(() => Item, { onDelete: "SET NULL" })
  item!: Item;

  @Column()
  priceAtReservation!: number;

  @Column({
    type: "enum",
    enum: ReservationStatus,
    default: ReservationStatus.PENDING_APPROVAL,
  })
  status!: ReservationStatus;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @OneToOne(() => Review, (review) => review.reservation)
  review!: Review;

  // ★★★ このプロパティを追加 ★★★
  @OneToOne(() => Conversation, (conversation) => conversation.reservation)
  conversation!: Conversation;
}