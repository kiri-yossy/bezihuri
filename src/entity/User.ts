import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
} from "typeorm";
import { Item } from "./Item";
import { Like } from "./Like";
import { Reservation } from "./Reservation";
import { Conversation } from "./Conversation";
import { Message } from "./Message";
import { Review } from "./Review";
import { Follow } from "./Follow";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column('text', { nullable: true })
  bio!: string;

  @Column({ 
    default: process.env.EMAIL_VERIFICATION_ENABLED === 'true' ? false : true 
  })
  isVerified!: boolean;

  @Column({ type: 'varchar', nullable: true, select: false })
  verificationToken!: string | null;

  @Column({
      type: 'enum',
      enum: UserRole,
      default: UserRole.USER,
  })
  role!: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Item, (item: Item) => item.seller)
  items!: Item[];

  @OneToMany(() => Like, (like: Like) => like.user)
  likes!: Like[];
  
  @OneToMany(() => Reservation, (reservation: Reservation) => reservation.buyer)
  reservations!: Reservation[];

  @ManyToMany(() => Conversation, (conversation) => conversation.participants)
  conversations!: Conversation[];

  @OneToMany(() => Message, (message) => message.sender)
  messages!: Message[];

  @OneToMany(() => Review, (review) => review.reviewer)
  reviewsGiven!: Review[];

  @OneToMany(() => Review, (review) => review.reviewee)
  reviewsReceived!: Review[];

  @OneToMany(() => Follow, (follow) => follow.follower)
  following!: Follow[];

  @OneToMany(() => Follow, (follow) => follow.following)
  followers!: Follow[];
}