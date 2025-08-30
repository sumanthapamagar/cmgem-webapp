# Equipments Module

## Bulk Save Endpoint

The bulk save endpoint allows you to create or update multiple equipments with their associated floors in a single request.

### Endpoint
```
POST /equipments/bulk-save
```

### Request Body Structure

```typescript
{
  "equipments": [
    {
      "_id": "equipment_id", // Always required - existing DB ID or locally generated MongoDB ID format
      "project_id": "project_id",
      "category": "Lift",
      "name": "Main Lift",
      "start_floor": 1,
      "floors_served": 10,
      // ... other equipment fields from CreateEquipmentDto
      "floors": [
        {
          "_id": "floor_id", // Always required - existing DB ID or locally generated MongoDB ID format
          "level": 1,
          "designation": "Ground Floor",
          "door_opening": "1200x2100",
          // ... other floor fields from CreateFloorDto
        }
      ]
    }
  ]
}
```

### Features

1. **Mixed Operations**: The request can contain a mix of new and existing equipments
2. **Project Validation**: All equipments must belong to the same project
3. **Floor Management**: Each equipment can have multiple floors that are created or updated accordingly
4. **Error Handling**: Individual failures don't stop the entire operation
5. **Detailed Response**: Returns results for each equipment and summary statistics
6. **Flexible ID Handling**: Equipment `_id` can be either an existing database ID or a locally generated MongoDB ID format string
7. **Direct Property Access**: Equipment properties are directly accessible without nesting
8. **Smart Floor Processing**: 
   - New equipment → Always creates new floors (ignores any _id provided)
   - Existing equipment → Always updates existing floors (requires valid _id)

### Floor Processing Logic

- **New Equipment**: All floors are created as new records, regardless of the `_id` provided
- **Existing Equipment**: All floors must have valid existing `_id` values and will be updated
- **Floor IDs**: All floors must have an `_id` property (MongoDB ID format), but the system handles them differently based on equipment status

### Response Structure

```typescript
{
  "results": [
    {
      "equipment": EquipmentResponseDto,
      "floors": FloorResponseDto[],
      "action": "created" | "updated"
    }
  ],
  "summary": {
    "total_processed": number,
    "created": number,
    "updated": number,
    "errors": string[]
  }
}
```

### Usage Examples

#### Creating New Equipment with Floors
```json
{
  "equipments": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "project_id": "507f1f77bcf86cd799439011",
      "category": "Lift",
      "name": "Service Lift",
      "start_floor": -2,
      "floors_served": 5,
      "maintenance": {
        "current_provider": "ABC Maintenance Ltd",
        "total_inspections_last_12_months": "12"
      },
      "floors": [
        {
          "_id": "507f1f77bcf86cd799439021",
          "level": -2,
          "designation": "Basement 2",
          "door_opening": "1000x2000"
        },
        {
          "_id": "507f1f77bcf86cd799439022",
          "level": -1,
          "designation": "Basement 1",
          "door_opening": "1000x2000"
        }
      ]
    }
  ]
}
```

#### Updating Existing Equipment and Floors
```json
{
  "equipments": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "project_id": "507f1f77bcf86cd799439011",
      "name": "Updated Lift Name",
      "floors": [
        {
          "_id": "507f1f77bcf86cd799439013",
          "designation": "Updated Floor Name"
        }
      ]
    }
  ]
}
```

### Notes

- **Equipment ID**: The `_id` field is always required for equipments. It can be:
  - An existing MongoDB ID from the database (for updates)
  - A locally generated MongoDB ID format string (for new equipments)
- **Equipment Properties**: All equipment properties from `CreateEquipmentDto` are directly accessible on the equipment object
- All equipments in a single request must belong to the same project
- For new floors, `level` and `designation` are required fields
- The `equipment_id` for floors is automatically set when creating new floors
- Existing floors maintain their `equipment_id` relationship
- The operation is transactional at the equipment level (equipment + its floors)
- Errors are collected and returned in the response summary
- The system automatically detects whether to create or update based on whether the ID exists in the database
