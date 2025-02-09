module.exports = [
    {
      name: "Create new satellite",
      method: "POST",
      endpoint: "/api/satellites",
      queryParams: null,  
      body: {
        name: "SATTEST1",
        slug: "Satellite Test 1",
        orbit: { longitude: 45 }
      },
      expectedStatusCode: 201,
      expectedResponseBody: {  
        _id: expect.any(String),  
        name: "SATTEST1",
        slug: "Satellite Test 1",
        status: "active",
        company: null,
        creationOrigin: "inventory",
        orbit: {
            longitude: 45,
            latitude: 0,
            inclination: 0,
            height: 35786.063,
            _id: expect.any(String)
        },
        deleted: false,
        deletedAt: null,
        deletionOrigin: null,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      }
    }
  ];
  