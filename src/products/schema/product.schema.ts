import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
    timestamps: true,
    versionKey: false,
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
        },
    },
})
export class Product { 
    @Prop()
    name: string;

    @Prop()
    price: string;

    @Prop()
    description: string;

    @Prop()
    ownerId: string;

    @Prop()
    ownerName: string;

    @Prop()
    ownerEmail: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
