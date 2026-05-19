#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var import_sdk = require("@infisical/sdk");
var import_fs = __toESM(require("fs"));
var import_axios = __toESM(require("axios"));
var import_path = __toESM(require("path"));
var import_server = require("@modelcontextprotocol/sdk/server/index.js");
var import_stdio = require("@modelcontextprotocol/sdk/server/stdio.js");
var import_types = require("@modelcontextprotocol/sdk/types.js");
var import_zod = require("zod");
var InfisicalAuthMethod = /* @__PURE__ */ ((InfisicalAuthMethod2) => {
  InfisicalAuthMethod2["UniversalAuth"] = "universal-auth";
  InfisicalAuthMethod2["TokenAuth"] = "access-token";
  return InfisicalAuthMethod2;
})(InfisicalAuthMethod || {});
var packageJson = JSON.parse(
  import_fs.default.readFileSync(import_path.default.join(__dirname, "../package.json"), "utf-8")
);
var getEnvironmentVariables = () => {
  const envSchema = import_zod.z.object({
    INFISICAL_AUTH_METHOD: import_zod.z.nativeEnum(InfisicalAuthMethod).default("universal-auth" /* UniversalAuth */),
    INFISICAL_TOKEN: import_zod.z.string().trim().min(1).optional(),
    INFISICAL_UNIVERSAL_AUTH_CLIENT_ID: import_zod.z.string().trim().min(1).optional(),
    INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET: import_zod.z.string().trim().min(1).optional(),
    INFISICAL_HOST_URL: import_zod.z.string().default("https://app.infisical.com")
  }).superRefine((data, ctx) => {
    const missingClientIdOrClientSecret = !data.INFISICAL_UNIVERSAL_AUTH_CLIENT_ID || !data.INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET;
    const missingToken = !data.INFISICAL_TOKEN;
    switch (data.INFISICAL_AUTH_METHOD) {
      case "universal-auth" /* UniversalAuth */:
        if (missingClientIdOrClientSecret) {
          ctx.addIssue({
            code: import_zod.z.ZodIssueCode.custom,
            message: "Authentication method is set to universal auth, but INFISICAL_UNIVERSAL_AUTH_CLIENT_ID or INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET is not set"
          });
        }
        break;
      case "access-token" /* TokenAuth */:
        if (missingToken) {
          ctx.addIssue({
            code: import_zod.z.ZodIssueCode.custom,
            message: "Authentication method is set to token auth, but INFISICAL_TOKEN is not set"
          });
        }
        break;
      default:
        ctx.addIssue({
          code: import_zod.z.ZodIssueCode.custom,
          message: `Unsupported authentication method: ${data.INFISICAL_AUTH_METHOD}`
        });
        break;
    }
  }).parse(process.env);
  return envSchema;
};
var env = getEnvironmentVariables();
var isAuthenticated = false;
var infisicalSdk = new import_sdk.InfisicalSDK({
  siteUrl: env.INFISICAL_HOST_URL
});
var handleAuthentication = () => __async(exports, null, function* () {
  if (isAuthenticated) {
    return;
  }
  switch (env.INFISICAL_AUTH_METHOD) {
    case "universal-auth" /* UniversalAuth */:
      yield infisicalSdk.auth().universalAuth.login({
        clientId: env.INFISICAL_UNIVERSAL_AUTH_CLIENT_ID,
        clientSecret: env.INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET
      });
      break;
    case "access-token" /* TokenAuth */:
      infisicalSdk.auth().accessToken(env.INFISICAL_TOKEN);
      break;
    default:
      throw new Error(
        `Unsupported authentication method: ${env.INFISICAL_AUTH_METHOD}`
      );
  }
  isAuthenticated = true;
});
var server = new import_server.Server(
  {
    name: "Infisical",
    version: packageJson.version
  },
  {
    capabilities: {
      tools: {}
    }
  }
);
var createSecretSchema = {
  zod: import_zod.z.object({
    projectId: import_zod.z.string(),
    environmentSlug: import_zod.z.string(),
    secretName: import_zod.z.string(),
    secretValue: import_zod.z.string().optional(),
    secretPath: import_zod.z.string().default("/")
  }),
  capability: {
    name: "create-secret" /* CreateSecret */,
    description: "Create a new secret in Infisical",
    inputSchema: {
      type: "object",
      properties: {
        projectId: {
          type: "string",
          description: "The ID of the project to create the secret in (required)"
        },
        environmentSlug: {
          type: "string",
          description: "The slug of the environment to create the secret in (required)"
        },
        secretName: {
          type: "string",
          description: "The name of the secret to create (required)"
        },
        secretValue: {
          type: "string",
          description: "The value of the secret to create"
        },
        secretPath: {
          type: "string",
          description: "The path of the secret to create (Defaults to /)"
        }
      },
      required: ["projectId", "environmentSlug", "secretName"]
    }
  }
};
var deleteSecretSchema = {
  zod: import_zod.z.object({
    projectId: import_zod.z.string(),
    environmentSlug: import_zod.z.string(),
    secretPath: import_zod.z.string().default("/"),
    secretName: import_zod.z.string()
  }),
  capability: {
    name: "delete-secret" /* DeleteSecret */,
    description: "Delete a secret in Infisical",
    inputSchema: {
      type: "object",
      properties: {
        projectId: {
          type: "string",
          description: "The ID of the project to delete the secret from (required)"
        },
        environmentSlug: {
          type: "string",
          description: "The slug of the environment to delete the secret from (required)"
        },
        secretPath: {
          type: "string",
          description: "The path of the secret to delete (Defaults to /)"
        },
        secretName: {
          type: "string",
          description: "The name of the secret to delete (required)"
        }
      },
      required: ["projectId", "environmentSlug", "secretName"]
    }
  }
};
var updateSecretSchema = {
  zod: import_zod.z.object({
    projectId: import_zod.z.string(),
    environmentSlug: import_zod.z.string(),
    secretName: import_zod.z.string(),
    newSecretName: import_zod.z.string().optional(),
    secretValue: import_zod.z.string().optional(),
    secretPath: import_zod.z.string().default("/")
  }),
  capability: {
    name: "update-secret" /* UpdateSecret */,
    description: "Update a secret in Infisical",
    inputSchema: {
      type: "object",
      properties: {
        projectId: {
          type: "string",
          description: "The ID of the project to update the secret in (required)"
        },
        environmentSlug: {
          type: "string",
          description: "The slug of the environment to update the secret in (required)"
        },
        secretName: {
          type: "string",
          description: "The current name of the secret to update (required)"
        },
        newSecretName: {
          type: "string",
          description: "The new name of the secret to update (Optional)"
        },
        secretValue: {
          type: "string",
          description: "The new value of the secret to update (Optional)"
        },
        secretPath: {
          type: "string",
          description: "The path of the secret to update (Defaults to /)"
        }
      },
      required: ["projectId", "environmentSlug", "secretName"]
    }
  }
};
var listSecretsSchema = {
  zod: import_zod.z.object({
    projectId: import_zod.z.string(),
    environmentSlug: import_zod.z.string(),
    secretPath: import_zod.z.string().default("/"),
    expandSecretReferences: import_zod.z.boolean().default(true),
    includeImports: import_zod.z.boolean().default(true)
  }),
  capability: {
    name: "list-secrets" /* ListSecrets */,
    description: "List all secrets in a given Infisical project and environment",
    inputSchema: {
      type: "object",
      properties: {
        projectId: {
          type: "string",
          description: "The ID of the project to list the secrets from (required)"
        },
        environmentSlug: {
          type: "string",
          description: "The slug of the environment to list the secrets from (required)"
        },
        secretPath: {
          type: "string",
          description: "The path of the secrets to list (Defaults to /)"
        },
        expandSecretReferences: {
          type: "boolean",
          description: "Whether to expand secret references (Defaults to true)"
        },
        includeImports: {
          type: "boolean",
          description: "Whether to include secret imports (Defaults to true)"
        }
      },
      required: ["projectId", "environmentSlug"]
    }
  }
};
var getSecretSchema = {
  zod: import_zod.z.object({
    secretName: import_zod.z.string(),
    projectId: import_zod.z.string(),
    environmentSlug: import_zod.z.string(),
    secretPath: import_zod.z.string().default("/"),
    expandSecretReferences: import_zod.z.boolean().default(true),
    includeImports: import_zod.z.boolean().default(true)
  }),
  capability: {
    name: "get-secret" /* GetSecret */,
    description: "Get a secret in Infisical",
    inputSchema: {
      type: "object",
      properties: {
        secretName: {
          type: "string",
          description: "The name of the secret to get (required)"
        },
        projectId: {
          type: "string",
          description: "The ID of the project to get the secret from (required)"
        },
        environmentSlug: {
          type: "string",
          description: "The slug of the environment to get the secret from (required)"
        },
        secretPath: {
          type: "string",
          description: "The path of the secret to get (Defaults to /)"
        },
        expandSecretReferences: {
          type: "boolean",
          description: "Whether to expand secret references (Defaults to true)"
        },
        includeImports: {
          type: "boolean",
          description: "Whether to include secret imports. If the secret isn't found, it will try to find a secret in a secret import that matches the requested secret name (Defaults to true)"
        }
      },
      required: ["projectId", "environmentSlug", "secretName"]
    }
  }
};
var createProjectSchema = {
  zod: import_zod.z.object({
    projectName: import_zod.z.string(),
    type: import_zod.z.enum(["secret-manager", "cert-manager", "kms", "ssh"]),
    description: import_zod.z.string().optional(),
    slug: import_zod.z.string().optional(),
    projectTemplate: import_zod.z.string().optional(),
    kmsKeyId: import_zod.z.string().optional()
  }),
  capability: {
    name: "create-project" /* CreateProject */,
    description: "Create a new project in Infisical",
    inputSchema: {
      type: "object",
      properties: {
        projectName: {
          type: "string",
          description: "The name of the project to create (required)"
        },
        type: {
          type: "string",
          description: "The type of project to create (required). If not specified by the user, ask them to confirm the type they want to use."
        },
        description: {
          type: "string",
          description: "The description of the project to create"
        },
        slug: {
          type: "string",
          description: "The slug of the project to create"
        },
        projectTemplate: {
          type: "string",
          description: "The template of the project to create"
        },
        kmsKeyId: {
          type: "string",
          description: "The ID of the KMS key to use for the project. Defaults to Infisical's default KMS"
        }
      },
      required: ["projectName", "type"]
    }
  }
};
var createEnvironmentSchema = {
  zod: import_zod.z.object({
    projectId: import_zod.z.string(),
    name: import_zod.z.string(),
    slug: import_zod.z.string(),
    position: import_zod.z.number().optional()
  }),
  capability: {
    name: "create-environment" /* CreateEnvironment */,
    description: "Create a new environment in Infisical",
    inputSchema: {
      type: "object",
      properties: {
        projectId: {
          type: "string",
          description: "The ID of the project to create the environment in (required)"
        },
        name: {
          type: "string",
          description: "The name of the environment to create (required)"
        },
        slug: {
          type: "string",
          description: "The slug of the environment to create (required)"
        },
        position: {
          type: "number",
          description: "The position of the environment to create"
        }
      },
      required: ["projectId", "name", "slug"]
    }
  }
};
var createFolderSchema = {
  zod: import_zod.z.object({
    description: import_zod.z.string().optional(),
    environment: import_zod.z.string(),
    name: import_zod.z.string(),
    path: import_zod.z.string().default("/"),
    projectId: import_zod.z.string()
  }),
  capability: {
    name: "create-folder" /* CreateFolder */,
    description: "Create a new folder in Infisical",
    inputSchema: {
      type: "object",
      properties: {
        description: {
          type: "string",
          description: "The description of the folder to create"
        },
        environment: {
          type: "string",
          description: "The environment to create the folder in (required)"
        },
        name: {
          type: "string",
          description: "The name of the folder to create (required)"
        },
        path: {
          type: "string",
          description: "The path to create the folder in (Defaults to /)"
        },
        projectId: {
          type: "string",
          description: "The project to create the folder in (required)"
        }
      },
      required: ["name", "projectId", "environment"]
    }
  }
};
var listProjectsSchema = {
  zod: import_zod.z.object({
    type: import_zod.z.enum(["secret-manager", "cert-manager", "kms", "ssh", "all"]).default("all")
  }),
  capability: {
    name: "list-projects" /* ListProjects */,
    description: "List all projects in Infisical that the machine identity has access to. If the user asks to list all projects, use the `all` type parameter.",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          description: "The type of projects to retrieve. If not specified, `all` projects will be retrieved."
        }
      }
    }
  }
};
var inviteMembersToProjectSchema = {
  zod: import_zod.z.object({
    projectId: import_zod.z.string(),
    emails: import_zod.z.array(import_zod.z.string()).optional(),
    usernames: import_zod.z.array(import_zod.z.string()).optional(),
    roleSlugs: import_zod.z.array(import_zod.z.string()).optional()
  }),
  capability: {
    name: "invite-members-to-project" /* InviteMembersToProject */,
    description: "Invite members to a project in Infisical",
    inputSchema: {
      type: "object",
      properties: {
        projectId: {
          type: "string",
          description: "The ID of the project to invite members to (required)"
        },
        emails: {
          type: "array",
          description: "The emails of the members to invite. Either usernames or emails must be provided."
        },
        usernames: {
          type: "array",
          description: "The usernames of the members to invite. Either usernames or emails must be provided."
        },
        roleSlugs: {
          type: "array",
          description: "The role slugs of the members to invite. If not provided, the default role 'member' will be used. Ask the user to confirm the role they want to use if not explicitly specified."
        }
      },
      required: ["projectId"]
    }
  }
};
server.setRequestHandler(import_types.ListToolsRequestSchema, () => __async(exports, null, function* () {
  return {
    tools: [
      createSecretSchema.capability,
      deleteSecretSchema.capability,
      updateSecretSchema.capability,
      listSecretsSchema.capability,
      getSecretSchema.capability,
      createProjectSchema.capability,
      createEnvironmentSchema.capability,
      createFolderSchema.capability,
      inviteMembersToProjectSchema.capability,
      listProjectsSchema.capability
    ]
  };
}));
server.setRequestHandler(import_types.CallToolRequestSchema, (req) => __async(exports, null, function* () {
  var _a, _b, _c;
  try {
    yield handleAuthentication();
    const { name, arguments: args } = req.params;
    if (name === "create-secret" /* CreateSecret */) {
      const data = createSecretSchema.zod.parse(args);
      const { secret } = yield infisicalSdk.secrets().createSecret(data.secretName, {
        environment: data.environmentSlug,
        projectId: data.projectId,
        secretPath: data.secretPath,
        secretValue: (_a = data.secretValue) != null ? _a : ""
      });
      return {
        content: [
          {
            type: "text",
            text: `Secret created successfully: ${JSON.stringify(secret, null, 3)}`
          }
        ]
      };
    }
    if (name === "delete-secret" /* DeleteSecret */) {
      const data = deleteSecretSchema.zod.parse(args);
      const { secret } = yield infisicalSdk.secrets().deleteSecret(data.secretName, {
        environment: data.environmentSlug,
        projectId: data.projectId,
        secretPath: data.secretPath
      });
      return {
        content: [
          {
            type: "text",
            text: `Secret deleted successfully: ${secret.secretKey}`
          }
        ]
      };
    }
    if (name === "update-secret" /* UpdateSecret */) {
      const data = updateSecretSchema.zod.parse(args);
      const { secret } = yield infisicalSdk.secrets().updateSecret(data.secretName, {
        environment: data.environmentSlug,
        projectId: data.projectId,
        secretPath: data.secretPath,
        secretValue: (_b = data.secretValue) != null ? _b : ""
      });
      return {
        content: [
          {
            type: "text",
            text: `Secret updated successfully. Updated secret: ${JSON.stringify(secret, null, 3)}`
          }
        ]
      };
    }
    if (name === "list-secrets" /* ListSecrets */) {
      const data = listSecretsSchema.zod.parse(args);
      const secrets = yield infisicalSdk.secrets().listSecrets({
        environment: data.environmentSlug,
        projectId: data.projectId,
        secretPath: data.secretPath,
        expandSecretReferences: data.expandSecretReferences,
        includeImports: data.includeImports
      });
      const response = __spreadValues({
        secrets: secrets.secrets.map((secret) => ({
          secretKey: secret.secretKey,
          secretValue: secret.secretValue
        }))
      }, secrets.imports && {
        imports: (_c = secrets.imports) == null ? void 0 : _c.map((imp) => {
          const parsedImportSecrets = imp.secrets.map((secret) => ({
            secretKey: secret.secretKey,
            secretValue: secret.secretValue
          }));
          return __spreadProps(__spreadValues({}, imp), {
            secrets: parsedImportSecrets
          });
        })
      });
      return {
        content: [
          {
            type: "text",
            text: `${JSON.stringify(response)}`
          }
        ]
      };
    }
    if (name === "get-secret" /* GetSecret */) {
      const data = getSecretSchema.zod.parse(args);
      const secret = yield infisicalSdk.secrets().getSecret({
        environment: data.environmentSlug,
        projectId: data.projectId,
        secretName: data.secretName,
        secretPath: data.secretPath,
        expandSecretReferences: data.expandSecretReferences,
        includeImports: data.includeImports
      });
      return {
        content: [
          {
            type: "text",
            text: `Secret retrieved successfully: ${JSON.stringify(secret, null, 3)}`
          }
        ]
      };
    }
    if (name === "create-project" /* CreateProject */) {
      const data = createProjectSchema.zod.parse(args);
      const project = yield infisicalSdk.projects().create({
        projectName: data.projectName,
        projectDescription: data.description,
        kmsKeyId: data.kmsKeyId,
        slug: data.slug,
        template: data.projectTemplate,
        type: data.type
      });
      return {
        content: [
          {
            type: "text",
            text: `Project created successfully: ${JSON.stringify(project, null, 3)}`
          }
        ]
      };
    }
    if (name === "create-environment" /* CreateEnvironment */) {
      const data = createEnvironmentSchema.zod.parse(args);
      const environment = yield infisicalSdk.environments().create({
        projectId: data.projectId,
        name: data.name,
        slug: data.slug,
        position: data.position
      });
      return {
        content: [
          {
            type: "text",
            text: `Environment created successfully: ${JSON.stringify(environment, null, 3)}`
          }
        ]
      };
    }
    if (name === "create-folder" /* CreateFolder */) {
      const data = createFolderSchema.zod.parse(args);
      const folder = yield infisicalSdk.folders().create({
        description: data.description,
        environment: data.environment,
        name: data.name,
        path: data.path,
        projectId: data.projectId
      });
      return {
        content: [
          {
            type: "text",
            text: `Folder created successfully: ${JSON.stringify(folder, null, 3)}`
          }
        ]
      };
    }
    if (name === "invite-members-to-project" /* InviteMembersToProject */) {
      const data = inviteMembersToProjectSchema.zod.parse(args);
      const projectMemberships = yield infisicalSdk.projects().inviteMembers({
        projectId: data.projectId,
        emails: data.emails,
        usernames: data.usernames,
        roleSlugs: data.roleSlugs
      });
      return {
        content: [
          {
            type: "text",
            text: `Members successfully invited to project: ${JSON.stringify(projectMemberships, null, 3)}`
          }
        ]
      };
    }
    if (name === "list-projects" /* ListProjects */) {
      const data = listProjectsSchema.zod.parse(args);
      const accessToken = infisicalSdk.auth().getAccessToken();
      try {
        let hostUrl = env.INFISICAL_HOST_URL;
        if (!hostUrl.endsWith("/api")) {
          if (hostUrl.endsWith("/")) {
            hostUrl = hostUrl.slice(0, -1);
          }
          hostUrl += "/api";
        }
        const res = yield import_axios.default.get(`${hostUrl}/v1/workspace${data.type && data.type !== "all" ? `?type=${data.type}` : ""}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        const projects = res.data.workspaces.map((workspace) => ({
          hasDeleteProtection: workspace.hasDeleteProtection,
          id: workspace.id,
          name: workspace.name,
          orgId: workspace.orgId,
          slug: workspace.slug,
          type: workspace.type,
          environments: workspace.environments.map((environment) => __spreadValues({}, environment))
        }));
        return {
          content: [
            {
              type: "text",
              text: `Projects retrieved successfully: ${JSON.stringify(projects, null, 3)}`
            }
          ]
        };
      } catch (err) {
        console.error(err);
        return {
          content: [
            {
              type: "text",
              text: `Error retrieving projects: ${err.message}.`
            }
          ]
        };
      }
    }
    throw new Error(`Unrecognized tool name: ${name}`);
  } catch (err) {
    if (err instanceof import_zod.z.ZodError) {
      throw new Error(
        `Invalid arguments: ${err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`
      );
    }
    throw err;
  }
}));
(() => __async(exports, null, function* () {
  yield server.connect(new import_stdio.StdioServerTransport());
  console.error("Infisical MCP Server running on stdio \u2705");
}))();
