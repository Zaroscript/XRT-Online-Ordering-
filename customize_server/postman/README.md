# Postman Collection Setup for XRT Authentication System

## Import Instructions

1. Open Postman
2. Click "Import" in the top left
3. Choose "Raw text" and paste the JSON below
4. Or create a new collection and add endpoints manually

## Collection JSON

Copy this entire JSON and import into Postman:

```json
{
  "info": {
    "_postman_id": "xrt-customized-system",
    "name": "XRT Customized System",
    "description": "Complete API collection for testing XRT authentication system with JWT tokens, user management, and admin functions",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3001",
      "type": "string"
    },
    {
      "key": "accessToken",
      "value": "",
      "type": "string"
    },
    {
      "key": "refreshToken",
      "value": "",
      "type": "string"
    },
    {
      "key": "userId",
      "value": "",
      "type": "string"
    },
    {
      "key": "adminAccessToken",
      "value": "",
      "type": "string"
    },
    {
      "key": "roleId",
      "value": "",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "🔐 Public Endpoints",
      "item": [
        {
          "name": "Register User",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 201) {",
                  "    const response = pm.response.json();",
                  "    pm.collectionVariables.set('accessToken', response.accessToken);",
                  "    pm.collectionVariables.set('refreshToken', response.refreshToken);",
                  "    pm.collectionVariables.set('userId', response.data.user._id);",
                  "}",
                  "",
                  "pm.test(\"Status code is 201\", function () {",
                  "    pm.response.to.have.status(201);",
                  "});",
                  "",
                  "pm.test(\"Response has required fields\", function () {",
                  "    const response = pm.response.json();",
                  "    pm.expect(response).to.have.property('status');",
                  "    pm.expect(response).to.have.property('accessToken');",
                  "    pm.expect(response).to.have.property('refreshToken');",
                  "    pm.expect(response.data).to.have.property('user');",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"John Doe\",\n  \"email\": \"john.doe@example.com\",\n  \"password\": \"password123\",\n  \"role\": \"client\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "register"]
            }
          },
          "response": []
        },
        {
          "name": "Register Super Admin",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 201) {",
                  "    const response = pm.response.json();",
                  "    pm.collectionVariables.set('adminAccessToken', response.accessToken);",
                  "    pm.collectionVariables.set('adminRefreshToken', response.refreshToken);",
                  "    pm.collectionVariables.set('adminUserId', response.data.user._id);",
                  "}",
                  "",
                  "pm.test(\"Status code is 201\", function () {",
                  "    pm.response.to.have.status(201);",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Admin User\",\n  \"email\": \"admin@example.com\",\n  \"password\": \"admin123\",\n  \"role\": \"super_admin\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "register"]
            }
          },
          "response": []
        },
        {
          "name": "Login",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    const response = pm.response.json();",
                  "    pm.collectionVariables.set('accessToken', response.accessToken);",
                  "    pm.collectionVariables.set('refreshToken', response.refreshToken);",
                  "    pm.collectionVariables.set('userId', response.data.user._id);",
                  "}",
                  "",
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"Response has tokens\", function () {",
                  "    const response = pm.response.json();",
                  "    pm.expect(response).to.have.property('accessToken');",
                  "    pm.expect(response).to.have.property('refreshToken');",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"john.doe@example.com\",\n  \"password\": \"password123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "login"]
            }
          },
          "response": []
        },
        {
          "name": "Login as Admin",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    const response = pm.response.json();",
                  "    pm.collectionVariables.set('adminAccessToken', response.accessToken);",
                  "    pm.collectionVariables.set('adminRefreshToken', response.refreshToken);",
                  "    pm.collectionVariables.set('adminUserId', response.data.user._id);",
                  "}",
                  "",
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@example.com\",\n  \"password\": \"admin123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "login"]
            }
          },
          "response": []
        },
        {
          "name": "Refresh Token",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    const response = pm.response.json();",
                  "    pm.collectionVariables.set('accessToken', response.accessToken);",
                  "}",
                  "",
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"Response has access token\", function () {",
                  "    const response = pm.response.json();",
                  "    pm.expect(response).to.have.property('accessToken');",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"refreshToken\": \"{{refreshToken}}\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/refresh-token",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "refresh-token"]
            }
          },
          "response": []
        },
        {
          "name": "Forgot Password",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"Response has success message\", function () {",
                  "    const response = pm.response.json();",
                  "    pm.expect(response).to.have.property('message');",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"john.doe@example.com\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/forgot-password",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "forgot-password"]
            }
          },
          "response": []
        },
        {
          "name": "Reset Password",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"Response returns tokens\", function () {",
                  "    const response = pm.response.json();",
                  "    pm.expect(response).to.have.property('accessToken');",
                  "    pm.expect(response).to.have.property('refreshToken');",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "PATCH",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"password\": \"newpassword123\",\n  \"passwordConfirm\": \"newpassword123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/reset-password/:token",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "reset-password", ":token"]
            }
          },
          "response": []
        }
      ],
      "description": "Public endpoints that don't require authentication"
    },
    {
      "name": "🔒 Protected Endpoints",
      "item": [
        {
          "name": "Get Current User",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"Response has user data\", function () {",
                  "    const response = pm.response.json();",
                  "    pm.expect(response.data).to.have.property('user');",
                  "    pm.expect(response.data.user).to.have.property('email');",
                  "    pm.expect(response.data.user).to.not.have.property('password');",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{accessToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/me",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "me"]
            }
          },
          "response": []
        },
        {
          "name": "Update Password",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"Response returns new tokens\", function () {",
                  "    const response = pm.response.json();",
                  "    pm.expect(response).to.have.property('accessToken');",
                  "    pm.expect(response).to.have.property('refreshToken');",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "PATCH",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{accessToken}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"currentPassword\": \"password123\",\n  \"newPassword\": \"newpassword123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/update-password",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "update-password"]
            }
          },
          "response": []
        },
        {
          "name": "Logout",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"Response has success status\", function () {",
                  "    const response = pm.response.json();",
                  "    pm.expect(response).to.have.property('status', 'success');",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{accessToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/logout",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "logout"]
            }
          },
          "response": []
        }
      ],
      "description": "Endpoints that require authentication with JWT token"
    },
    {
      "name": "👑 Admin Only Endpoints",
      "item": [
        {
          "name": "Get All Users",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"Response has users array\", function () {",
                  "    const response = pm.response.json();",
                  "    pm.expect(response).to.have.property('data');",
                  "    pm.expect(response.data).to.have.property('users');",
                  "    pm.expect(response.data.users).to.be.an('array');",
                  "});",
                  "",
                  "pm.test(\"Users don't have passwords\", function () {",
                  "    const response = pm.response.json();",
                  "    response.data.users.forEach(user => {",
                  "        pm.expect(user).to.not.have.property('password');",
                  "    });",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminAccessToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/users",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "users"]
            }
          },
          "response": []
        },
        {
          "name": "Approve User",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"User is approved\", function () {",
                  "    const response = pm.response.json();",
                  "    pm.expect(response.data.user).to.have.property('isApproved', true);",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "PATCH",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminAccessToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/users/{{userId}}/approve",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "users", "{{userId}}", "approve"]
            }
          },
          "response": []
        },
        {
          "name": "Ban User",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"User is banned\", function () {",
                  "    const response = pm.response.json();",
                  "    pm.expect(response.data.user).to.have.property('isBanned', true);",
                  "    pm.expect(response.data.user).to.have.property('banReason');",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "PATCH",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminAccessToken}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"isBanned\": true,\n  \"banReason\": \"Violation of terms of service\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/users/{{userId}}/ban",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "users", "{{userId}}", "ban"]
            }
          },
          "response": []
        },
        {
          "name": "Unban User",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"User is unbanned\", function () {",
                  "    const response = pm.response.json();",
                  "    pm.expect(response.data.user).to.have.property('isBanned', false);",
                  "    pm.expect(response.data.user).to.not.have.property('banReason');",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "PATCH",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminAccessToken}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"isBanned\": false\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/users/{{userId}}/ban",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "users", "{{userId}}", "ban"]
            }
          },
          "response": []
        },
        {
          "name": "Delete User",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 204\", function () {",
                  "    pm.response.to.have.status(204);",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminAccessToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/users/{{userId}}",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "users", "{{userId}}"]
            }
          },
          "response": []
        },
        {
          "name": "Get All Permissions",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"Response has permissions array\", function () {",
                  "    const response = pm.response.json();",
                  "    pm.expect(response).to.have.property('data');",
                  "    pm.expect(response.data).to.have.property('permissions');",
                  "    pm.expect(response.data.permissions).to.be.an('array');",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminAccessToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/permissions",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "permissions"]
            }
          },
          "response": []
        },
        {
          "name": "Get User Permissions",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"Response has user permissions\", function () {",
                  "    const response = pm.response.json();",
                  "    pm.expect(response).to.have.property('data');",
                  "    pm.expect(response.data).to.have.property('permissions');",
                  "    pm.expect(response.data).to.have.property('role');",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminAccessToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/users/{{userId}}/permissions",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "users", "{{userId}}", "permissions"]
            }
          },
          "response": []
        },
        {
          "name": "Update User Permissions",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"Response has updated user\", function () {",
                  "    const response = pm.response.json();",
                  "    pm.expect(response).to.have.property('data');",
                  "    pm.expect(response.data).to.have.property('user');",
                  "    pm.expect(response.data.user).to.have.property('permissions');",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "PATCH",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminAccessToken}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"permissions\": [\n    \"profile:read\",\n    \"profile:update\",\n    \"content:read\",\n    \"content:create\"\n  ]\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/users/{{userId}}/permissions",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "users", "{{userId}}", "permissions"]
            }
          },
          "response": []
        }
      ],
      "description": "Admin endpoints that require super_admin role"
    },
    {
      "name": "👥 Role Management",
      "item": [
        {
          "name": "Create Role",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 201) {",
                  "    const response = pm.response.json();",
                  "    pm.collectionVariables.set('roleId', response.data.role._id);",
                  "    console.log('Role created successfully, ID saved');",
                  "}",
                  "",
                  "pm.test(\"Status code is 201\", function () {",
                  "    pm.response.to.have.status(201);",
                  "});",
                  "",
                  "pm.test(\"Response has role data\", function () {",
                  "    const response = pm.response.json();",
                  "    pm.expect(response).to.have.property('data');",
                  "    pm.expect(response.data).to.have.property('role');",
                  "    pm.expect(response.data.role).to.have.property('name');",
                  "    pm.expect(response.data.role).to.have.property('permissions');",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminAccessToken}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"content_manager\",\n  \"displayName\": \"Content Manager\",\n  \"description\": \"Can manage content but not users\",\n  \"permissions\": [\n    \"content:read\",\n    \"content:create\",\n    \"content:update\",\n    \"content:delete\",\n    \"content:publish\",\n    \"profile:read\",\n    \"profile:update\"\n  ]\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/roles",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "roles"]
            }
          },
          "response": []
        },
        {
          "name": "Get All Roles",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"Response has roles array\", function () {",
                  "    const response = pm.response.json();",
                  "    pm.expect(response).to.have.property('data');",
                  "    pm.expect(response.data).to.have.property('roles');",
                  "    pm.expect(response.data.roles).to.be.an('array');",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminAccessToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/v1/roles",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "roles"]
            }
          },
          "response": []
        },
        {
          "name": "Get Role by ID",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"Response has role data\", function () {",
                  "    const response = pm.response.json();",
                  "    pm.expect(response).to.have.property('data');",
                  "    pm.expect(response.data).to.have.property('role');",
                  "    pm.expect(response.data.role).to.have.property('name');",
                  "    pm.expect(response.data.role).to.have.property('permissions');",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminAccessToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/v1/roles/{{roleId}}",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "roles", "{{roleId}}"]
            }
          },
          "response": []
        },
        {
          "name": "Update Role",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"Response has updated role\", function () {",
                  "    const response = pm.response.json();",
                  "    pm.expect(response).to.have.property('data');",
                  "    pm.expect(response.data).to.have.property('role');",
                  "    pm.expect(response.data.role).to.have.property('permissions');",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "PATCH",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminAccessToken}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"displayName\": \"Senior Content Manager\",\n  \"description\": \"Can manage all content and some user operations\",\n  \"permissions\": [\n    \"content:read\",\n    \"content:create\",\n    \"content:update\",\n    \"content:delete\",\n    \"content:publish\",\n    \"users:read\",\n    \"profile:read\",\n    \"profile:update\"\n  ]\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/roles/{{roleId}}",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "roles", "{{roleId}}"]
            }
          },
          "response": []
        },
        {
          "name": "Delete Role",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 204\", function () {",
                  "    pm.response.to.have.status(204);",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminAccessToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/v1/roles/{{roleId}}",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "roles", "{{roleId}}"]
            }
          },
          "response": []
        },
        {
          "name": "Assign Role to User",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"Response has updated user\", function () {",
                  "    const response = pm.response.json();",
                  "    pm.expect(response).to.have.property('data');",
                  "    pm.expect(response.data).to.have.property('user');",
                  "    pm.expect(response.data.user).to.have.property('customRole');",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "PATCH",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminAccessToken}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"roleId\": \"{{roleId}}\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/roles/users/{{userId}}/assign",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "roles", "users", "{{userId}}", "assign"]
            }
          },
          "response": []
        },
        {
          "name": "Remove Role from User",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"Response has updated user\", function () {",
                  "    const response = pm.response.json();",
                  "    pm.expect(response).to.have.property('data');",
                  "    pm.expect(response.data).to.have.property('user');",
                  "    pm.expect(response.data.user.customRole).to.be.null;",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "PATCH",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminAccessToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/v1/roles/users/{{userId}}/remove",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "roles", "users", "{{userId}}", "remove"]
            }
          },
          "response": []
        },
        {
          "name": "Get Users with Role",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"Response has users array\", function () {",
                  "    const response = pm.response.json();",
                  "    pm.expect(response).to.have.property('data');",
                  "    pm.expect(response.data).to.have.property('users');",
                  "    pm.expect(response.data.users).to.be.an('array');",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminAccessToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/v1/roles/users/{{roleId}}",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "roles", "users", "{{roleId}}"]
            }
          },
          "response": []
        }
      ],
      "description": "Role management endpoints for creating and managing custom roles"
    }
  ]
}
```

