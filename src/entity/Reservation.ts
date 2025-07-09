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

// 予約の状態を定義
export enum ReservationStatus {
  PENDING_APPROVAL = "pending_approval", // 承認待ち
  RESERVED = "reserved",                 // 予約確定
  COMPLETED = "completed",               // 受け取り完了
  CANCELLED = "cancelled",               // キャンセル済み
  REJECTED = "rejected",                 // ★★★ この行を追加 ★★★
}

@Entity({ name: "reservations" })
export class Reservation {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.Reservations, { onDelete: "SET NULL" })
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
}