import { describe, expect, it, vi, afterEach } from "vitest";
import { api } from "./client";

afterEach(() => vi.restoreAllMocks());

describe("PetClinic API client", () => {
  it("searches owners by filtering the fetched owners", async () => {
    const mockOwners = [
      {
        id: 1,
        firstName: "Eduardo",
        lastName: "Rodrique",
        address: "Test Street",
        city: "Madison",
        telephone: "1234567890",
        pets: [],
      },
      {
        id: 2,
        firstName: "George",
        lastName: "Franklin",
        address: "Test Street",
        city: "Madison",
        telephone: "1234567890",
        pets: [],
      },
    ];

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockOwners), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await api.searchOwners("Eduardo");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/owners"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: "application/json",
        }),
      }),
    );

    expect(result).toHaveLength(1);
    expect(result[0].firstName).toBe("Eduardo");
  });
  it("surfaces backend validation errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ detail: "Telephone is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
    );
    await expect(api.searchOwners("Davis")).rejects.toThrow(
      "Telephone is required",
    );
  });
  it.each(["Rodrique", "Eduardo Rodrique"])(
    "searches owners using %s",
    async (searchTerm) => {
      const mockOwners = [
        {
          id: 1,
          firstName: "Eduardo",
          lastName: "Rodrique",
          address: "Test Street",
          city: "Madison",
          telephone: "1234567890",
          pets: [],
        },
      ];

      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify(mockOwners), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

      const result = await api.searchOwners(searchTerm);

      expect(result).toHaveLength(1);
      expect(result[0].lastName).toBe("Rodrique");
    },
  );
  it("returns an empty array when no owner matches", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 1,
            firstName: "Eduardo",
            lastName: "Rodrique",
            address: "Test Street",
            city: "Madison",
            telephone: "1234567890",
            pets: [],
          },
        ]),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const result = await api.searchOwners("NonExistingOwner");

    expect(result).toEqual([]);
  });
  it("handles network failures gracefully", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new TypeError("Failed to fetch"),
    );

    await expect(api.searchOwners("Eduardo")).rejects.toThrow();
  });
  it("creates an owner with the correct POST request", async () => {
    const ownerData = {
      firstName: "John",
      lastName: "Smith",
      address: "Main Street",
      city: "Madison",
      telephone: "1234567890",
    };

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: 10, ...ownerData, pets: [] }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await api.createOwner(ownerData);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/owners"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(ownerData),
        headers: expect.objectContaining({
          Accept: "application/json",
          "Content-Type": "application/json",
        }),
      }),
    );
  });
  it("creates a pet with the correct type details", async () => {
    const petData = {
      name: "Bruno",
      birthDate: "2026-11-06",
      typeId: 5,
      typeName: "bird",
    };

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 5,
          name: "Bruno",
          birthDate: "2026-11-06",
          type: { id: 5, name: "bird" },
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    await api.createPet(1, petData);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/owners/1/pets"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "Bruno",
          birthDate: "2026-11-06",
          type: {
            id: 5,
            name: "bird",
          },
        }),
      }),
    );
  });
});