## Manual Setup Alternative

If you prefer to set up manually:

### Environment Variables
Create these collection variables:
- `baseUrl`: `http://localhost:3000`
- `accessToken`: (empty - will be set automatically)
- `refreshToken`: (empty - will be set automatically) 
- `userId`: (empty - will be set automatically)
- `adminAccessToken`: (empty - will be set automatically)

### Test Workflow

1. **Register Super Admin**: Use "Register Super Admin" endpoint
2. **Login as Admin**: Use "Login as Admin" to get admin token
3. **Register User**: Use "Register User" endpoint
4. **Approve User**: Use "Approve User" endpoint with admin token
5. **Login as User**: Use "Login" to test user access
6. **Test Protected Routes**: Use user token for protected endpoints
7. **Test Permissions**: Use permission management endpoints to manage user permissions
8. **Test Role Management**: 
   - Use "Create Role" to create a custom role
   - Use "Assign Role to User" to assign the role
   - Test role-based access control

### Environment Variables
Create these collection variables:
- `baseUrl`: `http://localhost:3001`
- `accessToken`: (empty - will be set automatically)
- `refreshToken`: (empty - will be set automatically) 
- `userId`: (empty - will be set automatically)
- `adminAccessToken`: (empty - will be set automatically)
- `roleId`: (empty - will be set automatically when creating roles)

### Permission Management

**New Permission Endpoints:**
- **Get All Permissions**: `GET /api/v1/auth/permissions` - List all available permissions
- **Get User Permissions**: `GET /api/v1/auth/users/:id/permissions` - Get specific user's permissions
- **Update User Permissions**: `PATCH /api/v1/auth/users/:id/permissions` - Update user's permissions

**Role Management Endpoints:**
- **Create Role**: `POST /api/v1/roles` - Create new custom role
- **Get All Roles**: `GET /api/v1/roles` - List all custom roles
- **Get Role**: `GET /api/v1/roles/:id` - Get specific role details
- **Update Role**: `PATCH /api/v1/roles/:id` - Update role permissions
- **Delete Role**: `DELETE /api/v1/roles/:id` - Delete custom role
- **Assign Role**: `PATCH /api/v1/roles/users/:id/assign` - Assign role to user
- **Remove Role**: `PATCH /api/v1/roles/users/:id/remove` - Remove role from user
- **Get Users with Role**: `GET /api/v1/roles/users/:roleId` - List users with specific role

**Permission Categories:**
- **User Management**: `users:read`, `users:create`, `users:update`, `users:delete`, `users:approve`, `users:ban`
- **Content Management**: `content:read`, `content:create`, `content:update`, `content:delete`, `content:publish`
- **System**: `system:read`, `system:update`, `system:backup`, `system:logs`
- **Profile**: `profile:read`, `profile:update`
- **Admin**: `admin:dashboard`, `admin:settings`, `admin:analytics`
- **Role Management**: `roles:read`, `roles:create`, `roles:update`, `roles:delete`

**Example Role Creation:**
```json
{
  "name": "content_manager",
  "displayName": "Content Manager",
  "description": "Can manage content but not users",
  "permissions": [
    "content:read",
    "content:create",
    "content:update",
    "content:delete",
    "content:publish",
    "profile:read",
    "profile:update"
  ]
}
```

**Example Permission Update:**
```json
{
  "permissions": [
    "profile:read",
    "profile:update", 
    "content:read",
    "content:create"
  ]
}
```

### Important Notes

- All test scripts automatically save tokens to collection variables
- Admin endpoints require `{{adminAccessToken}}` in Authorization header
- User endpoints require `{{accessToken}}` in Authorization header
- The collection includes comprehensive test assertions
- Environment variables are automatically updated after successful requests

## Quick Start

1. Start your server: `npm run dev`
2. Import the collection into Postman
3. Run "Register Super Admin" then "Login as Admin"
4. Run "Register User" then "Approve User" (using admin token)
5. Test the full authentication flow
6. **Test Permissions**: 
   - Use "Get All Permissions" to see available permissions
   - Use "Get User Permissions" to check user's current permissions
   - Use "Update User Permissions" to modify user access
7. **Test Role Management**:
   - Use "Create Role" to create a custom role (roleId will be saved automatically)
   - Use "Assign Role to User" to assign the role to a user
   - Test role-based access control with different permission levels
   - Use "Get Users with Role" to see which users have the role

The collection is ready to test all authentication features including JWT tokens, user approval, admin functions, security features, permission-based access control, and the new custom role management system.
