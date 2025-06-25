import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"; // ★OneToMany をインポート
import { Item } from "./Item"; // ★Itemエンティティをインポート
import { Like } from "./Like";
import { Order } from "./Order";

@Entity({ name: 'users' })
export class User {
    // ... id, username, email, password, role, createdAt, updatedAt は変更なし ...
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    username!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @Column({
        type: 'varchar',
        default: 'user',
    })
    role!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    // ★★★ここから追加★★★
    // 一人のユーザーは多くの商品を出品できる (一対多)
    @OneToMany(() => Item, item => item.seller)
    items!: Item[]; // そのユーザーが出品した商品リスト
    // ★★★ここまで追加★★★

    @OneToMany(() => Like, (like) => like.user)
    likes!: Like[];

    @OneToMany(() => Order, (order: Order) => order.buyer)
    orders!: Order[]; // そのユーザーが行った購入履歴

    @Column('text', { nullable: true }) // text型で、空でもOK(nullable: true)
    bio!: string;
}