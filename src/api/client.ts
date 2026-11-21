import type {
  Owner,
  OwnerInput,
  Pet,
  PetInput,
  PetType,
  Visit,
  VisitInput,
} from "../types/petclinic";

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:9966/petclinic/api"
).replace(/\/$/, "");

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new Error(
      "Cannot reach PetClinic. Check that the backend is running at http://localhost:9966/petclinic.",
    );
  }
  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`;
    try {
      const body: unknown = await response.json();
      if (body && typeof body === "object" && "detail" in body)
        detail = String(body.detail);
      else if (body && typeof body === "object" && "message" in body)
        detail = String(body.message);
    } catch {
      /* response may have no JSON body */
    }
    throw new Error(detail);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  searchOwners: async (searchTerm: string): Promise<Owner[]> => {
    const owners = await request<Owner[]>("/owners");

    const query = searchTerm.trim().toLowerCase();

    if (!query) return owners;

    return owners.filter((owner) => {
      const fullName = `${owner.firstName} ${owner.lastName}`.toLowerCase();

      return (
        owner.firstName.toLowerCase().includes(query) ||
        owner.lastName.toLowerCase().includes(query) ||
        fullName.includes(query)
      );
    });
  },
  getOwner: (id: number) => request<Owner>(`/owners/${id}`),
  createOwner: (data: OwnerInput) =>
    request<Owner>("/owners", { method: "POST", body: JSON.stringify(data) }),
  updateOwner: (id: number, data: OwnerInput) =>
    request<Owner>(`/owners/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getPet: (ownerId: number, petId: number) =>
    request<Pet>(`/owners/${ownerId}/pets/${petId}`),
  addVisit: (ownerId: number, petId: number, data: VisitInput) =>
    request<Visit>(`/owners/${ownerId}/pets/${petId}/visits`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getPetTypes: () => request<PetType[]>("/pettypes"),
  createPet: (ownerId: number, data: PetInput) =>
    request<Pet>(`/owners/${ownerId}/pets`, {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        birthDate: data.birthDate,
        type: {
          id: data.typeId,
          name: data.typeName,
        },
      }),
    }),

  updatePet: (ownerId: number, petId: number, data: PetInput) =>
    request<void>(`/owners/${ownerId}/pets/${petId}`, {
      method: "PUT",
      body: JSON.stringify({
        name: data.name,
        birthDate: data.birthDate,
        type: {
          id: data.typeId,
          name: data.typeName,
        },
      }),
    }),
};
