import { hash } from 'bcryptjs'
import { and, eq, isNull } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from '@/db/schema'
import addresses from '@/db/schema/addresses'
import categories from '@/db/schema/categories'
import products from '@/db/schema/products'
import stores from '@/db/schema/stores'
import users from '@/db/schema/users'
import { env } from '@/env'
import { createSlug } from '@/utils/slug'

type SeedCategory = {
  name: string
  slug: string
  description: string
}

type SeedProduct = {
  categorySlug: string
  name: string
  description: string
  priceInCents: number
  stock: number
}

type SeedStore = {
  store: {
    name: string
    description: string
    cnpj: string
    phone: string
  }
  address: {
    street: string
    number: string
    complement: string
    district: string
    city: string
    state: string
    zipCode: string
  }
  products: SeedProduct[]
}

const seedPassword = '12345678'

const seedAdmin = {
  name: 'Hub44 Admin',
  email: 'admin@seed.hub44.test',
  phone: '62999999999',
}

const seedCategories: SeedCategory[] = [
  {
    name: 'Moda Feminina',
    slug: 'moda-feminina',
    description:
      'Roupas femininas como blusas, vestidos, calças, saias e conjuntos',
  },
  {
    name: 'Moda Masculina',
    slug: 'moda-masculina',
    description:
      'Roupas masculinas como camisetas, bermudas, calças, jaquetas e acessórios',
  },
  {
    name: 'Moda Infantil',
    slug: 'moda-infantil',
    description:
      'Roupas para bebês e crianças, incluindo conjuntos, vestidos, bodies e peças infantis',
  },
  {
    name: 'Jeans',
    slug: 'jeans',
    description:
      'Peças jeans masculinas, femininas e unissex, como calças, jaquetas e shorts',
  },
  {
    name: 'Eletrônicos',
    slug: 'eletronicos',
    description:
      'Produtos eletrônicos, gadgets, acessórios digitais e dispositivos tecnológicos',
  },
  {
    name: 'Acessórios para Celular',
    slug: 'acessorios-para-celular',
    description:
      'Capinhas, películas, carregadores, cabos, suportes e itens para smartphones',
  },
  {
    name: 'Utilidades Domésticas',
    slug: 'utilidades-domesticas',
    description:
      'Produtos úteis para casa, organização, cozinha, banheiro e uso diário',
  },
  {
    name: 'Iluminação',
    slug: 'iluminacao',
    description: 'Lâmpadas, fitas LED, extensões e acessórios de iluminação',
  },
  {
    name: 'Bolsas e Acessórios',
    slug: 'bolsas-e-acessorios',
    description:
      'Bolsas, carteiras, óculos, bijuterias, bonés e acessórios de moda',
  },
  {
    name: 'Importados',
    slug: 'importados',
    description:
      'Produtos populares importados, itens criativos, acessórios e utilidades variadas',
  },
]

