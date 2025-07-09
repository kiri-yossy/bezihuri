// /src/entity/Review.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Reservation } from "./Reservation";

export enum Rating {
  GOOD = "good",
  NORMAL = "normal",
  BAD = "bad",
}

@Entity({ name: "reviews" })
export class Review {
  @PrimaryGeneratedColumn()
  id!: number;

  // 評価（良い、普通、悪い）
  @Column({ type: "enum", enum: Rating })
  rating!: Rating;

  @Column("text", { nullable: true })
  comment!: string | null;

  // どの予約に対する評価か (1対1)
  @OneToOne(() => Reservation)
  @JoinColumn()
  reservation!: Reservation;

  // 評価した人
  @ManyToOne(() => User, (user) => user.reviewsGiven, { onDelete: "CASCADE" })
  reviewer!: User;

  // 評価された人
  @ManyToOne(() => User, (user) => user.reviewsReceived, { onDelete: "CASCADE" })
  reviewee!: User;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
