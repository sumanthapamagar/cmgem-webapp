// MongoDB initialization script for CMGEM development environment
// This script runs when the MongoDB container starts for the first time

db = db.getSiblingDB('cmgem');

// Create collections if they don't exist
db.createCollection('accounts');
db.createCollection('attachments');
db.createCollection('checklists');
db.createCollection('equipments');
db.createCollection('floors');
db.createCollection('projects');
db.createCollection('reports');

// Create indexes for better performance
db.accounts.createIndex({ "email": 1 }, { unique: true });
db.accounts.createIndex({ "createdAt": 1 });

db.equipments.createIndex({ "projectId": 1 });
db.equipments.createIndex({ "floorId": 1 });
db.equipments.createIndex({ "createdAt": 1 });

db.floors.createIndex({ "projectId": 1 });
db.floors.createIndex({ "createdAt": 1 });

db.projects.createIndex({ "name": 1 });
db.projects.createIndex({ "createdAt": 1 });

db.checklists.createIndex({ "equipmentId": 1 });
db.checklists.createIndex({ "createdAt": 1 });

// Insert sample data for development (optional)
if (db.projects.countDocuments() === 0) {
  db.projects.insertOne({
    name: "Sample Project",
    description: "A sample project for development purposes",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

print("CMGEM MongoDB database initialized successfully!");
print("Database: " + db.getName());
print("Collections created: " + db.getCollectionNames().join(", "));