const seedStores: SeedStore[] = [
  {
    store: {
      name: 'Vitrine Bella',
      description:
        'Loja de moda feminina com roupas casuais, vestidos e peças modernas',
      cnpj: '12845678000191',
      phone: '62998123401',
    },
    address: {
      street: 'R. 44',
      number: '120',
      complement: 'Loja 01',
      district: 'Setor Norte Ferroviário',
      city: 'Goiânia',
      state: 'GO',
      zipCode: '74063350',
    },
    products: [
      {
        categorySlug: 'moda-feminina',
        name: 'Blusa feminina canelada',
        description:
          'Blusa básica canelada, confortável e ideal para looks casuais',
        priceInCents: 4990,
        stock: 35,
      },
      {
        categorySlug: 'moda-feminina',
        name: 'Calça pantalona feminina',
        description:
          'Calça pantalona em tecido leve, com cintura alta e ótimo caimento',
        priceInCents: 8990,
        stock: 18,
      },
      {
        categorySlug: 'moda-feminina',
        name: 'Vestido midi estampado',
        description:
          'Vestido midi com estampa floral, ideal para uso diário ou eventos',
        priceInCents: 11990,
        stock: 12,
      },
    ],
  },
  {
    store: {
      name: 'Connect Imports',
      description:
        'Loja de eletrônicos, acessórios para celular, cabos e produtos importados',
      cnpj: '23456789000112',
      phone: '62998123402',
    },
    address: {
      street: 'R. 44',
      number: '135',
      complement: 'Loja 02',
      district: 'Setor Norte Ferroviário',
      city: 'Goiânia',
      state: 'GO',
      zipCode: '74063350',
    },
    products: [
      {
        categorySlug: 'eletronicos',
        name: 'Cabo USB-C reforçado 1m',
        description:
          'Cabo USB-C com revestimento reforçado para carregamento rápido',
        priceInCents: 2990,
        stock: 80,
      },
      {
        categorySlug: 'eletronicos',
        name: 'Carregador turbo 20W',
        description:
          'Carregador de tomada com saída USB-C e suporte a carregamento rápido',
        priceInCents: 5990,
        stock: 45,
      },
      {
        categorySlug: 'eletronicos',
        name: 'Fone Bluetooth sem fio',
        description:
          'Fone de ouvido Bluetooth compacto com estojo de carregamento',
        priceInCents: 8990,
        stock: 30,
      },
    ],
  },
  {
    store: {
      name: 'Urban Club',
      description:
        'Loja de moda masculina e streetwear com camisetas, bermudas e acessórios',
      cnpj: '34567890000123',
      phone: '62998123403',
    },
    address: {
      street: 'R. 44',
      number: '150',
      complement: 'Loja 03',
      district: 'Setor Norte Ferroviário',
      city: 'Goiânia',
      state: 'GO',
      zipCode: '74063350',
    },
    products: [
      {
        categorySlug: 'moda-masculina',
        name: 'Camiseta oversized masculina',
        description:
          'Camiseta oversized em algodao, estilo urbano e confortável',
        priceInCents: 6990,
        stock: 40,
      },
      {
        categorySlug: 'moda-masculina',
        name: 'Bermuda cargo masculina',
        description: 'Bermuda cargo com bolsos laterais e tecido resistente',
        priceInCents: 9990,
        stock: 22,
      },
      {
        categorySlug: 'moda-masculina',
        name: 'Boné aba curva street',
        description: 'Boné casual com regulagem traseira e acabamento bordado',
        priceInCents: 4490,
        stock: 50,
      },
    ],
  },
  {
    store: {
      name: 'Casa Prática',
      description:
        'Loja de utilidades domésticas, organizadores e produtos práticos para o dia a dia',
      cnpj: '45678901000134',
      phone: '62998123404',
    },
    address: {
      street: 'R. 44',
      number: '165',
      complement: 'Loja 04',
      district: 'Setor Norte Ferroviário',
      city: 'Goiânia',
      state: 'GO',
      zipCode: '74063350',
    },
    products: [
      {
        categorySlug: 'utilidades-domesticas',
        name: 'Organizador multiuso transparente',
        description:
          'Caixa organizadora transparente para armários, cozinha ou escritório',
        priceInCents: 3490,
        stock: 60,
      },
      {
        categorySlug: 'utilidades-domesticas',
        name: 'Suporte adesivo para parede',
        description:
          'Suporte adesivo resistente para banheiro, cozinha ou área de serviço',
        priceInCents: 1990,
        stock: 90,
      },
      {
        categorySlug: 'utilidades-domesticas',
        name: 'Kit potes herméticos',
        description: 'Conjunto com potes herméticos para armazenar alimentos',
        priceInCents: 5490,
        stock: 28,
      },
    ],
  },
  {
    store: {
      name: 'Pequenos Encantos',
      description:
        'Loja de roupas infantis com peças confortáveis para bebês e crianças',
      cnpj: '56789012000145',
      phone: '62998123405',
    },
    address: {
      street: 'R. 44',
      number: '180',
      complement: 'Loja 05',
      district: 'Setor Norte Ferroviário',
      city: 'Goiânia',
      state: 'GO',
      zipCode: '74063350',
    },
    products: [
      {
        categorySlug: 'moda-infantil',
        name: 'Conjunto infantil camiseta e short',
        description:
          'Conjunto infantil leve com camiseta estampada e short confortável',
        priceInCents: 7990,
        stock: 25,
      },
      {
        categorySlug: 'moda-infantil',
        name: 'Vestido infantil floral',
        description: 'Vestido infantil com estampa floral e tecido macio',
        priceInCents: 6990,
        stock: 20,
      },
      {
        categorySlug: 'moda-infantil',
        name: 'Body bebê algodao',
        description: 'Body para bebê em algodao, com fechamento por botões',
        priceInCents: 3990,
        stock: 45,
      },
    ],
  },
  {
    store: {
      name: 'Smart Case',
      description:
        'Loja especializada em capinhas, películas, suportes e acessórios para smartphones',
      cnpj: '67890123000156',
      phone: '62998123406',
    },
    address: {
      street: 'R. 44',
      number: '195',
      complement: 'Loja 06',
      district: 'Setor Norte Ferroviário',
      city: 'Goiânia',
      state: 'GO',
      zipCode: '74063350',
    },
    products: [
      {
        categorySlug: 'acessorios-para-celular',
        name: 'Capinha silicone transparente',
        description:
          'Capinha flexível transparente com proteção contra impactos leves',
        priceInCents: 2490,
        stock: 100,
      },
      {
        categorySlug: 'acessorios-para-celular',
        name: 'Película de vidro 3D',
        description:
          'Película de vidro temperado com cobertura de borda completa',
        priceInCents: 2990,
        stock: 85,
      },
      {
        categorySlug: 'acessorios-para-celular',
        name: 'Suporte veicular magnético',
        description:
          'Suporte magnético para celular com fixação em saida de ar',
        priceInCents: 3990,
        stock: 40,
      },
    ],
  },
  {
    store: {
      name: 'Jeans Prime',
      description:
        'Loja de jeans masculino e feminino com variedade de modelos e preços acessíveis',
      cnpj: '78901234000167',
      phone: '62998123407',
    },
    address: {
      street: 'R. 44',
      number: '210',
      complement: 'Loja 07',
      district: 'Setor Norte Ferroviário',
      city: 'Goiânia',
      state: 'GO',
      zipCode: '74063350',
    },
    products: [
      {
        categorySlug: 'jeans',
        name: 'Calça jeans skinny feminina',
        description: 'Calça jeans feminina modelo skinny com elastano',
        priceInCents: 10990,
        stock: 30,
      },
      {
        categorySlug: 'jeans',
        name: 'Calça jeans masculina reta',
        description: 'Calça jeans masculina tradicional com corte reto',
        priceInCents: 11990,
        stock: 24,
      },
      {
        categorySlug: 'jeans',
        name: 'Jaqueta jeans unissex',
        description:
          'Jaqueta jeans unissex com lavagem clara e bolsos frontais',
        priceInCents: 15990,
        stock: 10,
      },
    ],
  },
  {
    store: {
      name: 'Mundo LED',
      description:
        'Loja de iluminação LED, fitas decorativas e acessórios elétricos simples',
      cnpj: '89012345000178',
      phone: '62998123408',
    },
    address: {
      street: 'R. 44',
      number: '225',
      complement: 'Loja 08',
      district: 'Setor Norte Ferroviário',
      city: 'Goiânia',
      state: 'GO',
      zipCode: '74063350',
    },
    products: [
      {
        categorySlug: 'iluminacao',
        name: 'Fita LED RGB 5 metros',
        description:
          'Fita LED RGB com controle remoto para decoração de ambientes',
        priceInCents: 6990,
        stock: 35,
      },
      {
        categorySlug: 'iluminacao',
        name: 'Lâmpada LED econômica 12W',
        description: 'Lâmpada LED branca fria com baixo consumo de energia',
        priceInCents: 1590,
        stock: 120,
      },
      {
        categorySlug: 'iluminacao',
        name: 'Extensão elétrica 3 tomadas',
        description: 'Extensão elétrica com 3 tomadas e cabo de 1,5 metro',
        priceInCents: 3490,
        stock: 55,
      },
    ],
  },
  {
    store: {
      name: 'Bella Acessórios',
      description:
        'Loja de bolsas, bijuterias, carteiras, óculos e acessórios variados',
      cnpj: '90123456000189',
      phone: '62998123409',
    },
    address: {
      street: 'R. 44',
      number: '240',
      complement: 'Loja 09',
      district: 'Setor Norte Ferroviário',
      city: 'Goiânia',
      state: 'GO',
      zipCode: '74063350',
    },
    products: [
      {
        categorySlug: 'bolsas-e-acessorios',
        name: 'Bolsa transversal feminina',
        description: 'Bolsa transversal compacta com alça ajustável',
        priceInCents: 7990,
        stock: 25,
      },
      {
        categorySlug: 'bolsas-e-acessorios',
        name: 'Óculos de sol casual',
        description: 'Óculos de sol com armação leve e design moderno',
        priceInCents: 4990,
        stock: 45,
      },
      {
        categorySlug: 'bolsas-e-acessorios',
        name: 'Kit bijuterias douradas',
        description:
          'Conjunto com brincos, colar e pulseira em acabamento dourado',
        priceInCents: 5990,
        stock: 30,
      },
    ],
  },
  {
    store: {
      name: 'Gadget Popular',
      description:
        'Loja de gadgets, produtos criativos, cabos, suportes e acessórios tecnológicos populares',
      cnpj: '11223344000110',
      phone: '62998123410',
    },
    address: {
      street: 'R. 44',
      number: '255',
      complement: 'Loja 10',
      district: 'Setor Norte Ferroviário',
      city: 'Goiânia',
      state: 'GO',
      zipCode: '74063350',
    },
    products: [
      {
        categorySlug: 'importados',
        name: 'Mini teclado Bluetooth',
        description:
          'Mini teclado sem fio compatível com tablets, celulares e smart TVs',
        priceInCents: 8990,
        stock: 20,
      },
      {
        categorySlug: 'importados',
        name: 'Ring light de mesa',
        description:
          'Ring light compacto com suporte para celular e ajuste de intensidade',
        priceInCents: 7990,
        stock: 32,
      },
      {
        categorySlug: 'importados',
        name: 'Hub USB 4 portas',
        description:
          'Adaptador hub USB com 4 portas para notebooks e computadores',
        priceInCents: 4990,
        stock: 38,
      },
    ],
  },
]

