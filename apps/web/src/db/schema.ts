import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";

export const licenses = pgTable("licenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  email: text("email").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeCheckoutSessionId: text("stripe_checkout_session_id"),
  status: text("status").notNull().default("active"), // active | revoked | pending

  // Validação simplificada: conta quantas vezes validou
  validationCount: integer("validation_count").notNull().default(0),
  lastValidatedAt: timestamp("last_validated_at"),

  // JWT token para validação offline (assinado pelo servidor)
  offlineToken: text("offline_token"),

  // Rastreamento de doações
  donationAmount: integer("donation_amount").default(0), // Em unidades da moeda (ex: 25 BRL, 5 EUR)
  donationCurrency: text("donation_currency"), // BRL, EUR, GBP

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
