// models/Listing.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Listing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('boolean')
  isRent: boolean;

  @Column('jsonb')
  apartmentDetails: {
    rooms: number,
    square: number,
    isElevator: boolean,
    isParking: boolean,
    constructed: boolean
  };

  @Column('decimal')
  price: number;

  @Column('jsonb')
  location: { city: string, area: string };

  @Column('boolean')
  isPushed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