const pool = new Pool({ connectionString: env.DATABASE_URL })
const db = drizzle(pool, { schema, casing: 'snake_case' })

async function main() {
  const passwordHash = await hash(seedPassword, 8)
  const categoriesBySlug = new Map<string, { id: string }>()
  let productCount = 0

  await db
    .insert(users)
    .values({
      ...seedAdmin,
      passwordHash,
      role: 'admin',
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        ...seedAdmin,
        passwordHash,
        role: 'admin',
        updatedAt: new Date(),
      },
    })

  for (const category of seedCategories) {
    const [record] = await db
      .insert(categories)
      .values(category)
      .onConflictDoUpdate({
        target: categories.slug,
        set: {
          name: category.name,
          description: category.description,
          updatedAt: new Date(),
        },
      })
      .returning({ id: categories.id, slug: categories.slug })

    categoriesBySlug.set(record.slug, record)
  }

  for (const seedStore of seedStores) {
    const storeSlug = createSlug(seedStore.store.name)
    const ownerEmail = `${storeSlug}@seed.hub44.test`

    const [owner] = await db
      .insert(users)
      .values({
        name: `${seedStore.store.name} Admin`,
        email: ownerEmail,
        phone: seedStore.store.phone,
        passwordHash,
        role: 'seller',
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          name: `${seedStore.store.name} Admin`,
          phone: seedStore.store.phone,
          passwordHash,
          role: 'seller',
          updatedAt: new Date(),
        },
      })
      .returning({ id: users.id })

    const [store] = await db
      .insert(stores)
      .values({
        ownerId: owner.id,
        name: seedStore.store.name,
        slug: storeSlug,
        description: seedStore.store.description,
        cnpj: seedStore.store.cnpj,
        phone: seedStore.store.phone,
        status: 'approved',
      })
      .onConflictDoUpdate({
        target: stores.slug,
        set: {
          ownerId: owner.id,
          name: seedStore.store.name,
          description: seedStore.store.description,
          cnpj: seedStore.store.cnpj,
          phone: seedStore.store.phone,
          status: 'approved',
          updatedAt: new Date(),
        },
      })
      .returning({ id: stores.id })

    await upsertStoreAddress(store.id, seedStore)

    for (const seedProduct of seedStore.products) {
      const category = categoriesBySlug.get(seedProduct.categorySlug)

      if (!category) {
        throw new Error(`Missing seed category ${seedProduct.categorySlug}`)
      }

      await db
        .insert(products)
        .values({
          storeId: store.id,
          categoryId: category.id,
          name: seedProduct.name,
          slug: createSlug(seedProduct.name),
          description: seedProduct.description,
          priceInCents: seedProduct.priceInCents,
          stock: seedProduct.stock,
          status: 'active',
        })
        .onConflictDoUpdate({
          target: [products.storeId, products.slug],
          set: {
            categoryId: category.id,
            name: seedProduct.name,
            description: seedProduct.description,
            priceInCents: seedProduct.priceInCents,
            stock: seedProduct.stock,
            status: 'active',
            updatedAt: new Date(),
          },
        })

      productCount += 1
    }
  }

  console.info(
    `Seed concluido: ${seedCategories.length} categorias, ${seedStores.length} lojas e ${productCount} produtos.`,
  )
  console.info(`Usuario admin: ${seedAdmin.email} / senha "${seedPassword}".`)
  console.info(
    `Usuarios lojistas usam senha padrao "${seedPassword}" e emails no dominio seed.hub44.test.`,
  )
}

async function upsertStoreAddress(storeId: string, seedStore: SeedStore) {
  const [existingAddress] = await db
    .select({ id: addresses.id })
    .from(addresses)
    .where(and(eq(addresses.storeId, storeId), isNull(addresses.userId)))
    .limit(1)

  const addressValues = {
    userId: null,
    storeId,
    recipient: seedStore.store.name,
    street: seedStore.address.street,
    number: seedStore.address.number,
    complement: seedStore.address.complement,
    district: seedStore.address.district,
    city: seedStore.address.city,
    state: seedStore.address.state,
    zipCode: seedStore.address.zipCode,
    isPrimary: true,
  }

  if (existingAddress) {
    await db
      .update(addresses)
      .set({ ...addressValues, updatedAt: new Date() })
      .where(eq(addresses.id, existingAddress.id))
    return
  }

  await db.insert(addresses).values(addressValues)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })
