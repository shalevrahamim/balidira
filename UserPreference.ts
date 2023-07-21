// models/UserPreference.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class UserPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('jsonb')
  priceRange: { min: number, max: number };

  @Column('jsonb')
  location: { city: string, area: string };

  @Column('boolean')
  isRent: boolean;

  @Column('jsonb')
  roomsRange: { min: number, max: number };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

