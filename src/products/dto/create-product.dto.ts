export class CreateProductDto {
    name: string;
    description: string;
    price: number;
    ownerId: string;
    ownerName?: string;
    ownerEmail?: string;
}
