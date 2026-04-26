import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

export const userRoles = pgEnum('user_role', ['customer', 'seller', 'admin'])

const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  phone: text('phone'),
  role: userRoles('role').notNull().default('customer'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export default users
