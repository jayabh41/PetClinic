export interface PetType {
  id: number;
  name: string;
}
export interface Visit {
  id: number;
  date: string;
  description: string;
  petId?: number;
}
export interface Pet {
  id: number;
  name: string;
  birthDate: string;
  type: PetType | string;
  visits?: Visit[];
}
export interface Owner {
  id: number;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  telephone: string;
  pets: Pet[];
}
export interface OwnerInput {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  telephone: string;
}
export interface PetInput {
  name: string;
  birthDate: string;
  typeId: number;
  typeName: string;
}
export interface VisitInput {
  date: string;
  description: string;
}
