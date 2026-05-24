import { hash } from 'bcryptjs'
import { and, eq, isNull } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from '@/db/schema'
import addresses from '@/db/schema/addresses'
import categories from '@/db/schema/categories'
import productImages from '@/db/schema/product-images'
import products from '@/db/schema/products'
import stores from '@/db/schema/stores'
import users from '@/db/schema/users'
import { env } from '@/env'
import { SUPABASE_BUCKET, supabase } from '@/lib/supabase'
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
  storageFolder?: string
}

type SeedStore = {
  store: {
    name: string
    description: string
    cnpj: string
    phone: string
    storageFolder?: string
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

type SeedImageReference = {
  path: string
  imageUrl: string
}

type StorageListItem = {
  id?: string | null
  name: string
  metadata?: unknown
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
const storageFolderCache = new Map<string, StorageListItem[]>()
const missingStorageFolders = new Set<string>()
const seedStorageDebug = process.env.SEED_STORAGE_DEBUG === 'true'

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

  for (const [storeIndex, seedStore] of seedStores.entries()) {
    const storeSlug = createSlug(seedStore.store.name)
    const ownerEmail = `${storeSlug}@seed.hub44.test`
    const fallbackLogoUrl = getSeedAssetUrl('store-logo', storeSlug, {
      label: seedStore.store.name,
      variant: 'Hub44',
    })
    const fallbackBannerUrl = getSeedAssetUrl('store-banner', storeSlug, {
      label: seedStore.store.name,
      variant: 'Loja aprovada',
    })

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
        logoUrl: fallbackLogoUrl,
        bannerUrl: fallbackBannerUrl,
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
          logoUrl: fallbackLogoUrl,
          bannerUrl: fallbackBannerUrl,
          status: 'approved',
          updatedAt: new Date(),
        },
      })
      .returning({ id: stores.id })

    const storeImageUrls = await getSeedStoreImageUrls({
      storeId: store.id,
      storeSlug,
      storeIndex,
      storeName: seedStore.store.name,
      storageFolder: seedStore.store.storageFolder,
    })

    await db
      .update(stores)
      .set({
        logoUrl: storeImageUrls.logoUrl,
        bannerUrl: storeImageUrls.bannerUrl,
        updatedAt: new Date(),
      })
      .where(eq(stores.id, store.id))

    await upsertStoreAddress(store.id, seedStore)

    for (const [productIndex, seedProduct] of seedStore.products.entries()) {
      const category = categoriesBySlug.get(seedProduct.categorySlug)

      if (!category) {
        throw new Error(`Missing seed category ${seedProduct.categorySlug}`)
      }

      const productSlug = createSlug(seedProduct.name)
      const fallbackProductImages = getFallbackProductImages(
        storeSlug,
        productSlug,
        seedProduct.name,
      )

      const [product] = await db
        .insert(products)
        .values({
          storeId: store.id,
          categoryId: category.id,
          name: seedProduct.name,
          slug: productSlug,
          description: seedProduct.description,
          priceInCents: seedProduct.priceInCents,
          stock: seedProduct.stock,
          imageUrl: fallbackProductImages[0]?.imageUrl,
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
            imageUrl: fallbackProductImages[0]?.imageUrl,
            status: 'active',
            updatedAt: new Date(),
          },
        })
        .returning({ id: products.id })

      const productImagesResult = await getSeedProductImages({
        storeId: store.id,
        storeName: seedStore.store.name,
        storeSlug,
        storeIndex,
        productId: product.id,
        productSlug,
        productIndex,
        productName: seedProduct.name,
        storageFolder: seedProduct.storageFolder,
        storeStorageFolder: seedStore.store.storageFolder,
      })

      if (seedStorageDebug) {
        console.info(
          `[seed:storage] ${seedStore.store.name} > ${seedProduct.name}: ${productImagesResult.images.map((image) => image.path).join(', ')}`,
        )
      }

      const [primaryImage] = productImagesResult.images

      if (primaryImage) {
        await db
          .update(products)
          .set({
            imageUrl: primaryImage.imageUrl,
            updatedAt: new Date(),
          })
          .where(eq(products.id, product.id))
      }

      await upsertProductImages({
        productId: product.id,
        images: productImagesResult.images,
      })

      productCount += 1
    }
  }

  console.info(
    `Seed concluido: ${seedCategories.length} categorias, ${seedStores.length} lojas e ${productCount} produtos com imagens.`,
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

async function upsertProductImages(input: {
  productId: string
  images: SeedImageReference[]
}) {
  await db
    .delete(productImages)
    .where(eq(productImages.productId, input.productId))

  for (const [index, image] of input.images.entries()) {
    const position = index + 1

    await db
      .insert(productImages)
      .values({
        productId: input.productId,
        path: image.path,
        imageUrl: image.imageUrl,
        position,
      })
      .onConflictDoUpdate({
        target: productImages.path,
        set: {
          productId: input.productId,
          imageUrl: image.imageUrl,
          position,
          updatedAt: new Date(),
        },
      })
  }
}

async function getSeedStoreImageUrls(input: {
  storeId: string
  storeSlug: string
  storeIndex: number
  storeName: string
  storageFolder?: string
}) {
  const logo = await findStoreStorageImage(input, 'logo')
  const banner = await findStoreStorageImage(input, 'banner')

  return {
    logoUrl:
      logo?.imageUrl ??
      getSeedAssetUrl('store-logo', input.storeSlug, {
        label: input.storeName,
        variant: 'Hub44',
      }),
    bannerUrl:
      banner?.imageUrl ??
      getSeedAssetUrl('store-banner', input.storeSlug, {
        label: input.storeName,
        variant: 'Loja aprovada',
      }),
  }
}

async function getSeedProductImages(input: {
  storeId: string
  storeName?: string
  storeSlug: string
  storeIndex: number
  productId: string
  productSlug: string
  productIndex: number
  productName: string
  storageFolder?: string
  storeStorageFolder?: string
}): Promise<{ images: SeedImageReference[]; source: 'storage' | 'fallback' }> {
  const storageImages = await findProductStorageImages(input)

  if (storageImages.length > 0) {
    return { images: storageImages, source: 'storage' }
  }

  return {
    images: getFallbackProductImages(
      input.storeSlug,
      input.productSlug,
      input.productName,
    ),
    source: 'fallback',
  }
}

async function findStoreStorageImage(
  input: {
    storeId: string
    storeSlug: string
    storeIndex: number
    storeName?: string
    storageFolder?: string
  },
  kind: 'logo' | 'banner',
) {
  const legacyStoreFolder =
    input.storageFolder ?? (await getLegacyStoreFolder(input.storeIndex))
  const candidateFolders = uniqueValues([
    input.storeSlug,
    input.storeName,
    legacyStoreFolder,
    input.storeId,
    `seed/${input.storeSlug}`,
  ])

  for (const folder of candidateFolders) {
    const files = await listStorageFolder(folder)
    const file = files.find(
      (item) =>
        item.name === kind ||
        item.name.startsWith(`${kind}.`) ||
        item.name.startsWith(`${kind}-`),
    )

    if (file) {
      const path = joinStoragePath(folder, file.name)

      return { path, imageUrl: getStoragePublicUrl(path) }
    }
  }

  return null
}

async function findProductStorageImages(input: {
  storeId: string
  storeName?: string
  storeSlug: string
  storeIndex: number
  productId: string
  productSlug: string
  productIndex: number
  productName?: string
  storageFolder?: string
  storeStorageFolder?: string
}) {
  const legacyStoreFolder =
    input.storeStorageFolder ?? (await getLegacyStoreFolder(input.storeIndex))
  const legacyProductFolder = legacyStoreFolder
    ? await getLegacyProductFolder(legacyStoreFolder, input.productIndex)
    : null

  const candidateFolders = uniqueValues([
    ...getExplicitProductFolderCandidates(input.storageFolder, {
      storeId: input.storeId,
      storeName: input.storeName,
      storeSlug: input.storeSlug,
      legacyStoreFolder,
    }),
    `${input.storeSlug}/products/${input.productSlug}`,
    input.productName
      ? `${input.storeSlug}/products/${input.productName}`
      : null,
    input.storeName ? `${input.storeName}/products/${input.productSlug}` : null,
    input.storeName && input.productName
      ? `${input.storeName}/products/${input.productName}`
      : null,
    `seed/${input.storeSlug}/products/${input.productSlug}`,
    `${input.storeId}/products/${input.productId}`,
    `${input.storeId}/products/${input.productSlug}`,
    input.productName ? `${input.storeId}/products/${input.productName}` : null,
    legacyProductFolder,
    legacyStoreFolder
      ? `${legacyStoreFolder}/products/${input.productId}`
      : null,
    legacyStoreFolder
      ? `${legacyStoreFolder}/products/${input.productSlug}`
      : null,
  ])

  for (const folder of candidateFolders) {
    const files = await listStorageFolder(folder)
    const images = files.filter(isStorageImageFile).sort(compareStorageFiles)

    if (images.length > 0) {
      return images.map((image) => {
        const path = joinStoragePath(folder, image.name)

        return { path, imageUrl: getStoragePublicUrl(path) }
      })
    }
  }

  return []
}

function getExplicitProductFolderCandidates(
  storageFolder: string | undefined,
  input: {
    storeId: string
    storeName?: string
    storeSlug: string
    legacyStoreFolder: string | null
  },
) {
  if (!storageFolder) {
    return []
  }

  const normalizedFolder = storageFolder.replace(/^\/+|\/+$/g, '')

  if (normalizedFolder.includes('/')) {
    return [normalizedFolder]
  }

  return uniqueValues([
    `${input.storeSlug}/products/${normalizedFolder}`,
    input.storeName ? `${input.storeName}/products/${normalizedFolder}` : null,
    `${input.storeId}/products/${normalizedFolder}`,
    input.legacyStoreFolder
      ? `${input.legacyStoreFolder}/products/${normalizedFolder}`
      : null,
  ])
}

async function getLegacyStoreFolder(storeIndex: number) {
  const rootItems = await listStorageFolder('')
  const storeFolders = rootItems
    .filter(isStorageDirectoryCandidate)
    .sort(compareStorageFiles)

  return storeFolders[storeIndex]?.name ?? null
}

async function getLegacyProductFolder(
  legacyStoreFolder: string,
  productIndex: number,
) {
  const productFolder = `${legacyStoreFolder}/products`
  const productFolders = (await listStorageFolder(productFolder))
    .filter(isStorageDirectoryCandidate)
    .sort(compareStorageFiles)
  const legacyProductFolder = productFolders[productIndex]?.name

  return legacyProductFolder ? `${productFolder}/${legacyProductFolder}` : null
}

async function listStorageFolder(folder: string) {
  const normalizedFolder = folder.replace(/^\/+|\/+$/g, '')

  if (storageFolderCache.has(normalizedFolder)) {
    return storageFolderCache.get(normalizedFolder) ?? []
  }

  const { data, error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .list(normalizedFolder, {
      limit: 100,
      sortBy: { column: 'name', order: 'asc' },
    })

  if (error) {
    if (!missingStorageFolders.has(normalizedFolder)) {
      console.warn(
        `Nao foi possivel listar imagens do Supabase em "${normalizedFolder}": ${error.message}`,
      )
      missingStorageFolders.add(normalizedFolder)
    }

    storageFolderCache.set(normalizedFolder, [])
    return []
  }

  const files: StorageListItem[] = (data ?? [])
    .filter(
      (item) => Boolean(item.name) && item.name !== '.emptyFolderPlaceholder',
    )
    .map((item) => ({
      id: item.id,
      name: item.name,
      metadata: item.metadata,
    }))

  storageFolderCache.set(normalizedFolder, files)

  return files
}

function isStorageDirectoryCandidate(item: StorageListItem) {
  return !item.id && item.name !== 'seed' && !isStorageImageFile(item)
}

function isStorageImageFile(item: StorageListItem) {
  const mimetype = getStorageMimetype(item.metadata)

  if (mimetype?.startsWith('image/')) {
    return true
  }

  if (/\.(avif|gif|jpe?g|png|svg|webp)$/i.test(item.name)) {
    return true
  }

  return Boolean(item.id)
}

function getStorageMimetype(metadata: unknown) {
  if (!metadata || typeof metadata !== 'object' || !('mimetype' in metadata)) {
    return null
  }

  const { mimetype } = metadata as { mimetype?: unknown }

  return typeof mimetype === 'string' ? mimetype.toLowerCase() : null
}

function compareStorageFiles(left: StorageListItem, right: StorageListItem) {
  return left.name.localeCompare(right.name, 'pt-BR', { numeric: true })
}

function getStoragePublicUrl(path: string) {
  const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path)

  return data.publicUrl
}

function joinStoragePath(folder: string, name: string) {
  const normalizedFolder = folder.replace(/^\/+|\/+$/g, '')
  const normalizedName = name.replace(/^\/+/g, '')

  return normalizedFolder
    ? `${normalizedFolder}/${normalizedName}`
    : normalizedName
}

function uniqueValues(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))]
}

function getFallbackProductImages(
  storeSlug: string,
  productSlug: string,
  productName: string,
): SeedImageReference[] {
  return [
    {
      path: `${getFallbackProductImagePathPrefix(storeSlug, productSlug)}1.svg`,
      imageUrl: getSeedAssetUrl('product', `${productSlug}-principal`, {
        label: productName,
        variant: 'Produto',
      }),
    },
    {
      path: `${getFallbackProductImagePathPrefix(storeSlug, productSlug)}2.svg`,
      imageUrl: getSeedAssetUrl('product', `${productSlug}-detalhe`, {
        label: productName,
        variant: 'Detalhe',
      }),
    },
  ]
}

function getFallbackProductImagePathPrefix(
  storeSlug: string,
  productSlug: string,
) {
  return `seed/${storeSlug}/products/${productSlug}/`
}

function getSeedAssetUrl(
  kind: 'store-logo' | 'store-banner' | 'product',
  slug: string,
  query: { label: string; variant: string },
) {
  const params = new URLSearchParams(query)

  return `/seed/images/${kind}/${slug}.svg?${params.toString()}`
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })
