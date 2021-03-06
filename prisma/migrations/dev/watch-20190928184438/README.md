# Migration `watch-20190928184438`

This migration has been generated by Oleksandr Pronin at 9/28/2019, 6:44:38 PM.
You can check out the [state of the datamodel](./datamodel.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "boilerplate$dev"."User" (
  "createdAt" timestamp(3) NOT NULL DEFAULT '1970-01-01 00:00:00' ,
  "email" text   ,
  "id" text NOT NULL  ,
  "lastName" text   ,
  "name" text   ,
  "password" text   ,
  "picture" text   ,
  "signupType" text NOT NULL DEFAULT 'UNDEFINED' ,
  "updatedAt" timestamp(3) NOT NULL DEFAULT '1970-01-01 00:00:00' ,
  PRIMARY KEY ("id")
);

CREATE TABLE "boilerplate$dev"."AuthProvider" (
  "id" text NOT NULL  ,
  "token" text NOT NULL DEFAULT '' ,
  "type" text NOT NULL DEFAULT 'GOOGLE' ,
  "userId" text NOT NULL DEFAULT '' ,
  PRIMARY KEY ("id")
);

ALTER TABLE "boilerplate$dev"."AuthProvider" ADD COLUMN "user" text   REFERENCES "boilerplate$dev"."User"("id") ON DELETE SET NULL;
```

## Changes

```diff
diff --git datamodel.mdl datamodel.mdl
migration ..watch-20190928184438
--- datamodel.dml
+++ datamodel.dml
@@ -1,0 +1,37 @@
+generator photon {
+  provider = "photonjs"
+  output   = "../node_modules/@generated/photon"
+}
+
+datasource db {
+  provider = "postgresql"
+  url      = env("POSTGRESQL_URL")
+}
+
+model User {
+  id           String         @default(cuid()) @id
+  authProvider AuthProvider[]
+  createdAt    DateTime       @default(now())
+  email        String?
+  lastName     String?
+  name         String?
+  password     String?
+  picture      String?
+  signupType   AuthProviderType @default(UNDEFINED)
+  updatedAt    DateTime       @updatedAt
+}
+
+model AuthProvider {
+  id     String @default(cuid()) @id
+  token  String
+  type   AuthProviderType
+  user   User
+  userId String
+}
+
+enum AuthProviderType {
+    GOOGLE
+    FACEBOOK
+    EMAIL
+    UNDEFINED
+}
```

## Photon Usage

You can use a specific Photon built for this migration (watch-20190928184438)
in your `before` or `after` migration script like this:

```ts
import Photon from '@generated/photon/watch-20190928184438'

const photon = new Photon()

async function main() {
  const result = await photon.users()
  console.dir(result, { depth: null })
}

main()

```
